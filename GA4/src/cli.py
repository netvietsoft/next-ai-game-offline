"""
Giao diện dòng lệnh (CLI) điều phối kiểm tra, đồng bộ schema, kéo dữ liệu và phân tích GA4.
Command-line entrypoint for GA4 connection checks, schema sync, extraction, and analysis.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
from typing import Sequence

from .analyzer import GA4Analyzer
from .config import GA4Config, load_config
from .demo_generator import generate_demo_bundle
from .ga4_client import GA4AuthError, GA4Connector, GA4PermissionError
from .report_builder import write_reports


def _configure_stdio_utf8() -> None:
    """
    Bảo đảm console Windows xuất tiếng Việt có dấu UTF-8 không bị lỗi ký tự.
    Ensure UTF-8 stdout/stderr encoding on Windows terminals.
    """
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except OSError:
                pass


def _print_missing_key_guide(config: GA4Config) -> None:
    """
    In hướng dẫn ngắn gọn khi chưa tìm thấy file khóa Service Account GA4.
    Print concise setup instructions when the GA4 Service Account key is not yet placed.
    """
    guide_path = config.ga4_root / "HUONG_DAN_LAY_KEY_GA4.md"
    env_example = config.ga4_root / ".env.example"
    print("=" * 72)
    print("[CHƯA CÓ KEY XÁC THỰC GA4] Không thể kết nối GA4 Data API thật.")
    print("=" * 72)
    print(f"- File khóa đang tìm : {config.credentials_path}")
    print(f"- Tệp .env hiện có   : {'Có' if config.env_file_exists else 'Chưa tạo (sao chép từ ' + str(env_example) + ')'}")
    print(f"- GA4_PROPERTY_ID    : {config.property_id or '(Trống - sẽ tự động dò sau khi có key)'}")
    print("\nCÁC BƯỚC CẦN LÀM TIẾP THEO:")
    print("  1. Mở hướng dẫn chi tiết từng bước tại:")
    print(f"     {guide_path}")
    print("  2. Tải Service Account JSON từ Google Cloud (project: nextai-game-offline)")
    print(f"     và lưu vào đúng đường dẫn:\n     {config.credentials_path}")
    print("  3. Cấp quyền Viewer (hoặc Editor nếu dùng --sync-dimensions) cho client_email trên GA4.")
    print("  4. Chạy lại: .\\GA4\\run_ga4.ps1 --check")
    print("\nMẸO: Chạy ngay '.\\GA4\\run_ga4.ps1 --demo' để xem trước Dashboard & Báo cáo mẫu!")


def _run_check(config: GA4Config) -> int:
    """
    Kiểm tra cấu hình cục bộ, xác thực GA4 API, dò Property ID và kiểm tra Custom Dimensions.
    Verify local config, GA4 API connectivity, Property discovery, and Custom Dimensions.
    """
    print("==> Kiểm tra cấu hình GA4 (Game Gate Offline)...")
    print(f"    Thư mục GA4       : {config.ga4_root}")
    print(f"    Tệp .env          : {'Đã có' if config.env_file_exists else 'Chưa có (dùng mặc định)'}")
    print(f"    Đường dẫn JSON    : {config.credentials_path}")

    if not config.credentials_exists:
        _print_missing_key_guide(config)
        return 2

    try:
        connector = GA4Connector(config, write_access=False)
        print(f"    Service Account   : {connector.service_account_email or '(ADC)'}")
        try:
            properties = connector.discover_properties()
            print(f"    Số Property thấy  : {len(properties)}")
            for prop in properties:
                print(f"      - [{prop.property_id}] {prop.property_name} (Account: {prop.account_name})")
        except GA4PermissionError as admin_exc:
            if not config.property_id:
                raise
            print(f"    [CẢNH BÁO Admin API] {admin_exc}")
            print("    -> Đã có sẵn GA4_PROPERTY_ID, tiếp tục kiểm tra trực tiếp qua Data API...")

        target_id = connector.resolve_property_id()
        print(f"    Property mục tiêu : {target_id}")
        status = connector.check_custom_definitions_status(target_id)
        print(
            "    Custom Dimensions : "
            f"{len(status['registered_dimensions'])}/{status['total_expected_dimensions']} đã đăng ký"
        )
        print(
            "    Custom Metrics    : "
            f"{len(status['registered_metrics'])}/{status['total_expected_metrics']} đã đăng ký"
        )
        if status["missing_dimensions"] or status["missing_metrics"]:
            print("    Các trường chưa đăng ký:")
            if status["missing_dimensions"]:
                print(f"      - Dimensions: {', '.join(status['missing_dimensions'])}")
            if status["missing_metrics"]:
                print(f"      - Metrics   : {', '.join(status['missing_metrics'])}")
            print("    -> Gợi ý: Chạy '.\\GA4\\run_ga4.ps1 --sync-dimensions' (cần quyền Editor).")
        print("\n[OK] Kết nối GA4 hợp lệ! Chạy '.\\GA4\\run_ga4.ps1 --pull' để kéo dữ liệu.")
        return 0
    except (GA4AuthError, GA4PermissionError) as exc:
        print(f"\n[LỖI KẾT NỐI GA4] {exc}")
        return 1


def _run_sync_dimensions(config: GA4Config, dry_run: bool) -> int:
    """
    Đồng bộ tự động 23 Custom Dimensions và 4 Custom Metrics lên GA4 Property.
    Automatically sync missing Custom Dimensions and Custom Metrics to the GA4 Property.
    """
    if not config.credentials_exists:
        _print_missing_key_guide(config)
        return 2
    try:
        connector = GA4Connector(config, write_access=not dry_run)
        target_id = connector.resolve_property_id()
        print(f"==> Đồng bộ Custom Definitions cho GA4 Property {target_id} (dry_run={dry_run})...")
        result = connector.sync_custom_definitions(target_id, dry_run=dry_run)
        print(f"    Dimensions đã tạo   : {len(result['created_dimensions'])} -> {result['created_dimensions']}")
        print(f"    Dimensions đã có    : {len(result['existing_dimensions'])}")
        print(f"    Metrics đã tạo      : {len(result['created_metrics'])} -> {result['created_metrics']}")
        print(f"    Metrics đã có       : {len(result['existing_metrics'])}")
        return 0
    except (GA4AuthError, GA4PermissionError) as exc:
        print(f"\n[LỖI ĐỒNG BỘ SCHEMA] {exc}")
        return 1


def _run_pull(config: GA4Config) -> int:
    """
    Kéo toàn bộ 11 báo cáo từ GA4 Data API, lưu JSON/CSV, phân tích và xuất báo cáo + dashboard.
    Pull all 11 reports from GA4 Data API, save JSON/CSV, analyze, and generate reports.
    """
    if not config.credentials_exists:
        _print_missing_key_guide(config)
        return 2
    try:
        connector = GA4Connector(config, write_access=False)
        target_id = connector.resolve_property_id()
        print(
            f"==> Đang kéo dữ liệu GA4 Property {target_id} "
            f"({config.start_date} -> {config.end_date})..."
        )
        bundle = connector.pull_all_reports(property_id=target_id)
        analysis = GA4Analyzer(bundle).analyze()
        outputs = write_reports(
            analysis,
            reports_dir=config.reports_dir,
            markdown_filename="GA4_ANALYSIS_REPORT.md",
            html_filename="dashboard.html",
        )
        print(f"[OK] Đã kéo xong {len(bundle.get('reports', {}))} báo cáo.")
        print(f"    - Raw JSON       : {config.raw_dir / 'ga4_bundle.json'}")
        print(f"    - CSV Folder     : {config.csv_dir}")
        print(f"    - Báo cáo MD     : {outputs['markdown']}")
        print(f"    - Dashboard HTML : {outputs['html']}")
        return 0
    except (GA4AuthError, GA4PermissionError) as exc:
        print(f"\n[LỖI KÉO DỮ LIỆU GA4] {exc}")
        return 1


def _run_analyze_local(config: GA4Config, bundle_path: str | None) -> int:
    """
    Phân tích lại từ tệp ga4_bundle.json đã kéo sẵn trên máy mà không cần gọi API.
    Re-analyze a locally cached ga4_bundle.json file without making live GA4 API calls.
    """
    target_file = (
        Path(bundle_path)
        if bundle_path
        else (config.raw_dir / "ga4_bundle.json")
    )
    if not target_file.is_file():
        print(f"[LỖI] Không tìm thấy tệp dữ liệu cục bộ: {target_file}")
        print("Hãy chạy '--pull' (sau khi có key) hoặc '--demo' để tạo dữ liệu trước.")
        return 1

    bundle = json.loads(target_file.read_text(encoding="utf-8"))
    analysis = GA4Analyzer(bundle).analyze()
    is_live = analysis.get("meta", {}).get("data_source") == "LIVE_GA4"
    outputs = write_reports(
        analysis,
        reports_dir=config.reports_dir,
        markdown_filename="GA4_ANALYSIS_REPORT.md" if is_live else "GA4_DEMO_REPORT.md",
        html_filename="dashboard.html" if is_live else "demo_dashboard.html",
    )
    print(f"[OK] Đã phân tích lại từ {target_file}")
    print(f"    - Báo cáo MD     : {outputs['markdown']}")
    print(f"    - Dashboard HTML : {outputs['html']}")
    return 0


def _run_demo(config: GA4Config, days: int | None) -> int:
    """
    Chạy chế độ mô phỏng End-to-End để xem trước báo cáo và Dashboard mẫu ngay lập tức.
    Execute end-to-end demo preview mode generating sample reports and HTML dashboard.
    """
    lookback = days if days is not None else config.default_days
    print(f"==> Đang sinh dữ liệu mô phỏng GA4 ({lookback} ngày)...")
    bundle = generate_demo_bundle(
        project_root=config.project_root,
        days=lookback,
        output_demo_dir=config.demo_dir,
    )
    analysis = GA4Analyzer(bundle).analyze()
    outputs = write_reports(
        analysis,
        reports_dir=config.reports_dir,
        markdown_filename="GA4_DEMO_REPORT.md",
        html_filename="demo_dashboard.html",
    )
    print("[OK] Đã tạo trọn bộ Demo Preview:")
    print(f"    - Demo JSON      : {config.demo_dir / 'ga4_bundle.json'}")
    print(f"    - Báo cáo MD     : {outputs['markdown']}")
    print(f"    - Dashboard HTML : {outputs['html']}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    """
    Khởi tạo bộ phân tích tham số dòng lệnh cho GA4 CLI.
    Build the argparse command-line parser for the GA4 analytics CLI.
    """
    parser = argparse.ArgumentParser(
        prog="ga4-analyzer",
        description="Công cụ kết nối, kéo và phân tích dữ liệu GA4 cho Game Gate Offline.",
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="Kiểm tra cấu hình, key JSON và quyền GA4.")
    mode.add_argument("--sync-dimensions", action="store_true", help="Tự động tạo Custom Dimensions/Metrics còn thiếu trên GA4.")
    mode.add_argument("--pull", action="store_true", help="Kéo dữ liệu thật từ GA4 về JSON/CSV và xuất báo cáo.")
    mode.add_argument("--analyze-local", action="store_true", help="Phân tích lại tệp ga4_bundle.json có sẵn.")
    mode.add_argument("--demo", action="store_true", help="Chạy mô phỏng mẫu khi chưa có key xác thực.")

    parser.add_argument("--property-id", help="Ghi đè GA4 Property ID (ví dụ: 412345678).")
    parser.add_argument("--days", type=int, help="Số ngày gần nhất cần kéo (mặc định: 30).")
    parser.add_argument("--start-date", help="Ngày bắt đầu YYYY-MM-DD.")
    parser.add_argument("--end-date", help="Ngày kết thúc YYYY-MM-DD.")
    parser.add_argument("--credentials", help="Đường dẫn tới Service Account JSON.")
    parser.add_argument("--bundle-path", help="Đường dẫn tùy chọn cho --analyze-local.")
    parser.add_argument("--dry-run", action="store_true", help="Chạy thử không ghi thay đổi (dùng kèm --sync-dimensions).")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """
    Điểm vào chính của chương trình CLI GA4.
    Main CLI entrypoint returning process exit status code.
    """
    _configure_stdio_utf8()
    parser = build_parser()
    args = parser.parse_args(argv)
    config = load_config(
        property_id=args.property_id,
        days=args.days,
        start_date=args.start_date,
        end_date=args.end_date,
        credentials_override=args.credentials,
    )

    if args.check:
        return _run_check(config)
    if args.sync_dimensions:
        return _run_sync_dimensions(config, dry_run=args.dry_run)
    if args.pull:
        return _run_pull(config)
    if args.analyze_local:
        return _run_analyze_local(config, bundle_path=args.bundle_path)
    if args.demo:
        return _run_demo(config, days=args.days)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
