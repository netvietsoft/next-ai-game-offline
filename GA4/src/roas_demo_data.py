"""
Dữ liệu mẫu cho 4 bảng tài chính ROAS & Doanh thu khi chạy chế độ `--demo` ngoại tuyến.
Deterministic sample rows for the 4 ROAS & Monetization tables in offline `--demo` mode.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any, Dict, List


def generate_roas_demo_rows(start_dt: date, lookback_days: int) -> Dict[str, List[Dict[str, Any]]]:
    """
    Sinh dữ liệu mô phỏng nhất quán cho daily_monetization, ua_campaigns, ad_format_revenue, country_revenue.
    Generate deterministic sample rows for daily_monetization, ua_campaigns, ad_format_revenue, country_revenue.
    """
    daily_monetization: List[Dict[str, Any]] = []
    ua_campaigns: List[Dict[str, Any]] = []

    for idx in range(lookback_days):
        cur_dt = (start_dt + timedelta(days=idx)).strftime("%Y%m%d")
        dau = 400 + idx * 35
        new_u = 80 + idx * 10
        imps = dau * 6
        ad_rev = round(imps * 0.00032, 4)
        iap_rev = 4.99 if idx % 5 == 0 else 0.0
        tot_rev = round(ad_rev + iap_rev, 4)
        daily_monetization.append(
            {
                "date": cur_dt,
                "newUsers": new_u,
                "activeUsers": dau,
                "totalAdRevenue": ad_rev,
                "purchaseRevenue": iap_rev,
                "totalRevenue": tot_rev,
                "publisherAdImpressions": imps,
                "publisherAdClicks": max(1, imps // 40),
            }
        )
        paid_new = int(new_u * 0.75)
        spend = round(paid_new * 0.035, 4)
        ua_campaigns.append(
            {
                "date": cur_dt,
                "sessionCampaignName": "App promotion-Demo",
                "sessionSourceMedium": "google / cpc",
                "newUsers": paid_new,
                "activeUsers": int(dau * 0.7),
                "advertiserAdCost": spend,
                "advertiserAdClicks": paid_new * 4,
                "advertiserAdImpressions": paid_new * 110,
                "totalAdRevenue": round(ad_rev * 0.7, 4),
                "purchaseRevenue": iap_rev,
                "totalRevenue": round(ad_rev * 0.7 + iap_rev, 4),
                "returnOnAdSpend": round((ad_rev * 0.7 + iap_rev) / max(spend, 0.01), 4),
            }
        )

    ad_format_revenue = [
        {
            "appVersion": "1.3",
            "adFormat": "Interstitial",
            "adUnitName": "Trung gian",
            "adSourceName": "AdMob Network",
            "totalAdRevenue": 12.45,
            "publisherAdImpressions": 6200,
            "publisherAdClicks": 180,
        },
        {
            "appVersion": "1.3",
            "adFormat": "Native advanced",
            "adUnitName": "Native",
            "adSourceName": "AdMob Network",
            "totalAdRevenue": 4.20,
            "publisherAdImpressions": 9500,
            "publisherAdClicks": 240,
        },
        {
            "appVersion": "1.3",
            "adFormat": "Banner",
            "adUnitName": "Banner",
            "adSourceName": "AdMob Network",
            "totalAdRevenue": 5.10,
            "publisherAdImpressions": 14000,
            "publisherAdClicks": 260,
        },
    ]

    country_revenue = [
        {
            "country": "United States",
            "newUsers": 120,
            "activeUsers": 180,
            "totalAdRevenue": 8.50,
            "purchaseRevenue": 9.98,
            "totalRevenue": 18.48,
            "publisherAdImpressions": 2900,
            "publisherAdClicks": 65,
        },
        {
            "country": "Indonesia",
            "newUsers": 420,
            "activeUsers": 610,
            "totalAdRevenue": 4.10,
            "purchaseRevenue": 0.0,
            "totalRevenue": 4.10,
            "publisherAdImpressions": 16500,
            "publisherAdClicks": 320,
        },
    ]

    return {
        "daily_monetization": daily_monetization,
        "ua_campaigns": ua_campaigns,
        "ad_format_revenue": ad_format_revenue,
        "country_revenue": country_revenue,
    }
