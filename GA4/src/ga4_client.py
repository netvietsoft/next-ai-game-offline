"""
Trình kết nối chính thức tới Google Analytics 4 Admin API & Data API (v1beta).
Official connector for Google Analytics 4 Admin API & Data API (v1beta).
"""

from __future__ import annotations

import csv
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple

import google.auth
from google.analytics.admin import AnalyticsAdminServiceClient
from google.analytics.admin_v1alpha.types import (
    CustomDimension as AdminCustomDimension,
    CustomMetric as AdminCustomMetric,
)
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Filter,
    FilterExpression,
    Metric,
    OrderBy,
    RunRealtimeReportRequest,
    RunReportRequest,
)
from google.api_core.exceptions import GoogleAPICallError, PermissionDenied
from google.oauth2 import service_account

from .config import (
    DEFAULT_APP_DISPLAY_NAME,
    DEFAULT_FIREBASE_PROJECT_ID,
    GA4Config,
)
from .schema import (
    CUSTOM_DIMENSIONS,
    CUSTOM_METRICS,
    REPORT_SPECS,
    ReportSpec,
    resolve_report_fields,
)

# Scope chỉ đọc mặc định để kéo dữ liệu và dò property.
# Default read-only scope for pulling reports and discovering properties.
READONLY_SCOPES: Tuple[str, ...] = (
    "https://www.googleapis.com/auth/analytics.readonly",
)

# Scope ghi dùng riêng cho lệnh --sync-dimensions để tạo Custom Dimensions/Metrics.
# Edit scope used exclusively by --sync-dimensions to create Custom Dimensions/Metrics.
EDIT_SCOPES: Tuple[str, ...] = (
    "https://www.googleapis.com/auth/analytics.edit",
    "https://www.googleapis.com/auth/analytics.readonly",
)


class GA4AuthError(RuntimeError):
    """Lỗi thiếu hoặc sai cấu hình khóa xác thực GA4 / Missing or invalid GA4 credentials."""


class GA4PermissionError(RuntimeError):
    """Lỗi thiếu quyền truy cập GA4 Property hoặc chưa bật API / Missing GA4 permissions or disabled API."""


@dataclass(frozen=True)
class PropertySummaryItem:
    """
    Thông tin tóm tắt một GA4 Property tìm thấy qua Admin API.
    Summary metadata of a GA4 Property discovered via the Admin API.
    """

    account_id: str
    account_name: str
    property_id: str
    property_name: str


def _parse_metric_value(raw_value: str, metric_type: str | None = None) -> float | int:
    """
    Chuyển đổi chuỗi giá trị metric từ GA4 API sang kiểu số int hoặc float an toàn.
    Safely convert GA4 string metric values into int or float.
    """
    if raw_value == "" or raw_value is None:
        return 0
    try:
        if "." in raw_value or "e" in raw_value.lower() or metric_type in {"TYPE_FLOAT", "TYPE_SECONDS", "TYPE_MILLISECONDS", "TYPE_CURRENCY"}:
            val = float(raw_value)
            return int(val) if val.is_integer() and metric_type == "TYPE_INTEGER" else val
        return int(raw_value)
    except ValueError:
        return 0


class GA4Connector:
    """
    Lớp điều phối kết nối Service Account, kiểm tra metadata, đồng bộ schema và tải báo cáo GA4.
    Orchestrates Service Account auth, metadata checks, schema sync, and GA4 report extraction.
    """

    def __init__(self, config: GA4Config, write_access: bool = False) -> None:
        """
        Khởi tạo connector với cấu hình GA4 và mức quyền tương ứng.
        Initialize connector with GA4 config and required OAuth scope level.
        """
        self.config = config
        self.write_access = write_access
        self.scopes = EDIT_SCOPES if write_access else READONLY_SCOPES
        self.service_account_email: Optional[str] = None
        self.service_account_project_id: Optional[str] = None
        self._credentials = self._load_credentials()
        self._admin_client = AnalyticsAdminServiceClient(credentials=self._credentials)
        self._data_client = BetaAnalyticsDataClient(credentials=self._credentials)

    def _load_credentials(self):
        """
        Nạp thông tin xác thực từ tệp Service Account JSON (ưu tiên) hoặc ADC hệ thống.
        Load credentials from Service Account JSON file (preferred) or system ADC fallback.
        """
        if self.config.credentials_exists:
            try:
                raw_info = json.loads(self.config.credentials_path.read_text(encoding="utf-8"))
                self.service_account_email = raw_info.get("client_email")
                self.service_account_project_id = raw_info.get("project_id")
                if raw_info.get("type") != "service_account":
                    raise GA4AuthError(
                        f"Tệp {self.config.credentials_path} không phải Service Account JSON hợp lệ "
                        "(trường 'type' phải là 'service_account')."
                    )
                return service_account.Credentials.from_service_account_file(
                    str(self.config.credentials_path),
                    scopes=list(self.scopes),
                )
            except json.JSONDecodeError as exc:
                raise GA4AuthError(
                    f"Không thể đọc JSON trong {self.config.credentials_path}: {exc}"
                ) from exc

        # Thử Application Default Credentials (ADC) nếu người dùng đã cấu hình gcloud trên máy.
        # Fallback to Application Default Credentials (ADC) if configured locally.
        try:
            creds, detected_project = google.auth.default(scopes=list(self.scopes))
            self.service_account_project_id = detected_project
            return creds
        except Exception as exc:  # noqa: BLE001
            raise GA4AuthError(
                f"Không tìm thấy file khóa tại '{self.config.credentials_path}' và không có ADC. "
                "Vui lòng làm theo hướng dẫn trong GA4/HUONG_DAN_LAY_KEY_GA4.md."
            ) from exc

    def _format_permission_error(
        self,
        exc: PermissionDenied,
        api_name: str,
        api_slug: str,
        property_id: str | None = None,
        require_editor: bool = False,
    ) -> GA4PermissionError:
        """
        Phân loại lỗi 403 thành API chưa bật trên Google Cloud hoặc thiếu quyền trên GA4 Property.
        Classify HTTP 403 PermissionDenied into disabled GCP API vs missing GA4 Property role.
        """
        raw_msg = str(exc)
        project_ref = self.service_account_project_id or "593740416942"
        if "SERVICE_DISABLED" in raw_msg or "has not been used in project" in raw_msg:
            return GA4PermissionError(
                f"{api_name} ({api_slug}) chưa được bật trên Google Cloud project '{project_ref}'. "
                f"Hãy mở URL kích hoạt rồi nhấn ENABLE: "
                f"https://console.developers.google.com/apis/api/{api_slug}/overview?project={project_ref}"
            )

        email_hint = self.service_account_email or "(Service Account)"
        role_hint = "Editor" if require_editor else "Viewer hoặc Editor"
        prop_hint = f"Property '{property_id}'" if property_id else "GA4 Property mục tiêu"
        return GA4PermissionError(
            f"Tài khoản {email_hint} chưa có quyền {role_hint} trên {prop_hint} "
            f"(chi tiết: {exc.message}). Hãy thêm email này vào GA4 Admin -> Property access management."
        )

    def discover_properties(self) -> List[PropertySummaryItem]:
        """
        Liệt kê toàn bộ GA4 Property mà Service Account hiện tại có quyền truy cập.
        List all GA4 Properties accessible by the current credentials via Admin API.
        """
        results: List[PropertySummaryItem] = []
        try:
            for account_summary in self._admin_client.list_account_summaries():
                acc_name = account_summary.display_name or account_summary.account
                acc_id = account_summary.account.split("/")[-1]
                for prop_summary in account_summary.property_summaries:
                    prop_id = prop_summary.property.split("/")[-1]
                    results.append(
                        PropertySummaryItem(
                            account_id=acc_id,
                            account_name=acc_name,
                            property_id=prop_id,
                            property_name=prop_summary.display_name or prop_id,
                        )
                    )
        except PermissionDenied as exc:
            raise self._format_permission_error(
                exc,
                api_name="Google Analytics Admin API",
                api_slug="analyticsadmin.googleapis.com",
            ) from exc
        except GoogleAPICallError as exc:
            raise GA4PermissionError(f"Lỗi gọi GA4 Admin API: {exc.message}") from exc
        return results

    def resolve_property_id(self) -> str:
        """
        Trả về Property ID cấu hình hoặc tự động chọn Property khớp với Game Gate Offline.
        Return configured Property ID or auto-select the property matching Game Gate Offline.
        """
        if self.config.property_id:
            return self.config.property_id

        properties = self.discover_properties()
        if not properties:
            email_hint = self.service_account_email or "(Service Account)"
            raise GA4PermissionError(
                f"Tài khoản {email_hint} chưa được cấp quyền trên bất kỳ GA4 Property nào "
                "hoặc Property chưa liên kết với Firebase project."
            )

        # Ưu tiên khớp tên dự án / tên ứng dụng nếu tài khoản truy cập nhiều property.
        # Prefer matching project/app names when multiple properties are accessible.
        keywords = (
            DEFAULT_FIREBASE_PROJECT_ID.lower(),
            DEFAULT_APP_DISPLAY_NAME.lower(),
            "nextai",
            "game gate",
        )
        for item in properties:
            combined = f"{item.property_name} {item.account_name}".lower()
            if any(k in combined for k in keywords):
                return item.property_id

        if len(properties) == 1:
            return properties[0].property_id

        options = ", ".join(f"{p.property_name} ({p.property_id})" for p in properties)
        raise GA4PermissionError(
            f"Tìm thấy nhiều GA4 Property ({options}). Vui lòng đặt GA4_PROPERTY_ID trong GA4/.env "
            "hoặc truyền --property-id."
        )

    def fetch_property_metadata(self, property_id: str) -> Tuple[set[str], set[str]]:
        """
        Lấy danh sách toàn bộ dimension và metric hợp lệ trên GA4 Property hiện tại.
        Fetch all available dimension and metric api_names for the target GA4 Property.
        """
        try:
            meta = self._data_client.get_metadata(name=f"properties/{property_id}/metadata")
        except PermissionDenied as exc:
            raise self._format_permission_error(
                exc,
                api_name="Google Analytics Data API",
                api_slug="analyticsdata.googleapis.com",
                property_id=property_id,
            ) from exc
        except GoogleAPICallError as exc:
            raise GA4PermissionError(f"Lỗi đọc metadata GA4 Data API: {exc.message}") from exc

        dims = {d.api_name for d in meta.dimensions}
        mets = {m.api_name for m in meta.metrics}
        return dims, mets

    def check_custom_definitions_status(
        self,
        property_id: str,
        available_dimensions: Optional[set[str]] = None,
        available_metrics: Optional[set[str]] = None,
    ) -> Dict[str, Any]:
        """
        Đối chiếu số lượng Custom Dimensions & Custom Metrics đã đăng ký so với schema Android.
        Compare registered Custom Dimensions & Metrics on GA4 against the Android schema.
        """
        if available_dimensions is None or available_metrics is None:
            avail_dims, avail_mets = self.fetch_property_metadata(property_id)
        else:
            avail_dims, avail_mets = available_dimensions, available_metrics
        registered_dims = [d.parameter_name for d in CUSTOM_DIMENSIONS if d.api_name in avail_dims]
        missing_dims = [d.parameter_name for d in CUSTOM_DIMENSIONS if d.api_name not in avail_dims]
        registered_mets = [m.parameter_name for m in CUSTOM_METRICS if m.api_name in avail_mets]
        missing_mets = [m.parameter_name for m in CUSTOM_METRICS if m.api_name not in avail_mets]
        return {
            "total_expected_dimensions": len(CUSTOM_DIMENSIONS),
            "registered_dimensions": registered_dims,
            "missing_dimensions": missing_dims,
            "total_expected_metrics": len(CUSTOM_METRICS),
            "registered_metrics": registered_mets,
            "missing_metrics": missing_mets,
        }

    def sync_custom_definitions(self, property_id: str, dry_run: bool = False) -> Dict[str, Any]:
        """
        Tự động tạo các Custom Dimensions & Custom Metrics còn thiếu trên GA4 Property qua Admin API.
        Idempotently create missing Custom Dimensions & Metrics on the GA4 Property via Admin API.
        """
        parent = f"properties/{property_id}"
        try:
            existing_dims = {
                dim.parameter_name: dim
                for dim in self._admin_client.list_custom_dimensions(parent=parent)
            }
            existing_mets = {
                met.parameter_name: met
                for met in self._admin_client.list_custom_metrics(parent=parent)
            }
        except PermissionDenied as exc:
            raise self._format_permission_error(
                exc,
                api_name="Google Analytics Admin API",
                api_slug="analyticsadmin.googleapis.com",
                property_id=property_id,
                require_editor=True,
            ) from exc
        except GoogleAPICallError as exc:
            raise GA4PermissionError(f"Lỗi GA4 Admin API khi đọc custom definitions: {exc.message}") from exc

        created_dims: List[str] = []
        skipped_dims: List[str] = []
        created_mets: List[str] = []
        skipped_mets: List[str] = []

        for dim_def in CUSTOM_DIMENSIONS:
            if dim_def.parameter_name in existing_dims:
                skipped_dims.append(dim_def.parameter_name)
                continue
            if dry_run:
                created_dims.append(f"[DRY-RUN] {dim_def.parameter_name}")
                continue
            scope_enum = (
                AdminCustomDimension.DimensionScope.USER
                if dim_def.scope == "USER"
                else AdminCustomDimension.DimensionScope.EVENT
            )
            try:
                self._admin_client.create_custom_dimension(
                    parent=parent,
                    custom_dimension=AdminCustomDimension(
                        parameter_name=dim_def.parameter_name,
                        display_name=dim_def.display_name[:82],
                        description=dim_def.description[:150],
                        scope=scope_enum,
                    ),
                )
                created_dims.append(dim_def.parameter_name)
            except PermissionDenied as exc:
                raise self._format_permission_error(
                    exc,
                    api_name="Google Analytics Admin API",
                    api_slug="analyticsadmin.googleapis.com",
                    property_id=property_id,
                    require_editor=True,
                ) from exc

        unit_map = {
            "STANDARD": AdminCustomMetric.MeasurementUnit.STANDARD,
            "SECONDS": AdminCustomMetric.MeasurementUnit.SECONDS,
            "MILLISECONDS": AdminCustomMetric.MeasurementUnit.MILLISECONDS,
        }
        for met_def in CUSTOM_METRICS:
            if met_def.parameter_name in existing_mets:
                skipped_mets.append(met_def.parameter_name)
                continue
            if dry_run:
                created_mets.append(f"[DRY-RUN] {met_def.parameter_name}")
                continue
            try:
                self._admin_client.create_custom_metric(
                    parent=parent,
                    custom_metric=AdminCustomMetric(
                        parameter_name=met_def.parameter_name,
                        display_name=met_def.display_name[:82],
                        description=met_def.description[:150],
                        scope=AdminCustomMetric.MetricScope.EVENT,
                        measurement_unit=unit_map.get(
                            met_def.measurement_unit,
                            AdminCustomMetric.MeasurementUnit.STANDARD,
                        ),
                    ),
                )
                created_mets.append(met_def.parameter_name)
            except PermissionDenied as exc:
                raise self._format_permission_error(
                    exc,
                    api_name="Google Analytics Admin API",
                    api_slug="analyticsadmin.googleapis.com",
                    property_id=property_id,
                    require_editor=True,
                ) from exc

        return {
            "property_id": property_id,
            "dry_run": dry_run,
            "created_dimensions": created_dims,
            "existing_dimensions": skipped_dims,
            "created_metrics": created_mets,
            "existing_metrics": skipped_mets,
        }

    def _run_report_spec(
        self,
        property_id: str,
        spec: ReportSpec,
        start_date: str,
        end_date: str,
        avail_dims: set[str],
        avail_mets: set[str],
    ) -> Dict[str, Any]:
        """
        Thực thi một ReportSpec với cơ chế tự động lọc trường hợp lệ và phân trang offset.
        Execute a ReportSpec with automatic metadata filtering and offset pagination.
        """
        dims, mets, skipped = resolve_report_fields(spec, avail_dims, avail_mets)

        dim_filter = None
        if spec.event_names:
            dim_filter = FilterExpression(
                filter=Filter(
                    field_name="eventName",
                    in_list_filter=Filter.InListFilter(
                        values=list(spec.event_names),
                        case_sensitive=True,
                    ),
                )
            )

        order_bys: List[OrderBy] = []
        if spec.order_by_metric and spec.order_by_metric in mets:
            order_bys.append(
                OrderBy(
                    metric=OrderBy.MetricOrderBy(metric_name=spec.order_by_metric),
                    desc=True,
                )
            )
        elif spec.order_by_dimension and spec.order_by_dimension in dims:
            order_bys.append(
                OrderBy(
                    dimension=OrderBy.DimensionOrderBy(
                        dimension_name=spec.order_by_dimension
                    ),
                    desc=False,
                )
            )

        page_size = min(spec.limit, 10000)
        offset = 0
        rows_out: List[Dict[str, Any]] = []
        metric_types: List[str] = []
        row_count_total = 0

        while True:
            request = RunReportRequest(
                property=f"properties/{property_id}",
                date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
                dimensions=[Dimension(name=d) for d in dims],
                metrics=[Metric(name=m) for m in mets],
                dimension_filter=dim_filter,
                order_bys=order_bys,
                limit=page_size,
                offset=offset,
            )
            response = self._data_client.run_report(request)
            if not metric_types:
                metric_types = [str(mh.type_.name) for mh in response.metric_headers]
            row_count_total = response.row_count or 0

            for row in response.rows:
                record: Dict[str, Any] = {}
                for idx, dim_name in enumerate(dims):
                    record[dim_name] = row.dimension_values[idx].value
                for idx, met_name in enumerate(mets):
                    m_type = metric_types[idx] if idx < len(metric_types) else None
                    record[met_name] = _parse_metric_value(
                        row.metric_values[idx].value, m_type
                    )
                rows_out.append(record)

            offset += len(response.rows)
            if not response.rows or offset >= row_count_total or offset >= spec.limit:
                break

        return {
            "key": spec.key,
            "title": spec.title,
            "dimensions": dims,
            "metrics": mets,
            "skipped_optional_fields": skipped,
            "row_count": len(rows_out),
            "total_available_rows": row_count_total,
            "rows": rows_out,
        }

    def _run_realtime_snapshot(self, property_id: str) -> Dict[str, Any]:
        """
        Lấy snapshot người dùng hoạt động 30 phút gần nhất qua RunRealtimeReport.
        Fetch active user snapshot for the last 30 minutes via RunRealtimeReport.
        """
        try:
            response = self._data_client.run_realtime_report(
                RunRealtimeReportRequest(
                    property=f"properties/{property_id}",
                    dimensions=[Dimension(name="country")],
                    metrics=[Metric(name="activeUsers")],
                    limit=50,
                )
            )
            rows = [
                {
                    "country": row.dimension_values[0].value,
                    "activeUsers": _parse_metric_value(
                        row.metric_values[0].value, "TYPE_INTEGER"
                    ),
                }
                for row in response.rows
            ]
            total_active = sum(int(r["activeUsers"]) for r in rows)
            return {
                "active_users_last_30m": total_active,
                "countries": rows,
            }
        except GoogleAPICallError:
            return {"active_users_last_30m": 0, "countries": []}

    def pull_all_reports(
        self,
        property_id: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        output_raw_dir: Optional[Path] = None,
        output_csv_dir: Optional[Path] = None,
    ) -> Dict[str, Any]:
        """
        Kéo toàn bộ 11 báo cáo GA4 + realtime snapshot và xuất ra JSON + CSV.
        Pull all 11 GA4 reports + realtime snapshot and export to raw JSON + CSV files.
        """
        target_property_id = property_id or self.resolve_property_id()
        resolved_start = start_date or self.config.start_date
        resolved_end = end_date or self.config.end_date
        raw_dir = output_raw_dir or self.config.raw_dir
        csv_dir = output_csv_dir or self.config.csv_dir
        raw_dir.mkdir(parents=True, exist_ok=True)
        csv_dir.mkdir(parents=True, exist_ok=True)

        avail_dims, avail_mets = self.fetch_property_metadata(target_property_id)
        schema_status = self.check_custom_definitions_status(
            target_property_id,
            available_dimensions=avail_dims,
            available_metrics=avail_mets,
        )

        reports_map: Dict[str, Any] = {}
        for spec in REPORT_SPECS:
            report_payload = self._run_report_spec(
                property_id=target_property_id,
                spec=spec,
                start_date=resolved_start,
                end_date=resolved_end,
                avail_dims=avail_dims,
                avail_mets=avail_mets,
            )
            reports_map[spec.key] = report_payload

            # Lưu từng file JSON và CSV riêng theo report key.
            # Persist individual JSON and CSV files per report key.
            (raw_dir / f"{spec.key}.json").write_text(
                json.dumps(report_payload, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            export_report_csv(
                csv_dir / f"{spec.key}.csv",
                report_payload["dimensions"] + report_payload["metrics"],
                report_payload["rows"],
            )

        realtime = self._run_realtime_snapshot(target_property_id)
        bundle = {
            "meta": {
                "data_source": "LIVE_GA4",
                "property_id": target_property_id,
                "start_date": resolved_start,
                "end_date": resolved_end,
                "timezone": self.config.timezone,
                "extracted_at_utc": datetime.now(timezone.utc).isoformat(),
                "schema_status": schema_status,
            },
            "realtime": realtime,
            "reports": reports_map,
        }
        (raw_dir / "ga4_bundle.json").write_text(
            json.dumps(bundle, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return bundle


def export_report_csv(
    csv_path: Path, columns: Sequence[str], rows: Sequence[Dict[str, Any]]
) -> None:
    """
    Xuất bảng dữ liệu báo cáo ra tệp CSV chuẩn UTF-8 BOM (mở được trực tiếp trên Excel).
    Export report rows to UTF-8 with BOM CSV file for seamless Excel compatibility.
    """
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(columns), extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
