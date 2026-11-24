"""
Hoán đổi an toàn 8 game R2 hot nhất vào gói Bundled APK và đẩy 8 game Bundled cuối bảng lên R2.
Safely swaps the 8 hottest R2 games into bundled Android assets while uploading the 8 lowest-usage
bundled games to Cloudflare R2 and verifying HTTP 200 + SHA-256 before removing local assets.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
from urllib.request import Request, urlopen
import zipfile

ROOT = Path(__file__).resolve().parent.parent
ASSETS_GAMES = ROOT / "Android/src/main/assets/games"
CATALOG_PATH = ROOT / "Android/src/main/assets/games_catalog_full_419_r2.json"
INTEGRITY_PATH = ROOT / "Android/src/main/assets/r2_game_integrity.json"
R2_GAMES_DIR = ROOT / "R2_Upload/games"
R2_PACKAGES_DIR = ROOT / "R2_Upload/packages"
R2_CONFIG_PATH = ROOT / ".ai/r2.local.json"
PUBLIC_BASE_URL = "https://pub-087272be70054d98a65246778849e2d0.r2.dev/games"

FORBIDDEN_EXTS = {".dex", ".jar", ".so", ".apk", ".aab", ".class"}

INCOMING_HOT_R2: tuple[str, ...] = (
    "among_us",
    "archers_random",
    "abalone",
    "block_pictures",
    "ball_8_pool",
    "tanks_battle",
    "animal_clicker",
    "angry_heroes",
)

OUTGOING_LOW_BUNDLED: tuple[str, ...] = (
    "physics_box",
    "merge_2048",
    "merge_cards_vintage",
    "merge_cards",
    "number_tiles",
    "hexa_word",
    "skip_card",
    "nonogram",
)


def sha256_file(path: Path) -> str:
    """Tính SHA-256 dạng hex chữ thường / Compute lowercase hex SHA-256."""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_r2_config() -> dict[str, str]:
    """Đọc cấu hình R2 cục bộ không in secret / Load local R2 settings without printing secrets."""
    raw = json.loads(R2_CONFIG_PATH.read_text(encoding="utf-8-sig"))
    required = ("accountId", "accessKeyId", "secretAccessKey", "bucket", "publicBaseUrl")
    for key in required:
        if not isinstance(raw.get(key), str) or not raw[key].strip():
            raise RuntimeError(f"Missing R2 config field: {key}")
    return {key: raw[key].strip() for key in required}


def package_game_dir(game_name: str, src_dir: Path, zip_path: Path) -> dict[str, object]:
    """Đóng gói thư mục game chuẩn POSIX `/` và kiểm tra an toàn trước khi upload."""
    if not (src_dir / "index.html").is_file():
        raise RuntimeError(f"Missing index.html in {src_dir}")

    files = sorted(p for p in src_dir.rglob("*") if p.is_file())
    extracted_size = 0
    zip_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_zip = zip_path.with_suffix(".zip.tmp")

    with zipfile.ZipFile(tmp_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for item in files:
            ext = item.suffix.lower()
            if ext in FORBIDDEN_EXTS:
                raise RuntimeError(f"Forbidden file extension in {game_name}: {item.name}")
            rel = item.relative_to(src_dir).as_posix()
            zf.write(item, arcname=rel)
            extracted_size += item.stat().st_size

    tmp_zip.replace(zip_path)
    return {
        "name": game_name,
        "sizeBytes": zip_path.stat().st_size,
        "sha256": sha256_file(zip_path),
        "extractedSizeBytes": extracted_size,
        "fileCount": len(files),
    }


def upload_and_verify_public(config: dict[str, str], entries: list[dict[str, object]]) -> None:
    """Đẩy các gói ZIP lên R2 bằng boto3 và kiểm tra public GET 200 + SHA-256."""
    import boto3
    from botocore.config import Config

    client = boto3.session.Session().client(
        "s3",
        endpoint_url=f"https://{config['accountId']}.r2.cloudflarestorage.com",
        region_name="auto",
        aws_access_key_id=config["accessKeyId"],
        aws_secret_access_key=config["secretAccessKey"],
        config=Config(connect_timeout=15, read_timeout=90, retries={"mode": "standard"}),
    )

    public_base = config["publicBaseUrl"].rstrip("/")
    for entry in entries:
        name = str(entry["name"])
        zip_path = R2_PACKAGES_DIR / f"{name}.zip"
        key = f"games/{name}.zip"
        with zip_path.open("rb") as payload:
            client.put_object(
                Bucket=config["bucket"],
                Key=key,
                Body=payload,
                ContentType="application/zip",
                CacheControl="public, max-age=31536000, immutable",
            )
        public_url = f"{public_base}/{name}.zip"
        req = Request(public_url, headers={"User-Agent": "NextAI-SwapVerify/1.0"})
        with urlopen(req, timeout=30) as resp:
            if resp.status != 200:
                raise RuntimeError(f"Public GET failed for {name}: HTTP {resp.status}")
            remote_bytes = resp.read()
        remote_sha = hashlib.sha256(remote_bytes).hexdigest()
        if remote_sha != entry["sha256"]:
            raise RuntimeError(f"SHA-256 mismatch on public R2 for {name}")
        print(f"  [R2 OK] {name}.zip ({len(remote_bytes):,} bytes, SHA verified)")


def extract_verified_incoming(integrity_by_name: dict[str, dict[str, object]]) -> None:
    """Xác minh SHA-256 và giải nén 8 game R2 hot vào `Android/src/main/assets/games/`."""
    for name in INCOMING_HOT_R2:
        zip_path = R2_PACKAGES_DIR / f"{name}.zip"
        if not zip_path.is_file():
            raise RuntimeError(f"Missing local R2 package: {zip_path}")
        expected = integrity_by_name.get(name)
        if expected and sha256_file(zip_path) != expected["sha256"]:
            raise RuntimeError(f"Incoming package SHA-256 mismatch: {name}")

        dest_dir = ASSETS_GAMES / name
        if dest_dir.exists():
            shutil.rmtree(dest_dir)
        dest_dir.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(zip_path, "r") as zf:
            for member in zf.infolist():
                normalized = member.filename.replace("\\", "/")
                if normalized.startswith("/") or ".." in normalized.split("/"):
                    raise RuntimeError(f"Unsafe zip entry in {name}: {normalized}")
                if member.is_dir():
                    (dest_dir / normalized).mkdir(parents=True, exist_ok=True)
                    continue
                target = dest_dir / normalized
                target.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(member, "r") as src, target.open("wb") as dst:
                    shutil.copyfileobj(src, dst)
        if not (dest_dir / "index.html").is_file():
            raise RuntimeError(f"Extracted game missing index.html: {name}")
        print(f"  [BUNDLED] Extracted {name} into assets/games/{name}")


def update_catalog_and_integrity(outgoing_entries: list[dict[str, object]]) -> None:
    """Cập nhật đồng bộ `r2_game_integrity.json` (319 gói) và `games_catalog_full_419_r2.json`."""
    integrity = json.loads(INTEGRITY_PATH.read_text(encoding="utf-8"))
    remaining = [g for g in integrity["games"] if g["name"] not in set(INCOMING_HOT_R2)]
    existing_names = {g["name"] for g in remaining}
    for entry in outgoing_entries:
        if entry["name"] not in existing_names:
            remaining.append(entry)
    remaining.sort(key=lambda item: str(item["name"]))
    if len(remaining) != 319:
        raise RuntimeError(f"Expected 319 integrity entries, got {len(remaining)}")
    integrity["gameCount"] = len(remaining)
    integrity["games"] = remaining
    INTEGRITY_PATH.write_text(json.dumps(integrity, indent=2) + "\n", encoding="utf-8")

    outgoing_map = {str(e["name"]): e for e in outgoing_entries}
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    by_name = {g["name"]: g for g in catalog}

    # Cập nhật trạng thái bundled/remote cho 16 game hoán đổi.
    # Update bundled/remote flags for the 16 swapped games.
    for name in INCOMING_HOT_R2:
        item = by_name[name]
        item["isDownloaded"] = 1
        item["remoteUrl"] = ""
    for name in OUTGOING_LOW_BUNDLED:
        item = by_name[name]
        meta = outgoing_map[name]
        size_mb = max(0.1, round(int(meta["sizeBytes"]) / (1024 * 1024), 2))
        item["isDownloaded"] = 0
        item["sizeMb"] = size_mb
        item["remoteUrl"] = f"{PUBLIC_BASE_URL}/{name}.zip"

    # Xây lại thứ tự position 1..419:
    # - #1..#15 giữ nguyên Top 15 Bundled hiện hành
    # - #16..#23 đưa ngay 8 game R2 hot mới vào Bundled (nên #1..#30 vẫn 100% Bundled!)
    # - #24..#100 các game Bundled còn lại giữ nguyên thứ tự GA4 cũ
    # - #101..#419 nhóm game R2 (đặt 8 game vừa chuyển sang R2 ở cuối nhóm đầu hoặc theo thứ tự)
    sorted_old = sorted(catalog, key=lambda g: int(g["position"]))
    top15 = [g for g in sorted_old[:15] if g["name"] not in set(INCOMING_HOT_R2)]
    incoming_objs = [by_name[name] for name in INCOMING_HOT_R2]
    chosen = {g["name"] for g in top15} | set(INCOMING_HOT_R2)
    other_bundled = [
        g for g in sorted_old if g["name"] not in chosen and int(g["isDownloaded"]) == 1
    ]
    remotes = [
        g for g in sorted_old if g["name"] not in chosen and int(g["isDownloaded"]) == 0
    ]
    reordered = top15 + incoming_objs + other_bundled + remotes
    if len(reordered) != 419:
        raise RuntimeError(f"Expected 419 games after reorder, got {len(reordered)}")

    for idx, game in enumerate(reordered, start=1):
        game["position"] = idx
        game["eachNLevels"] = 2

    CATALOG_PATH.write_text(json.dumps(reordered, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    bundled_count = sum(1 for g in reordered if g["isDownloaded"] == 1)
    top30_bundled = sum(1 for g in reordered[:30] if g["isDownloaded"] == 1)
    print(f"  [CATALOG OK] total=419 bundled={bundled_count} top30_bundled={top30_bundled}/30")


def main() -> None:
    parser = argparse.ArgumentParser(description="Swap 8 hottest R2 games into bundled APK safely.")
    parser.add_argument("--apply", action="store_true", help="Execute upload, swap, and catalog updates.")
    args = parser.parse_args()

    integrity = json.loads(INTEGRITY_PATH.read_text(encoding="utf-8"))
    integrity_by_name = {g["name"]: g for g in integrity["games"]}

    print(f"Mode: {'APPLY' if args.apply else 'DRY-RUN'}")
    print(f"Incoming 8 R2 -> Bundled : {', '.join(INCOMING_HOT_R2)}")
    print(f"Outgoing 8 Bundled -> R2 : {', '.join(OUTGOING_LOW_BUNDLED)}")

    if not args.apply:
        for name in OUTGOING_LOW_BUNDLED:
            assert (ASSETS_GAMES / name / "index.html").is_file(), f"Missing bundled {name}"
        for name in INCOMING_HOT_R2:
            assert (R2_PACKAGES_DIR / f"{name}.zip").is_file(), f"Missing R2 zip {name}"
        print("Dry-run preflight PASSED. Run with --apply to execute.")
        return

    config = load_r2_config()
    outgoing_entries: list[dict[str, object]] = []
    for name in OUTGOING_LOW_BUNDLED:
        src_dir = ASSETS_GAMES / name
        r2_game_copy = R2_GAMES_DIR / name
        if r2_game_copy.exists():
            shutil.rmtree(r2_game_copy)
        shutil.copytree(src_dir, r2_game_copy)
        entry = package_game_dir(name, src_dir, R2_PACKAGES_DIR / f"{name}.zip")
        outgoing_entries.append(entry)
        print(f"  [PACKAGED] {name}.zip ({entry['sizeBytes']:,} bytes, {entry['fileCount']} files)")

    # Bắt buộc upload & xác minh 8 gói trên R2 TRƯỚC KHI xóa khỏi assets/games/.
    # Mandatory upload & public SHA-256 verification BEFORE deleting outgoing bundled directories.
    upload_and_verify_public(config, outgoing_entries)
    extract_verified_incoming(integrity_by_name)

    for name in OUTGOING_LOW_BUNDLED:
        shutil.rmtree(ASSETS_GAMES / name)
        print(f"  [REMOVED LOCAL] assets/games/{name}")

    # Gỡ bản sao trùng lặp `assets/games/icons` (12.25 MB, app dùng `assets/icons/`).
    # Remove duplicate `assets/games/icons` copy (app loads from `assets/icons/`).
    duplicate_icons = ASSETS_GAMES / "icons"
    if duplicate_icons.is_dir():
        shutil.rmtree(duplicate_icons)
        print("  [CLEANED DUPLICATE] Removed unused duplicate assets/games/icons (saved ~12.25 MB)")

    update_catalog_and_integrity(outgoing_entries)
    print("SWAP COMPLETE!")


if __name__ == "__main__":
    main()
