"""Kiểm thử uploader không kết nối mạng / Offline uploader regression tests."""
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from urllib.error import HTTPError

spec = importlib.util.spec_from_file_location("r2_uploader", Path(__file__).with_name("upload_r2_games.py"))
upload = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = upload
spec.loader.exec_module(upload)


class FakeError(Exception):
    """Mô phỏng mã S3 / Simulate an S3 error code."""
    def __init__(self, code):
        self.response = {"Error": {"Code": code}}


class FakeS3:
    """In-memory S3; không bao giờ gửi request / In-memory S3 with no network requests."""
    def __init__(self):
        self.objects = {}
        self.puts = 0
        self.fail_head = None

    def head_object(self, Bucket, Key):
        if self.fail_head:
            raise FakeError(self.fail_head)
        if Key not in self.objects:
            raise FakeError("404")
        return self.objects[Key]

    def put_object(self, **kwargs):
        if kwargs["IfNoneMatch"] != "*":
            raise AssertionError("Missing conditional create")
        if kwargs["Key"] in self.objects:
            raise FakeError("412")
        body = kwargs["Body"].read()
        assert len(body) == kwargs["ContentLength"]
        assert kwargs["ContentType"] == "application/zip"
        assert kwargs["CacheControl"] == "public,max-age=300,must-revalidate"
        self.puts += 1
        self.objects[kwargs["Key"]] = {"ContentLength": len(body), "Metadata": kwargs["Metadata"]}


class FakeResponse(io.BytesIO):
    """HTTP stream giả / Fake HTTP stream."""
    def __init__(self, body, **headers):
        super().__init__(body)
        self.status = 200
        self.headers = headers


class FakeOpener:
    """Giữ chuỗi kết quả public / Supplies public response sequences."""
    def __init__(self, responses):
        self.responses = iter(responses)
        self.calls = 0

    def open(self, request, timeout):
        self.calls += 1
        assert request.get_header("Accept-encoding") == "identity"
        assert request.get_header("User-agent") == "NextAIGameOffline-DeploymentVerifier/1.0"
        response = next(self.responses)
        if isinstance(response, Exception):
            raise response
        return response


class UploadTests(unittest.TestCase):
    """Kiểm chứng lỗi/tiếp tục/integrity thật / Verify errors, resume and actual integrity enforcement."""
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="nextai-r2-python-test-")
        self.root = Path(self.temp.name)
        (self.root / "R2_Upload/packages").mkdir(parents=True)
        (self.root / "Android/src/main/assets").mkdir(parents=True)
        self.payload = b"verified package bytes"
        self.digest = hashlib.sha256(self.payload).hexdigest()
        self.manifest = {"schemaVersion": 1, "gameCount": 319, "games": []}
        for i in range(319):
            name = f"game_{i}"
            path = self.root / "R2_Upload/packages" / f"{name}.zip"
            path.write_bytes(self.payload)
            self.manifest["games"].append({"name": name, "sizeBytes": len(self.payload), "sha256": self.digest})
        self.manifest_path = self.root / "Android/src/main/assets/r2_game_integrity.json"
        self.manifest_path.write_text(json.dumps(self.manifest))
        self.package = upload.Package("game_0", self.root / "R2_Upload/packages/game_0.zip", len(self.payload), self.digest)

    def tearDown(self):
        self.temp.cleanup()

    def test_preflight_catches_final_file_corruption_before_network(self):
        packages, digest = upload.preflight(self.root)
        self.assertEqual(len(packages), 319)
        self.assertEqual(len(digest), 64)
        final = self.root / "R2_Upload/packages/game_318.zip"
        final.write_bytes(b"x" * len(self.payload))
        with self.assertRaisesRegex(upload.UploadError, "game_318"):
            upload.preflight(self.root)

    def test_duplicate_identifier_rejected(self):
        self.manifest["games"][-1] = self.manifest["games"][0]
        self.manifest_path.write_text(json.dumps(self.manifest))
        with self.assertRaisesRegex(upload.UploadError, "duplicate"):
            upload.preflight(self.root)

    def test_resume_and_no_overwrite(self):
        client = FakeS3()
        self.assertEqual(upload.upload_one(client, "bucket", self.package), "uploaded")
        self.assertEqual(upload.upload_one(client, "bucket", self.package), "skipped")
        self.assertEqual(client.puts, 1)
        client.objects[self.package.key]["Metadata"] = {"sha256": "wrong"}
        with self.assertRaisesRegex(upload.UploadError, "refusing overwrite"):
            upload.upload_one(client, "bucket", self.package)
        self.assertEqual(client.puts, 1)

    def test_permission_failure_is_not_missing(self):
        client = FakeS3()
        client.fail_head = "403"
        with self.assertRaisesRegex(upload.UploadError, "HEAD failed"):
            upload.upload_one(client, "bucket", self.package)
        self.assertEqual(client.puts, 0)

    def test_race_conditional_put_does_not_overwrite(self):
        client = FakeS3()
        original = client.put_object
        def racing_put(**kwargs):
            client.objects[kwargs["Key"]] = {"ContentLength": len(self.payload), "Metadata": {"sha256": self.digest}}
            original(**kwargs)
        client.put_object = racing_put
        self.assertEqual(upload.upload_one(client, "bucket", self.package), "skipped")
        self.assertEqual(client.puts, 0)

    def test_public_bytes_must_match(self):
        good = FakeOpener([FakeResponse(self.payload)])
        self.assertEqual(upload.verify_public(self.package, "https://pub-test.r2.dev/games", lambda: good), "public_verified")
        bad = FakeOpener([FakeResponse(b"x" * len(self.payload))])
        with self.assertRaisesRegex(upload.UploadError, "SHA-256"):
            upload.verify_public(self.package, "https://pub-test.r2.dev/games", lambda: bad)

    def test_public_oversize_stops_and_redirect_rejected(self):
        oversized = FakeOpener([FakeResponse(self.payload + b"x")])
        with self.assertRaisesRegex(upload.UploadError, "exceeds"):
            upload.verify_public(self.package, "https://pub-test.r2.dev/games", lambda: oversized)
        redirect = FakeOpener([HTTPError("https://test/", 302, "Found", {}, None)])
        with self.assertRaisesRegex(upload.UploadError, "302"):
            upload.verify_public(self.package, "https://pub-test.r2.dev/games", lambda: redirect)
        self.assertIsNone(upload.NoRedirect().redirect_request(None, None, 302, "Found", {}, "https://other/"))

    def test_rate_limit_retries_then_succeeds(self):
        opener = FakeOpener([HTTPError("https://test/", 429, "Limited", {}, None), FakeResponse(self.payload)])
        delays = []
        self.assertEqual(upload.verify_public(self.package, "https://pub-test.r2.dev/games", lambda: opener, delays.append), "public_verified")
        self.assertEqual(opener.calls, 2)
        self.assertEqual(delays, [2])

    def test_config_and_checkpoint_are_secret_safe(self):
        config = {"accountId": "a" * 32, "accessKeyId": "test-access", "secretAccessKey": "test-secret",
                  "bucket": "test-bucket", "publicBaseUrl": "https://pub-test.r2.dev/games"}
        config_path = self.root / "config.json"
        config_path.write_text(json.dumps(config))
        self.assertEqual(upload.read_config(config_path), config)
        config["publicBaseUrl"] = "https://name:secret@pub-test.r2.dev/games"
        config_path.write_text(json.dumps(config))
        with self.assertRaisesRegex(upload.UploadError, "publicBaseUrl"):
            upload.read_config(config_path)
        output = self.root / "checkpoint.json"
        upload.checkpoint(output, {"status": "running", "uploaded": 1})
        upload.checkpoint(output, {"status": "public_verified", "uploaded": 2})
        self.assertEqual(json.loads(output.read_text())["uploaded"], 2)
        self.assertFalse(output.with_suffix(".json.tmp").exists())

    def test_public_only_preserves_matching_bucket_receipt(self):
        path = self.root / "receipt.json"
        prior = dict(manifestSha256=self.digest, bucket="test-bucket", accountId="a" * 32,
                     publicBaseUrl="https://pub-test.r2.dev/games", uploaded=221, skipped=98,
                     bucket_verified=319, public_verified=0, startedUtc="original-start")
        path.write_text(json.dumps(prior))
        current = dict(prior, uploaded=0, skipped=0, bucket_verified=0, startedUtc="retry-start")
        upload.restore_bucket_receipt(path, current, 319)
        self.assertEqual((current["uploaded"], current["skipped"], current["bucket_verified"]), (221, 98, 319))
        self.assertEqual(current["startedUtc"], "original-start")
        different = dict(current, bucket="different", uploaded=0, skipped=0, bucket_verified=0)
        upload.restore_bucket_receipt(path, different, 319)
        self.assertEqual(different["bucket_verified"], 0)


if __name__ == "__main__":
    unittest.main()
