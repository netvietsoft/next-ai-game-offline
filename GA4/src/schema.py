"""
Định nghĩa lược đồ sự kiện Firebase/GA4, Custom Dimensions/Metrics và cấu hình báo cáo.
Defines Firebase/GA4 event schema, Custom Dimensions/Metrics, and report specifications
synchronized with Android Kotlin trackers (GameAnalyticsManager, AdMediationAnalytics,
NotificationAnalyticsTracker).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable, List, Sequence, Set, Tuple

from .roas_specs import build_roas_report_specs

# Giới hạn cứng của Google Analytics Data API v1 cho mỗi RunReportRequest.
# Hard limits enforced by Google Analytics Data API v1 per RunReportRequest.
MAX_GA4_DIMENSIONS_PER_REQUEST = 9
MAX_GA4_METRICS_PER_REQUEST = 10

# ==============================================================================
# 1. DANH MỤC SỰ KIỆN ANDROID (ANDROID EVENT CATALOG)
# ==============================================================================

GAME_EVENTS: Tuple[str, ...] = (
    "game_open",
    "game_start",
    "game_level_start",
    "game_level_complete",
    "game_level_failed",
    "game_level_reached",
    "game_level_restart",
    "game_play_time",
    "game_score_submitted",
    "game_download",
    "game_search",
    "ad_free_pass_activated",
    "daily_quest_completed",
)

ADS_EVENTS: Tuple[str, ...] = (
    "ad_request",
    "ad_loaded",
    "ad_failed_to_load",
    "ad_impression",
    "ad_clicked",
    "ad_dismissed",
    "ad_failed_to_show",
    "ad_reward_earned",
    "ad_mediation_loaded",
    "ad_mediation_failed",
    "ad_load_suppressed",
)

# Sự kiện mới độc lập, không cộng vào phễu cũ / New format events are separate from the legacy funnel.
FORMAT_AD_EVENTS: Tuple[str, ...] = tuple(
    f"{format_name}_{stage}"
    for format_name in ("banner", "interstitial", "app_open", "reward", "native")
    for stage in ("load", "loaded", "load_fail", "showed", "click")
)

IAP_EVENTS: Tuple[str, ...] = (
    "inapp_paywall_viewed",
    "inapp_purchase_initiated",
    "inapp_purchase_success",
    "inapp_purchase_failed",
    "inapp_purchase_canceled",
    "inapp_restore_initiated",
    "inapp_restore_success",
    "inapp_restore_none_found",
)

NOTIFICATION_EVENTS: Tuple[str, ...] = (
    "notification_scheduled",
    "notification_delivery",
    "notification_opened",
    "notification_permission",
)

# Giữ đúng tên user yêu cầu; tách alias khỏi phễu để tránh đếm đôi.
# Preserve requested spelling; keep posted-hour aliases outside the legacy funnel.
NOTIFICATION_TIME_EVENTS: Tuple[str, ...] = (
    "notifycation_time_8h", "notifycation_time_12h", "notifycation_time_20h",
)

ALL_TRACKED_EVENTS: Tuple[str, ...] = (
    GAME_EVENTS + ADS_EVENTS + FORMAT_AD_EVENTS + IAP_EVENTS + NOTIFICATION_EVENTS + NOTIFICATION_TIME_EVENTS
)


# ==============================================================================
# 2. CUSTOM DIMENSIONS & CUSTOM METRICS (ĐỒNG BỘ LÊN GA4 ADMIN API)
# ==============================================================================

@dataclass(frozen=True)
class CustomDimensionDef:
    """
    Định nghĩa một Custom Dimension cần đăng ký trên GA4 Property.
    Definition of a Custom Dimension to register on the GA4 Property.
    """

    parameter_name: str
    display_name: str
    scope: str  # "EVENT" hoặc / or "USER"
    description: str

    @property
    def api_name(self) -> str:
        """
        Tên trường API sử dụng trong GA4 Data API RunReportRequest.
        API field name used inside GA4 Data API RunReportRequest.
        """
        prefix = "customUser" if self.scope == "USER" else "customEvent"
        return f"{prefix}:{self.parameter_name}"


@dataclass(frozen=True)
class CustomMetricDef:
    """
    Định nghĩa một Custom Metric cần đăng ký trên GA4 Property.
    Definition of a Custom Metric to register on the GA4 Property.
    """

    parameter_name: str
    display_name: str
    measurement_unit: str  # "STANDARD", "SECONDS", "MILLISECONDS"
    description: str
    scope: str = "EVENT"

    @property
    def api_name(self) -> str:
        """
        Tên metric API sử dụng trong GA4 Data API RunReportRequest.
        API metric name used inside GA4 Data API RunReportRequest.
        """
        return f"customEvent:{self.parameter_name}"


CUSTOM_DIMENSIONS: Tuple[CustomDimensionDef, ...] = (
    # --- Nhóm sự kiện Game & R2 On-Demand / Game & R2 events ---
    CustomDimensionDef("game_name", "Game ID", "EVENT", "Định danh game (ví dụ: apple_worm) / Game slug ID"),
    CustomDimensionDef("level_label", "Game Level", "EVENT", "Nhãn level do game gửi qua bridge / Alphanumeric level reported by game bridge"),
    CustomDimensionDef("game_title", "Game Title", "EVENT", "Tên hiển thị game / Game display title"),
    CustomDimensionDef("game_category", "Game Category", "EVENT", "Thể loại game / Game category"),
    CustomDimensionDef("status", "Download Status", "EVENT", "Trạng thái tải gói R2 (started/completed/failed/offline) / R2 download status"),
    CustomDimensionDef("search_term", "Game Search Term", "EVENT", "Từ khóa tìm kiếm game đã làm sạch PII / Sanitized launcher search query"),
    # --- Nhóm sự kiện Quảng cáo & Mediation / Ads & Mediation events ---
    CustomDimensionDef("ad_type", "Ad Type", "EVENT", "Loại quảng cáo (BANNER/INTERSTITIAL/REWARDED/APP_OPEN/NATIVE) / Ad format"),
    CustomDimensionDef("ad_unit_id", "Ad Unit ID", "EVENT", "Mã đơn vị quảng cáo AdMob / AdMob ad unit ID"),
    CustomDimensionDef("ad_network", "Ad Network", "EVENT", "Mạng quảng cáo thắng đấu giá (google/meta/mediated) / Winning ad network"),
    CustomDimensionDef("adapter", "Mediation Adapter", "EVENT", "Tên lớp adapter mediation / Mediation adapter class name"),
    CustomDimensionDef("error_code", "Error Code", "EVENT", "Mã lỗi SDK quảng cáo / Ad SDK error code"),
    CustomDimensionDef("error_domain", "Error Domain", "EVENT", "Miền lỗi SDK quảng cáo / Ad SDK error domain"),
    CustomDimensionDef("error_message", "Error Message", "EVENT", "Thông báo lỗi chi tiết / Diagnostic error message"),
    CustomDimensionDef("waterfall", "Waterfall Summary", "EVENT", "Tóm tắt chuỗi waterfall mediation / Mediation waterfall summary"),
    CustomDimensionDef("reason", "Failure or Suppression Reason", "EVENT", "Lý do thua màn hoặc chặn request / Failure or suppression reason"),
    CustomDimensionDef("screen_name", "Screen Name", "EVENT", "Màn hình hiển thị quảng cáo / Screen displaying the ad"),
    CustomDimensionDef("reward_type", "Reward Type", "EVENT", "Loại phần thưởng Rewarded Ad / Rewarded ad reward type"),
    # --- Nhóm sự kiện Mua hàng IAP / In-App Purchase events ---
    CustomDimensionDef("source", "Paywall Source", "EVENT", "Điểm mở Paywall VIP / Entry point for VIP Paywall"),
    CustomDimensionDef("product_id", "IAP Product ID", "EVENT", "SKU sản phẩm Google Play Billing / Google Play SKU ID"),
    # --- Nhóm sự kiện Notification 5 lần/ngày / Daily Notification events ---
    CustomDimensionDef("notification_id", "Notification ID", "EVENT", "Mã mẫu thông báo / Notification template identifier"),
    CustomDimensionDef("notification_slot", "Notification Slot", "EVENT", "Khung slot trong ngày (0..4) / Daily slot index (0..4)"),
    CustomDimensionDef("scheduled_hour", "Scheduled Hour", "EVENT", "Giờ lập lịch thông báo (0..23) / Scheduled hour of day (0..23)"),
    CustomDimensionDef("delivery_status", "Notification Delivery Status", "EVENT", "Trạng thái hiển thị thông báo / Notification delivery status"),
    CustomDimensionDef("permission_status", "Notification Permission Status", "EVENT", "Trạng thái quyền POST_NOTIFICATIONS / Notification permission state"),
    CustomDimensionDef("scheduled_hour_label", "Notification Scheduled Hour", "EVENT", "Giờ theo lịch ở dạng chữ hour_08/hour_12/hour_20 / Alphanumeric scheduled local hour"),
    CustomDimensionDef("content_day_label", "Notification Content Day", "EVENT", "Ngày trong vòng xoay365 nội dung / Day in the 365-day content rotation"),
    CustomDimensionDef("notification_phase", "Notification Phase", "EVENT", "Giai đoạn notification, posted không đồng nghĩa user đã đọc / Lifecycle phase; posted does not mean read"),
    # --- Thuộc tính người dùng / User property ---
    CustomDimensionDef("notification_cohort_hour", "Notification Cohort Hour", "USER", "Giờ neo cohort thông báo của người dùng / User notification cohort anchor hour"),
)

CUSTOM_METRICS: Tuple[CustomMetricDef, ...] = (
    CustomMetricDef("session_duration_sec", "Game Session Duration Sec", "SECONDS", "Thời lượng một phiên chơi game tính bằng giây / Play session duration in seconds"),
    CustomMetricDef("load_duration_ms", "Ad Load Duration Ms", "MILLISECONDS", "Thời gian tải quảng cáo AdMob ms / AdMob ad load duration in ms"),
    CustomMetricDef("load_latency_ms", "Mediation Load Latency Ms", "MILLISECONDS", "Độ trễ nạp quảng cáo mediation ms / Mediation ad load latency in ms"),
    CustomMetricDef("delivery_delay_sec", "Notification Delivery Delay Sec", "SECONDS", "Độ trễ phát thông báo so với giờ hẹn / Notification delivery delay in seconds"),
    CustomMetricDef("result_count", "Search Result Count", "STANDARD", "Số lượng game khớp kết quả tìm kiếm / Number of matching games"),
    CustomMetricDef("streak_days", "Daily Quest Streak Days", "STANDARD", "Chuỗi ngày liên tiếp hoàn thành nhiệm vụ / Consecutive daily quest streak days"),
)


# ==============================================================================
# 3. CẤU HÌNH BÁO CÁO KÉO TỪ GA4 (GA4 REPORT SPECIFICATIONS)
# ==============================================================================

@dataclass(frozen=True)
class ReportSpec:
    """
    Đặc tả một truy vấn báo cáo GA4 kèm trường chuẩn và trường tùy biến tùy chọn.
    Specification for a GA4 report query with standard fields and optional custom fields.
    """

    key: str
    title: str
    description: str
    dimensions: Tuple[str, ...]
    metrics: Tuple[str, ...]
    optional_dimensions: Tuple[str, ...] = field(default_factory=tuple)
    optional_metrics: Tuple[str, ...] = field(default_factory=tuple)
    event_names: Tuple[str, ...] = field(default_factory=tuple)
    order_by_metric: str | None = None
    order_by_dimension: str | None = None
    limit: int = 10000


REPORT_SPECS: Tuple[ReportSpec, ...] = (
    ReportSpec(
        key="daily_overview",
        title="Tổng quan người dùng theo ngày / Daily Overview",
        description="Theo dõi DAU, New Users, Sessions, Engagement Rate và thời lượng tương tác hàng ngày.",
        dimensions=("date",),
        metrics=(
            "activeUsers",
            "newUsers",
            "totalUsers",
            "sessions",
            "engagedSessions",
            "engagementRate",
            "userEngagementDuration",
            "screenPageViews",
            "eventCount",
        ),
        order_by_dimension="date",
        limit=1000,
    ),
    ReportSpec(
        key="events_summary",
        title="Tổng hợp sự kiện / Events Summary",
        description="Thống kê số lượt và số người dùng cho từng tên sự kiện Firebase/GA4.",
        dimensions=("eventName",),
        metrics=("eventCount", "totalUsers", "eventCountPerUser"),
        order_by_metric="eventCount",
        limit=5000,
    ),
    ReportSpec(
        key="app_versions",
        title="Phiên bản ứng dụng & Hệ điều hành / App Versions & OS",
        description="Phân tích người dùng và phiên theo phiên bản APK/AAB và phiên bản Android.",
        dimensions=("appVersion", "operatingSystemVersion"),
        metrics=("activeUsers", "newUsers", "sessions", "userEngagementDuration"),
        order_by_metric="activeUsers",
        limit=5000,
    ),
    ReportSpec(
        key="geo_devices",
        title="Quốc gia & Thiết bị / Geography & Devices",
        description="Phân bổ người chơi theo quốc gia, dòng thiết bị và model điện thoại.",
        dimensions=("country", "deviceCategory", "mobileDeviceModel"),
        metrics=("activeUsers", "sessions", "engagedSessions", "userEngagementDuration"),
        order_by_metric="activeUsers",
        limit=10000,
    ),
    ReportSpec(
        key="hourly_activity",
        title="Lưu lượng theo giờ / Hourly Activity",
        description="Mức độ hoạt động theo khung giờ trong ngày (00..23).",
        dimensions=("hour",),
        metrics=("activeUsers", "sessions", "eventCount"),
        order_by_dimension="hour",
        limit=100,
    ),
    ReportSpec(
        key="games_performance",
        title="Hiệu suất từng Mini-Game / Mini-Game Performance",
        description="Chi tiết lượt mở, hoàn thành/thất bại level và thời gian chơi theo từng game.",
        dimensions=("eventName",),
        optional_dimensions=("customEvent:game_name", "customEvent:game_category"),
        metrics=("eventCount", "totalUsers"),
        optional_metrics=("customEvent:session_duration_sec",),
        event_names=GAME_EVENTS,
        order_by_metric="eventCount",
        limit=25000,
    ),
    ReportSpec(
        key="game_levels",
        title="Game và level / Game and level",
        description="Sự kiện level theo tên game và level; chỉ các game gọi bridge mới có dữ liệu.",
        dimensions=("eventName",),
        optional_dimensions=("customEvent:game_name", "customEvent:level_label"),
        metrics=("eventCount", "totalUsers"),
        event_names=("game_level_start", "game_level_complete", "game_level_failed", "game_level_reached", "game_level_restart"),
        order_by_metric="eventCount",
        limit=25000,
    ),
    ReportSpec(
        key="r2_downloads",
        title="Tải game On-Demand Cloudflare R2 / R2 On-Demand Downloads",
        description="Theo dõi trạng thái started / completed / failed và lỗi khi tải 319 game từ R2.",
        dimensions=("eventName",),
        optional_dimensions=(
            "customEvent:game_name",
            "customEvent:status",
            "customEvent:error_message",
        ),
        metrics=("eventCount", "totalUsers"),
        event_names=("game_download",),
        order_by_metric="eventCount",
        limit=10000,
    ),
    ReportSpec(
        key="search_terms",
        title="Từ khóa tìm kiếm mini-game / Launcher Search Terms",
        description="Thống kê từ khóa tìm kiếm đã làm sạch PII và số lượng game khớp từ sự kiện game_search.",
        dimensions=("eventName",),
        optional_dimensions=("customEvent:search_term",),
        metrics=("eventCount", "totalUsers"),
        optional_metrics=("customEvent:result_count",),
        event_names=("game_search",),
        order_by_metric="eventCount",
        limit=10000,
    ),
    ReportSpec(
        key="ads_funnel",
        title="Phễu quảng cáo & Mediation / Ads & Mediation Funnel",
        description="Số lượt request, loaded, impression, click, reward và mạng thắng thầu (Google/Meta).",
        dimensions=("eventName",),
        optional_dimensions=(
            "customEvent:ad_type",
            "customEvent:ad_unit_id",
            "customEvent:ad_network",
        ),
        metrics=("eventCount", "totalUsers"),
        event_names=ADS_EVENTS,
        order_by_metric="eventCount",
        limit=10000,
    ),
    ReportSpec(
        key="ads_format_events",
        title="Sự kiện quảng cáo theo định dạng / Ad events by format",
        description="Sự kiện mới theo định dạng và phiên bản; không cộng chung với ads_funnel cũ.",
        dimensions=("eventName", "appVersion"),
        optional_dimensions=("customEvent:ad_type", "customEvent:ad_unit_id", "customEvent:game_name", "customEvent:error_code"),
        metrics=("eventCount", "totalUsers"),
        event_names=FORMAT_AD_EVENTS,
        order_by_metric="eventCount",
        limit=25000,
    ),
    ReportSpec(
        key="ads_diagnostics",
        title="Chẩn đoán lỗi & Chặn quảng cáo / Ads Error Diagnostics",
        description="Phân tích mã lỗi no-fill, lỗi hiển thị và lý do suppress/cooldown quảng cáo.",
        dimensions=("eventName",),
        optional_dimensions=(
            "customEvent:ad_type",
            "customEvent:error_code",
            "customEvent:error_message",
            "customEvent:reason",
        ),
        metrics=("eventCount",),
        event_names=(
            "ad_failed_to_load",
            "ad_failed_to_show",
            "ad_mediation_failed",
            "ad_load_suppressed",
        ),
        order_by_metric="eventCount",
        limit=10000,
    ),
    ReportSpec(
        key="iap_funnel",
        title="Phễu mua hàng VIP IAP / In-App Purchase Funnel",
        description="Theo dõi chuyển đổi từ xem Paywall VIP đến khởi tạo và mua thành công/khôi phục.",
        dimensions=("eventName",),
        optional_dimensions=("customEvent:source", "customEvent:product_id"),
        metrics=("eventCount", "totalUsers"),
        event_names=IAP_EVENTS,
        order_by_metric="eventCount",
        limit=5000,
    ),
    ReportSpec(
        key="notifications_cohort",
        title="Hiệu quả Notification / Daily Notification Cohorts",
        description="Theo dõi lịch gửi, tỉ lệ hiển thị và tỉ lệ mở thông báo theo slot và khung giờ.",
        dimensions=("eventName",),
        optional_dimensions=(
            "customEvent:notification_slot",
            "customEvent:scheduled_hour",
            "customEvent:scheduled_hour_label",
            "customEvent:delivery_status",
            "customUser:notification_cohort_hour",
        ),
        metrics=("eventCount", "totalUsers"),
        event_names=NOTIFICATION_EVENTS,
        order_by_metric="eventCount",
        limit=10000,
    ),
    ReportSpec(
        key="notification_time_events",
        title="Notification 08h 12h 20h",
        description="Alias cho notification đã post; không cộng với notification_delivery để tránh đếm đôi.",
        dimensions=("eventName",),
        optional_dimensions=("customEvent:scheduled_hour_label", "customEvent:content_day_label", "customEvent:notification_phase", "customEvent:game_name"),
        metrics=("eventCount", "totalUsers"),
        event_names=NOTIFICATION_TIME_EVENTS,
        order_by_metric="eventCount",
        limit=10000,
    ),
) + build_roas_report_specs(ReportSpec)


def resolve_report_fields(
    spec: ReportSpec,
    available_dimensions: Iterable[str] | None,
    available_metrics: Iterable[str] | None,
) -> Tuple[List[str], List[str], List[str]]:
    """
    Lọc danh sách dimensions và metrics hợp lệ dựa trên metadata thực tế của GA4 Property.
    Filters report dimensions and metrics against GA4 Property metadata so unregistered
    custom definitions never trigger HTTP 400 InvalidArgument errors.

    Args:
        spec: Đặc tả báo cáo / Report specification.
        available_dimensions: Tập api_name dimension có sẵn trên property (None nếu bỏ qua lọc).
        available_metrics: Tập api_name metric có sẵn trên property (None nếu bỏ qua lọc).

    Returns:
        Tuple (valid_dimensions, valid_metrics, skipped_fields).
    """
    avail_dims: Set[str] | None = (
        set(available_dimensions) if available_dimensions is not None else None
    )
    avail_mets: Set[str] | None = (
        set(available_metrics) if available_metrics is not None else None
    )

    valid_dims: List[str] = list(spec.dimensions)
    valid_mets: List[str] = list(spec.metrics)
    skipped: List[str] = []

    for dim in spec.optional_dimensions:
        if avail_dims is None or dim in avail_dims:
            if len(valid_dims) < MAX_GA4_DIMENSIONS_PER_REQUEST:
                valid_dims.append(dim)
            else:
                skipped.append(dim)
        else:
            skipped.append(dim)

    for met in spec.optional_metrics:
        if avail_mets is None or met in avail_mets:
            if len(valid_mets) < MAX_GA4_METRICS_PER_REQUEST:
                valid_mets.append(met)
            else:
                skipped.append(met)
        else:
            skipped.append(met)

    return valid_dims, valid_mets, skipped
