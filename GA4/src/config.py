"""
Quản lý cấu hình môi trường và xác thực đường dẫn cho công cụ phân tích GA4.
Environment configuration and path resolution for the GA4 analytics toolkit.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
import os
from pathlib import Path
from typing import Tuple

from dotenv import load_dotenv

# Tên dự án Firebase / Android mặc định dùng để tự động khớp GA4 Property.
# Default Firebase / Android identifiers used for GA4 Property auto-discovery.
DEFAULT_FIREBASE_PROJECT_ID = "nextai-game-offline"
DEFAULT_APP_DISPLAY_NAME = "Game Gate Offline"
DEFAULT_ANDROID_PACKAGE = "com.nextai.game.offline"


@dataclass
class GA4Config:
    """
    Cấu hình tổng hợp cho quá trình kiểm tra, đồng bộ và kéo dữ liệu GA4.
    Consolidated runtime configuration for GA4 validation, schema sync, and extraction.
    """

    ga4_root: Path
    property_id: str
    credentials_path: Path
    start_date: str
    end_date: str
    default_days: int
    timezone: str
    env_file_exists: bool
    credentials_exists: bool

    @property
    def raw_dir(self) -> Path:
        """Thư mục lưu JSON thô từ GA4 API / Directory for raw GA4 JSON snapshots."""
        return self.ga4_root / "data" / "raw"

    @property
    def csv_dir(self) -> Path:
        """Thư mục xuất bảng CSV / Directory for exported CSV tables."""
        return self.ga4_root / "data" / "csv"

    @property
    def demo_dir(self) -> Path:
        """Thư mục lưu dữ liệu mô phỏng / Directory for demo preview datasets."""
        return self.ga4_root / "data" / "demo"

    @property
    def reports_dir(self) -> Path:
        """Thư mục xuất báo cáo Markdown và HTML / Directory for Markdown & HTML reports."""
        return self.ga4_root / "reports"

    @property
    def project_root(self) -> Path:
        """Thư mục gốc dự án / Workspace project root directory."""
        return self.ga4_root.parent

    def ensure_directories(self) -> None:
        """
        Đảm bảo toàn bộ thư mục dữ liệu và báo cáo đã tồn tại trên đĩa.
        Ensure all output data and report directories exist on disk.
        """
        for path in (
            self.ga4_root / "credentials",
            self.raw_dir,
            self.csv_dir,
            self.demo_dir,
            self.reports_dir,
        ):
            path.mkdir(parents=True, exist_ok=True)


def compute_date_range(
    days: int | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    default_days: int = 30,
) -> Tuple[str, str]:
    """
    Tính toán cặp ngày bắt đầu/kết thúc định dạng YYYY-MM-DD cho truy vấn GA4.
    Compute start/end date strings (YYYY-MM-DD) for GA4 Data API queries.
    """
    today = date.today()
    resolved_end = end_date or today.isoformat()
    if start_date:
        resolved_start = start_date
    else:
        lookback = max(1, days if days is not None else default_days)
        resolved_start = (today - timedelta(days=lookback - 1)).isoformat()
    return resolved_start, resolved_end


def load_config(
    ga4_root: Path | None = None,
    property_id: str | None = None,
    days: int | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    credentials_override: str | None = None,
) -> GA4Config:
    """
    Nạp cấu hình từ tệp GA4/.env và tham số dòng lệnh mà không làm lộ bí mật.
    Load configuration from GA4/.env and CLI overrides without exposing secrets.
    """
    resolved_root = (
        ga4_root.resolve()
        if ga4_root is not None
        else Path(__file__).resolve().parent.parent
    )
    env_path = resolved_root / ".env"
    env_exists = env_path.is_file()
    if env_exists:
        load_dotenv(dotenv_path=env_path, override=False)

    env_days_raw = os.getenv("GA4_DEFAULT_DAYS", "30").strip()
    try:
        default_days = max(1, int(env_days_raw))
    except ValueError:
        default_days = 30

    resolved_start, resolved_end = compute_date_range(
        days=days,
        start_date=start_date,
        end_date=end_date,
        default_days=default_days,
    )

    raw_cred = (
        credentials_override
        or os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "").strip()
        or "./credentials/service-account.json"
    )
    cred_path = Path(raw_cred)
    if not cred_path.is_absolute():
        cred_path = (resolved_root / cred_path).resolve()

    resolved_property_id = (
        (property_id or os.getenv("GA4_PROPERTY_ID", "")).strip()
    )
    if resolved_property_id.startswith("properties/"):
        resolved_property_id = resolved_property_id.split("/", 1)[1]

    timezone = os.getenv("GA4_TIMEZONE", "Asia/Ho_Chi_Minh").strip() or "Asia/Ho_Chi_Minh"

    cfg = GA4Config(
        ga4_root=resolved_root,
        property_id=resolved_property_id,
        credentials_path=cred_path,
        start_date=resolved_start,
        end_date=resolved_end,
        default_days=default_days,
        timezone=timezone,
        env_file_exists=env_exists,
        credentials_exists=cred_path.is_file(),
    )
    cfg.ensure_directories()
    return cfg
