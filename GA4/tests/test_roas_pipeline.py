"""
Kiểm thử đơn vị cho pipeline Chi phí Quảng cáo (UA), Doanh thu (AdMob + IAP) và ROAS.
Unit tests for the UA Ad Spend, Monetization Revenue (AdMob + IAP), eCPM, and ROAS pipeline.
"""

from __future__ import annotations

from pathlib import Path
import sys

GA4_ROOT = Path(__file__).resolve().parent.parent
if str(GA4_ROOT) not in sys.path:
    sys.path.insert(0, str(GA4_ROOT))

from src.analyzer import GA4Analyzer  # noqa: E402
from src.report_builder import build_html_dashboard, build_markdown_report  # noqa: E402
from src.schema import REPORT_SPECS, resolve_report_fields  # noqa: E402


def test_roas_specs_registered_and_skip_unlinked_ads_metrics_safely() -> None:
    """
    Đảm bảo 4 bảng ROAS có trong REPORT_SPECS và tự bỏ qua metric Google Ads khi chưa liên kết.
    Verify the 4 ROAS specs exist and safely skip advertiser metrics on unlinked properties.
    """
    by_key = {spec.key: spec for spec in REPORT_SPECS}
    assert {
        "daily_monetization",
        "ua_campaigns",
        "ad_format_revenue",
        "country_revenue",
    }.issubset(by_key.keys())

    ua_spec = by_key["ua_campaigns"]
    dims, mets, skipped = resolve_report_fields(
        ua_spec,
        available_dimensions={"date", "sessionCampaignName", "sessionSourceMedium"},
        available_metrics={"newUsers", "activeUsers", "totalAdRevenue", "purchaseRevenue", "totalRevenue"},
    )
    assert dims == ["date", "sessionCampaignName", "sessionSourceMedium"]
    assert "advertiserAdCost" in skipped
    assert "totalRevenue" in mets


def test_roas_analyzer_exact_pnl_cpi_ecpm_and_blended_roas() -> None:
    """
    Kiểm tra độ chính xác toán học của Chi phí Ads, CPI, eCPM, Lãi/Lỗ và Blended ROAS.
    Verify exact arithmetic for UA Spend, Paid/Blended CPI, eCPM, Net P&L, and Blended ROAS.
    """
    bundle = {
        "meta": {"data_source": "LIVE_GA4", "property_id": "561301538"},
        "reports": {
            "daily_monetization": {
                "rows": [
                    {
                        "date": "20261120",
                        "newUsers": 100,
                        "activeUsers": 300,
                        "totalAdRevenue": 1.50,
                        "purchaseRevenue": 0.0,
                        "totalRevenue": 1.50,
                        "publisherAdImpressions": 5000,
                        "publisherAdClicks": 100,
                    },
                    {
                        "date": "20261121",
                        "newUsers": 300,
                        "activeUsers": 700,
                        "totalAdRevenue": 3.50,
                        "purchaseRevenue": 5.00,
                        "totalRevenue": 8.50,
                        "publisherAdImpressions": 5000,
                        "publisherAdClicks": 150,
                    },
                ]
            },
            "ua_campaigns": {
                "rows": [
                    {
                        "date": "20261120",
                        "sessionCampaignName": "Camp-A",
                        "sessionSourceMedium": "google / cpc",
                        "newUsers": 80,
                        "activeUsers": 120,
                        "advertiserAdCost": 10.00,
                        "advertiserAdClicks": 1000,
                        "advertiserAdImpressions": 20000,
                        "totalAdRevenue": 0.50,
                        "totalRevenue": 0.50,
                    },
                    {
                        "date": "20261121",
                        "sessionCampaignName": "Camp-A",
                        "sessionSourceMedium": "google / cpc",
                        "newUsers": 120,
                        "activeUsers": 200,
                        "advertiserAdCost": 30.00,
                        "advertiserAdClicks": 3000,
                        "advertiserAdImpressions": 80000,
                        "totalAdRevenue": 1.50,
                        "totalRevenue": 1.50,
                    },
                    {
                        "date": "20261121",
                        "sessionCampaignName": "(not set)",
                        "sessionSourceMedium": "(not set)",
                        "newUsers": 20,
                        "activeUsers": 400,
                        "advertiserAdCost": 0.0,
                        "advertiserAdClicks": 0,
                        "advertiserAdImpressions": 0,
                        "totalAdRevenue": 7.00,
                        "totalRevenue": 7.00,
                    },
                ]
            },
            "ad_format_revenue": {
                "rows": [
                    {
                        "appVersion": "1.3",
                        "adFormat": "Interstitial",
                        "adUnitName": "Trung gian",
                        "adSourceName": "AdMob Network",
                        "totalAdRevenue": 4.00,
                        "publisherAdImpressions": 2000,
                        "publisherAdClicks": 100,
                    }
                ]
            },
            "country_revenue": {
                "rows": [
                    {
                        "country": "United States",
                        "newUsers": 20,
                        "activeUsers": 50,
                        "totalAdRevenue": 2.50,
                        "purchaseRevenue": 5.00,
                        "totalRevenue": 7.50,
                        "publisherAdImpressions": 1000,
                        "publisherAdClicks": 20,
                    }
                ]
            },
        },
    }

    analysis = GA4Analyzer(bundle).analyze()
    roas = analysis["roas"]

    assert roas["ad_spend_usd"] == 40.0
    assert roas["ua_clicks"] == 4000
    assert roas["cpc_usd"] == 0.01
    assert roas["ua_ctr_pct"] == 4.0
    assert roas["total_new_users"] == 400
    assert roas["paid_cpc_new_users"] == 200
    assert roas["blended_cpi_usd"] == 0.10
    assert roas["paid_cpi_usd"] == 0.20
    assert roas["ad_revenue_usd"] == 5.0
    assert roas["iap_revenue_usd"] == 5.0
    assert roas["total_revenue_usd"] == 10.0
    assert roas["net_profit_usd"] == -30.0
    assert roas["blended_roas_pct"] == 25.0
    assert roas["overall_ecpm_usd"] == 0.5
    assert roas["format_ecpm"][0]["ecpm_usd"] == 2.0
    assert roas["top_countries_revenue"][0]["arpu_per_1k_usd"] == 150.0
    assert any("ROAS" in rec for rec in analysis["recommendations"])

    md_text = build_markdown_report(analysis)
    html_text = build_html_dashboard(analysis)
    assert "## 8. Chi Phí Quảng Cáo (UA), Doanh Thu & Chỉ Số ROAS" in md_text
    assert "-$30.00" in md_text
    assert "25.0%" in md_text
    assert "Chi Phí Google Ads (UA)" in html_text
