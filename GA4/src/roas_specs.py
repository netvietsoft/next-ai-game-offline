"""
Đặc tả các bảng truy vấn GA4 cho Chi phí Quảng cáo (UA), Doanh thu (AdMob + IAP) và ROAS.
GA4 ReportSpec definitions for UA Ad Spend, Monetization Revenue (AdMob + IAP), and ROAS.

Tách riêng module để giữ kích thước mỗi tệp nhỏ gọn và đúng trách nhiệm đơn lẻ (SRP).
Separated into a dedicated module to maintain small file size and Single Responsibility (SRP).
"""

from __future__ import annotations

from typing import Tuple, Type, TypeVar

TReportSpec = TypeVar("TReportSpec")


def build_roas_report_specs(spec_cls: Type[TReportSpec]) -> Tuple[TReportSpec, ...]:
    """
    Khởi tạo 4 đặc tả báo cáo tài chính tương thích hoàn toàn với GA4 Data API v1beta.
    Build 4 financial report specs verified for dimension/metric compatibility on GA4 Data API.

    Lý do tách 4 bảng thay vì gộp chung / Why 4 separate queries are required:
    - GA4 Data API không cho phép ghép trực tiếp `advertiserAdCost` với `country` hoặc `adFormat`
      nếu thiếu chiều chiến dịch (`sessionCampaignName`), nên phải tách bảng doanh thu theo ngày/quốc gia
      khỏi bảng chi phí chiến dịch Google Ads rồi đối chiếu theo khóa `date`.
    """
    return (
        spec_cls(
            key="daily_monetization",
            title="Doanh thu AdMob & IAP theo ngày / Daily AdMob & IAP Revenue",
            description="Doanh thu quảng cáo AdMob, doanh thu IAP và lượt hiển thị publisher theo ngày.",
            dimensions=("date",),
            metrics=(
                "newUsers",
                "activeUsers",
                "totalAdRevenue",
                "purchaseRevenue",
                "totalRevenue",
                "publisherAdImpressions",
                "publisherAdClicks",
            ),
            order_by_dimension="date",
            limit=1000,
        ),
        spec_cls(
            key="ua_campaigns",
            title="Chi phí Google Ads & ROAS theo chiến dịch / UA Ad Spend & Campaign ROAS",
            description="Chi phí chạy quảng cáo UA, click, cài đặt mới và doanh thu theo ngày & chiến dịch.",
            dimensions=("date", "sessionCampaignName", "sessionSourceMedium"),
            metrics=(
                "newUsers",
                "activeUsers",
                "totalAdRevenue",
                "purchaseRevenue",
                "totalRevenue",
            ),
            optional_metrics=(
                "advertiserAdCost",
                "advertiserAdClicks",
                "advertiserAdImpressions",
                "returnOnAdSpend",
            ),
            order_by_dimension="date",
            limit=5000,
        ),
        spec_cls(
            key="ad_format_revenue",
            title="Doanh thu & eCPM theo phiên bản và định dạng / Ad Format Revenue & eCPM",
            description="Phân tách doanh thu AdMob, lượt hiển thị và eCPM theo phiên bản ứng dụng và loại ad.",
            dimensions=("appVersion", "adFormat", "adUnitName", "adSourceName"),
            metrics=(
                "totalAdRevenue",
                "publisherAdImpressions",
                "publisherAdClicks",
            ),
            order_by_metric="totalAdRevenue",
            limit=2000,
        ),
        spec_cls(
            key="country_revenue",
            title="Doanh thu & eCPM theo quốc gia / Revenue & eCPM by Country",
            description="Xếp hạng quốc gia theo tổng doanh thu, eCPM và ARPU trên 1.000 người dùng.",
            dimensions=("country",),
            metrics=(
                "newUsers",
                "activeUsers",
                "totalAdRevenue",
                "purchaseRevenue",
                "totalRevenue",
                "publisherAdImpressions",
                "publisherAdClicks",
            ),
            order_by_metric="totalRevenue",
            limit=500,
        ),
    )
