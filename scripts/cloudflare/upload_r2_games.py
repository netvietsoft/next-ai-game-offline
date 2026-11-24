"""Upload R2 có thể tiếp tục, không ghi đè / Resumable R2 upload without overwriting objects."""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


class UploadError(Exception):
    """Lỗi đã làm sạch để không lộ secret / Sanitized operational error without secrets."""


@dataclass(frozen=True)
class Package:
    """Gói đã xác minh cục bộ / Locally verified package."""
    name: str
    path: Path
    size: int
    sha256: str

    @property
    def key(self) -> str:
        """Giữ prefix ứng dụng / Preserve the application object prefix."""
        return f"games/{self.name}.zip"


def file_sha256(path: Path) -> str:
    """Hash streaming, không tải cả ZIP vào RAM / Hash a ZIP without loading it into memory."""
    with path.open("rb") as source:
        return hashlib.file_digest(source, "sha256").hexdigest()


def preflight(root: Path) -> tuple[list[Package], str]:
    """Kiểm tra TẤT CẢ file trước request mạng / Verify ALL files before any network request."""
    manifest_path = root / "Android/src/main/assets/r2_game_integrity.json"
    raw = manifest_path.read_bytes()
    try:
        manifest = json.loads(raw)
        games = manifest["games"]
        if manifest["schemaVersion"] != 1 or manifest["gameCount"] != 319 or len(games) != 319:
            raise ValueError()
    except (KeyError, TypeError, ValueError):
        raise UploadError("Invalid or incomplete Android integrity manifest.") from None
    packages: list[Package] = []
    names: set[str] = set()
    for game in games:
        name, size, digest = game.get("name"), game.get("sizeBytes"), game.get("sha256")
        if not isinstance(name, str) or not re.fullmatch(r"[a-z0-9_]+", name) or name in names:
            raise UploadError("Unsafe or duplicate game identifier in manifest.")
        if type(size) is not int or not 0 < size <= 128 * 1024 * 1024:
            raise UploadError(f"Invalid package size: {name}")
        if not isinstance(digest, str) or not re.fullmatch(r"[a-f0-9]{64}", digest):
            raise UploadError(f"Invalid package hash: {name}")
        names.add(name)
        path = root / "R2_Upload/packages" / f"{name}.zip"
        if not path.is_file() or path.stat().st_size != size or file_sha256(path) != digest:
            raise UploadError(f"Local package does not match Android manifest: {name}")
        packages.append(Package(name, path, size, digest))
    return packages, hashlib.sha256(raw).hexdigest()


def read_config(path: Path) -> dict[str, str]:
    """JSON chỉ là dữ liệu, không in credential / Treat JSON only as data and never print credentials."""
    fields = {
        "accountId": "CLOUDFLARE_R2_ACCOUNT_ID", "accessKeyId": "CLOUDFLARE_R2_ACCESS_KEY_ID",
        "secretAccessKey": "CLOUDFLARE_R2_SECRET_ACCESS_KEY", "bucket": "CLOUDFLARE_R2_BUCKET",
        "publicBaseUrl": "CLOUDFLARE_R2_PUBLIC_BASE_URL",
    }
    try:
        supplied = json.loads(path.read_text(encoding="utf-8-sig")) if path.exists() else {}
        if not isinstance(supplied, dict):
            raise ValueError()
    except (OSError, ValueError):
        raise UploadError("R2 local configuration cannot be read as JSON.") from None
    config: dict[str, str] = {}
    for field, env in fields.items():
        value = supplied.get(field) or os.environ.get(env)
        if not isinstance(value, str) or not value.strip():
            raise UploadError(f"R2 setting missing or invalid: {field}")
        config[field] = value.strip()
    if not re.fullmatch(r"[a-fA-F0-9]{32}", config["accountId"]):
        raise UploadError("Invalid Cloudflare account ID.")
    if not re.fullmatch(r"[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]", config["bucket"]):
        raise UploadError("Invalid R2 bucket name.")
    try:
        uri = urlsplit(config["publicBaseUrl"])
        valid = (uri.scheme == "https" and uri.hostname and uri.path.rstrip("/") == "/games"
                 and not uri.username and not uri.password and not uri.query and not uri.fragment
                 and uri.port in (None, 443) and "*" not in uri.netloc)
    except ValueError:
        valid = False
    if not valid:
        raise UploadError("publicBaseUrl must be https://<public-host>/games without credentials or query.")
    config["publicBaseUrl"] = config["publicBaseUrl"].rstrip("/")
    return config


def make_client(config: dict[str, str], workers: int):
    """Một client pool, credential truyền riêng / One connection pool with explicit isolated credentials."""
    try:
        import boto3
        from botocore.config import Config
    except ImportError:
        raise UploadError("Install scripts/cloudflare/r2-requirements.txt in the ignored .ai/r2-tools venv.") from None
    return boto3.session.Session().client(
        "s3", endpoint_url=f"https://{config['accountId']}.r2.cloudflarestorage.com", region_name="auto",
        aws_access_key_id=config["accessKeyId"], aws_secret_access_key=config["secretAccessKey"],
        config=Config(connect_timeout=15, read_timeout=90, max_pool_connections=workers + 2,
                      retries={"mode": "standard", "total_max_attempts": 5},
                      request_checksum_calculation="when_required", response_checksum_validation="when_required"),
    )


def error_code(error: Exception) -> str:
    """Chỉ lấy mã lỗi dịch vụ, không nội dung secret / Extract only service error codes, never secret-bearing messages."""
    response = getattr(error, "response", {})
    return str(response.get("Error", {}).get("Code", "unknown"))


def remote_head(client, bucket: str, key: str):
    """Chỉ 404 là chưa có, mọi lỗi khác dừng / Only 404 means absent; other errors stop."""
    try:
        return client.head_object(Bucket=bucket, Key=key)
    except Exception as error:
        if error_code(error) in ("404", "NoSuchKey", "NotFound"):
            return None
        raise UploadError(f"R2 HEAD failed for {key}; check access and network.") from None


def remote_matches(head, package: Package) -> bool:
    """So khớp kích thước và hash metadata / Compare size and hash metadata."""
    return head is not None and head.get("ContentLength") == package.size and head.get("Metadata", {}).get("sha256") == package.sha256


def upload_one(client, bucket: str, package: Package) -> str:
    """Resume bằng HEAD, không ghi đè kể cả race / Resume using HEAD and forbid overwrites even during races."""
    head = remote_head(client, bucket, package.key)
    if remote_matches(head, package):
        return "skipped"
    if head is not None:
        raise UploadError(f"Existing R2 object differs: {package.name}; refusing overwrite.")
    try:
        with package.path.open("rb") as body:
            client.put_object(Bucket=bucket, Key=package.key, Body=body, ContentLength=package.size,
                              ContentType="application/zip", CacheControl="public,max-age=300,must-revalidate",
                              Metadata={"sha256": package.sha256}, IfNoneMatch="*")
    except Exception as error:
        if error_code(error) in ("412", "PreconditionFailed") and remote_matches(remote_head(client, bucket, package.key), package):
            return "skipped"
        raise UploadError(f"R2 PUT failed for {package.name}; no overwrite attempted.") from None
    if not remote_matches(remote_head(client, bucket, package.key), package):
        raise UploadError(f"R2 metadata verification failed: {package.name}")
    return "uploaded"


class NoRedirect(HTTPRedirectHandler):
    """Android từ chối chuyển hướng; verifier cũng vậy / Match Android's redirect rejection."""
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def verify_public(package: Package, base_url: str, opener_factory=None, sleeper=time.sleep) -> str:
    """Tải streaming/hash public; retry lỗi tạm, không redirect / Stream/hash public bytes, retry transient errors only."""
    if opener_factory is None:
        opener_factory = lambda: build_opener(NoRedirect())
    # Tự nhận diện verifier thật, không giả lập trình duyệt / Identify the actual verifier rather than impersonating a browser.
    request = Request(f"{base_url}/{package.name}.zip", headers={
        "Accept-Encoding": "identity", "User-Agent": "NextAIGameOffline-DeploymentVerifier/1.0",
    })
    for attempt in range(3):
        try:
            with opener_factory().open(request, timeout=90) as response:
                if response.status != 200:
                    raise UploadError(f"Public HTTP status not 200: {package.name}")
                if response.headers.get("Content-Encoding", "identity") != "identity":
                    raise UploadError(f"Public object is unexpectedly encoded: {package.name}")
                declared = response.headers.get("Content-Length")
                if declared is not None and declared != str(package.size):
                    raise UploadError(f"Public Content-Length mismatch: {package.name}")
                digest = hashlib.sha256()
                count = 0
                while chunk := response.read(128 * 1024):
                    count += len(chunk)
                    if count > package.size:
                        raise UploadError(f"Public object exceeds expected size: {package.name}")
                    digest.update(chunk)
                if count != package.size or digest.hexdigest() != package.sha256:
                    raise UploadError(f"Public SHA-256 verification failed: {package.name}")
                return "public_verified"
        except HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 2:
                raise UploadError(f"Public HTTP {error.code} for {package.name}; check public access.") from None
        except (URLError, TimeoutError, OSError):
            if attempt == 2:
                raise UploadError(f"Public network verification failed: {package.name}") from None
        sleeper(2 ** (attempt + 1))
    raise UploadError(f"Public verification failed: {package.name}")


def checkpoint(path: Path, state: dict) -> None:
    """Atomic checkpoint không secret, riêng file PS / Atomic secret-free checkpoint separate from PowerShell's file."""
    state["updatedUtc"] = datetime.now(timezone.utc).isoformat()
    temporary = path.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(state, indent=2), encoding="utf-8")
    os.replace(temporary, path)


def restore_bucket_receipt(path: Path, state: dict, package_count: int) -> None:
    """Giữ kết quả bucket đúng đích khi chỉ kiểm public / Retain matching bucket results during a public-only retry."""
    if not path.exists():
        return
    try:
        previous = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        raise UploadError("Existing checkpoint is unreadable; preserve it before retrying public verification.") from None
    identity = ("manifestSha256", "bucket", "accountId", "publicBaseUrl")
    if any(previous.get(key) != state[key] for key in identity):
        return
    counts = ("uploaded", "skipped", "bucket_verified")
    if any(type(previous.get(key)) is not int or not 0 <= previous[key] <= package_count for key in counts):
        raise UploadError("Existing bucket receipt contains invalid counters.")
    if previous["uploaded"] + previous["skipped"] != previous["bucket_verified"]:
        raise UploadError("Existing bucket receipt counters do not match.")
    for key in counts:
        state[key] = previous[key]
    state["startedUtc"] = previous.get("startedUtc", state["startedUtc"])


def run_parallel(packages, worker, workers, state, state_path, phase) -> None:
    """Giới hạn concurrency; ghi checkpoint chỉ tại luồng chính / Bound concurrency; checkpoint only on main thread."""
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(worker, package): package for package in packages}
        try:
            for future in as_completed(futures):
                package = futures[future]
                outcome = future.result()
                state[outcome] += 1
                state["lastGame"] = package.name
                if phase == "bucket":
                    state["bucket_verified"] += 1
                checkpoint(state_path, state)
                count = state["bucket_verified"] if phase == "bucket" else state["public_verified"]
                print(f"{phase}: {count}/{len(packages)} {package.name} ({outcome})", flush=True)
        except BaseException:
            for future in futures:
                future.cancel()
            # In-flight operations finish during pool shutdown; rerun checks them again with HEAD.
            # Request đang chạy hoàn tất trước khi thoát; lần sau HEAD sẽ xác minh lại.
            raise


def main(argv=None) -> int:
    """Điểm vào CLI, không in thông tin xác thực / CLI entry point without credential output."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-root", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--config", type=Path)
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--skip-public-verification", action="store_true")
    parser.add_argument("--public-only", action="store_true")
    parser.add_argument("--workers", type=int, choices=range(1, 5), default=4)
    args = parser.parse_args(argv)
    state = state_path = None
    checkpoint_owned = False
    try:
        root = args.project_root.resolve()
        packages, manifest_hash = preflight(root)
        print(f"Preflight PASS: {len(packages)} packages, {sum(p.size for p in packages)} bytes", flush=True)
        if args.validate_only:
            return 0
        if args.public_only and args.skip_public_verification:
            raise UploadError("--public-only conflicts with --skip-public-verification.")
        config = read_config(args.config or root / ".ai/r2.local.json")
        state_path = root / "R2_Upload/upload-state-python.json"
        state = dict(status="running", manifestSha256=manifest_hash, uploaded=0, skipped=0,
                     bucket_verified=0, public_verified=0, lastGame=None,
                     startedUtc=datetime.now(timezone.utc).isoformat(), bucket=config["bucket"],
                     accountId=config["accountId"], publicBaseUrl=config["publicBaseUrl"], lastError=None)
        if args.public_only:
            restore_bucket_receipt(state_path, state, len(packages))
        checkpoint(state_path, state)
        checkpoint_owned = True
        if not args.public_only:
            client = make_client(config, args.workers)
            try:
                client.head_bucket(Bucket=config["bucket"])
            except Exception:
                raise UploadError("R2 bucket check failed; verify credentials and bucket access.") from None
            run_parallel(packages, lambda p: upload_one(client, config["bucket"], p), args.workers, state, state_path, "bucket")
        if not args.skip_public_verification:
            run_parallel(packages, lambda p: verify_public(p, config["publicBaseUrl"]), min(2, args.workers), state, state_path, "public")
        state["status"] = "bucket_verified_public_pending" if args.skip_public_verification else "public_verified"
        checkpoint(state_path, state)
        print(f"Complete: {state['status']}", flush=True)
        return 0
    except (UploadError, OSError, KeyboardInterrupt) as error:
        if state is not None and checkpoint_owned:
            state["status"] = "failed"
            state["lastError"] = str(error) if isinstance(error, UploadError) else type(error).__name__
            checkpoint(state_path, state)
        print(f"ERROR: {error if isinstance(error, UploadError) else type(error).__name__}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
