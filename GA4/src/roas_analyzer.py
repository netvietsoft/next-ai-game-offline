"""
Bộ phân tích Chi phí Quảng cáo (UA Spend), Doanh thu (AdMob + IAP), Lãi/Lỗ và Chỉ số ROAS.
Financial analyzer for UA Ad Spend, Monetization Revenue (AdMob + IAP), Net P&L, eCPM, and ROAS.

Giải thích nghiệp vụ / Why Blended ROAS is primary:
Trên GA4, nhiều phiên từ Google Ads bị rơi vào `(not set)` khi chưa kịp gắn tên chiến dịch hoặc
khi sự kiện `ad_impression` nổ đầu phiên. Vì vậy chỉ số ROAS tổng thể (Blended ROAS = Tổng Doanh Thu /
Tổng Chi Phí Ads) phản ánh trung thực hiệu quả thu hồi vốn hơn ROAS đơn lẻ từng dòng chiến dịch.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, List


def _num(value: Any) -> float:
    """Chuyển đổi an toàn sang số thực / Safely parse numeric value into float."""
    if value is None or value == "":
        return 0.0
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _inum(value: Any) -> int:
    """Chuyển đổi an toàn sang số nguyên / Safely parse numeric value into integer."""
    return int(round(_num(value)))


def _div(numerator: float, denominator: float) -> float:
    """Chia an toàn tránh chia cho 0 / Guarded division returning 0.0 when denominator <= 0."""
    return numerator / denominator if denominator > 0 else 0.0


def _fmt_date(raw: str) -> str:
    """Định dạng ngày YYYYMMDD thành YYYY-MM-DD / Format YYYYMMDD string as YYYY-MM-DD."""
    clean = str(raw or "").strip()
    if len(clean) == 8 and clean.isdigit():
        return f"{clean[:4]}-{clean[4:6]}-{clean[6:8]}"
    return clean


def _extract_rows(reports: Dict[str, Any], key: str) -> List[Dict[str, Any]]:
    """Trích danh sách dòng từ khóa báo cáo / Extract row list safely from reports dict."""
    payload = reports.get(key, {})
    rows = payload.get("rows", []) if isinstance(payload, dict) else []
    return rows if isinstance(rows, list) else []


def _aggregate_daily_spend(ua_rows: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
    """
    Gom chi phí quảng cáo, lượt nhấp và lượt cài đặt trả phí theo từng ngày.
    Aggregate advertiser spend, clicks, impressions, and paid CPC new users by date.
    """
    by_date: Dict[str, Dict[str, float]] = defaultdict(
        lambda: {"spend": 0.0, "clicks": 0.0, "imps": 0.0, "paid_new": 0.0}
    )
    for row in ua_rows:
        dt = _fmt_date(str(row.get("date", "")))
        if not dt:
            continue
        bucket = by_date[dt]
        bucket["spend"] += _num(row.get("advertiserAdCost"))
        bucket["clicks"] += _num(row.get("advertiserAdClicks"))
        bucket["imps"] += _num(row.get("advertiserAdImpressions"))
        if str(row.get("sessionSourceMedium", "")).strip().lower() == "google / cpc":
            bucket["paid_new"] += _num(row.get("newUsers"))
    return by_date


def _build_daily_pnl(
    rev_rows: List[Dict[str, Any]],
    spend_by_date: Dict[str, Dict[str, float]],
) -> List[Dict[str, Any]]:
    """
    Ghép bảng doanh thu ngày với chi phí quảng cáo ngày để tính Lãi/Lỗ và Blended ROAS từng ngày.
    Join daily revenue rows with daily UA spend to compute daily Net P&L, eCPM, and Blended ROAS.
    """
    rev_by_date: Dict[str, Dict[str, Any]] = {}
    for row in rev_rows:
        dt = _fmt_date(str(row.get("date", "")))
        if dt:
            rev_by_date[dt] = row

    all_dates = sorted(set(rev_by_date.keys()) | set(spend_by_date.keys()))
    series: List[Dict[str, Any]] = []
    for dt in all_dates:
        r_row = rev_by_date.get(dt, {})
        s_row = spend_by_date.get(dt, {})
        spend = _num(s_row.get("spend"))
        ad_rev = _num(r_row.get("totalAdRevenue"))
        iap_rev = _num(r_row.get("purchaseRevenue"))
        tot_rev = _num(r_row.get("totalRevenue")) or (ad_rev + iap_rev)
        pub_imps = _inum(r_row.get("publisherAdImpressions"))
        pub_clicks = _inum(r_row.get("publisherAdClicks"))
        series.append(
            {
                "date": dt,
                "dau": _inum(r_row.get("activeUsers")),
                "new_users": _inum(r_row.get("newUsers")),
                "paid_cpc_new_users": _inum(s_row.get("paid_new")),
                "spend_usd": round(spend, 4),
                "ua_clicks": _inum(s_row.get("clicks")),
                "ua_impressions": _inum(s_row.get("imps")),
                "ad_revenue_usd": round(ad_rev, 4),
                "iap_revenue_usd": round(iap_rev, 4),
                "total_revenue_usd": round(tot_rev, 4),
                "net_profit_usd": round(tot_rev - spend, 4),
                "blended_roas_pct": round(_div(tot_rev, spend) * 100.0, 2),
                "publisher_impressions": pub_imps,
                "publisher_clicks": pub_clicks,
                "ecpm_usd": round(_div(ad_rev, pub_imps) * 1000.0, 3),
            }
        )
    return series


def _build_campaigns(ua_rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Tổng hợp chi phí, CPC, CPI và doanh thu gắn trực tiếp cho từng chiến dịch quảng cáo.
    Aggregate UA spend, CPC, CPI, and directly attributed revenue per campaign & source/medium.
    """
    grouped: Dict[tuple[str, str], Dict[str, float]] = defaultdict(
        lambda: {"spend": 0.0, "clicks": 0.0, "imps": 0.0, "new": 0.0, "rev": 0.0}
    )
    for row in ua_rows:
        camp = str(row.get("sessionCampaignName") or "(not set)").strip() or "(empty)"
        src = str(row.get("sessionSourceMedium") or "(not set)").strip() or "(empty)"
        acc = grouped[(camp, src)]
        acc["spend"] += _num(row.get("advertiserAdCost"))
        acc["clicks"] += _num(row.get("advertiserAdClicks"))
        acc["imps"] += _num(row.get("advertiserAdImpressions"))
        acc["new"] += _num(row.get("newUsers"))
        acc["rev"] += _num(row.get("totalRevenue")) or _num(row.get("totalAdRevenue"))

    items: List[Dict[str, Any]] = []
    for (camp, src), acc in grouped.items():
        spend = acc["spend"]
        clicks = _inum(acc["clicks"])
        new_u = _inum(acc["new"])
        rev = acc["rev"]
        items.append(
            {
                "campaign_name": camp,
                "source_medium": src,
                "spend_usd": round(spend, 4),
                "ua_impressions": _inum(acc["imps"]),
                "ua_clicks": clicks,
                "cpc_usd": round(_div(spend, clicks), 4),
                "new_users": new_u,
                "cpi_usd": round(_div(spend, new_u), 4),
                "attributed_revenue_usd": round(rev, 4),
                "direct_roas_pct": round(_div(rev, spend) * 100.0, 2),
            }
        )
    items.sort(key=lambda x: (-x["spend_usd"], -x["attributed_revenue_usd"], -x["new_users"]))
    return items[:15]


def _build_format_ecpm(fmt_rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Tính doanh thu, CTR và eCPM theo cặp (phiên bản ứng dụng, định dạng quảng cáo).
    Compute publisher ad revenue, CTR, and eCPM grouped by (appVersion, adFormat).
    """
    grouped: Dict[tuple[str, str], Dict[str, float]] = defaultdict(
        lambda: {"rev": 0.0, "imps": 0.0, "clicks": 0.0}
    )
    for row in fmt_rows:
        ver = str(row.get("appVersion") or "(not set)").strip()
        fmt = str(row.get("adFormat") or "").strip()
        if not fmt or fmt == "(not set)":
            continue
        acc = grouped[(ver, fmt)]
        acc["rev"] += _num(row.get("totalAdRevenue"))
        acc["imps"] += _num(row.get("publisherAdImpressions"))
        acc["clicks"] += _num(row.get("publisherAdClicks"))

    out: List[Dict[str, Any]] = []
    for (ver, fmt), acc in grouped.items():
        rev = acc["rev"]
        imps = _inum(acc["imps"])
        clicks = _inum(acc["clicks"])
        out.append(
            {
                "app_version": ver,
                "ad_format": fmt,
                "revenue_usd": round(rev, 4),
                "impressions": imps,
                "clicks": clicks,
                "ctr_pct": round(_div(clicks, imps) * 100.0, 2),
                "ecpm_usd": round(_div(rev, imps) * 1000.0, 3),
            }
        )
    out.sort(key=lambda x: (x["app_version"], x["revenue_usd"]), reverse=True)
    return out


def _build_country_revenue(cty_rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Xếp hạng các quốc gia theo doanh thu, eCPM và ARPU trên 1.000 người dùng hoạt động.
    Rank countries by total revenue, publisher eCPM, and ARPU per 1,000 active users.
    """
    out: List[Dict[str, Any]] = []
    for row in cty_rows:
        country = str(row.get("country") or "(not set)").strip()
        active = _inum(row.get("activeUsers"))
        new_u = _inum(row.get("newUsers"))
        ad_rev = _num(row.get("totalAdRevenue"))
        tot_rev = _num(row.get("totalRevenue")) or ad_rev
        imps = _inum(row.get("publisherAdImpressions"))
        out.append(
            {
                "country": country,
                "active_users": active,
                "new_users": new_u,
                "revenue_usd": round(tot_rev, 4),
                "impressions": imps,
                "ecpm_usd": round(_div(ad_rev, imps) * 1000.0, 3),
                "arpu_per_1k_usd": round(_div(tot_rev, active) * 1000.0, 2),
            }
        )
    out.sort(key=lambda x: (-x["revenue_usd"], -x["active_users"]))
    return out[:12]


def analyze_roas(reports: Dict[str, Any]) -> Dict[str, Any]:
    """
    Điểm vào chính tính toán toàn bộ bức tranh Chi phí Ads, Doanh thu, Lãi/Lỗ và ROAS.
    Main entrypoint computing consolidated UA Ad Spend, Revenue, Net P&L, eCPM, and ROAS KPIs.
    """
    rev_rows = _extract_rows(reports, "daily_monetization")
    ua_rows = _extract_rows(reports, "ua_campaigns")
    fmt_rows = _extract_rows(reports, "ad_format_revenue")
    cty_rows = _extract_rows(reports, "country_revenue")

    spend_by_date = _aggregate_daily_spend(ua_rows)
    daily_pnl = _build_daily_pnl(rev_rows, spend_by_date)

    tot_spend = sum(d["spend_usd"] for d in daily_pnl)
    tot_ua_clicks = sum(d["ua_clicks"] for d in daily_pnl)
    tot_ua_imps = sum(d["ua_impressions"] for d in daily_pnl)
    tot_new = sum(d["new_users"] for d in daily_pnl)
    tot_paid_new = sum(d["paid_cpc_new_users"] for d in daily_pnl)
    tot_ad_rev = sum(d["ad_revenue_usd"] for d in daily_pnl)
    tot_iap_rev = sum(d["iap_revenue_usd"] for d in daily_pnl)
    tot_rev = sum(d["total_revenue_usd"] for d in daily_pnl)
    tot_pub_imps = sum(d["publisher_impressions"] for d in daily_pnl)
    tot_pub_clicks = sum(d["publisher_clicks"] for d in daily_pnl)

    return {
        "currency": "USD",
        "ad_spend_usd": round(tot_spend, 4),
        "ua_impressions": tot_ua_imps,
        "ua_clicks": tot_ua_clicks,
        "cpc_usd": round(_div(tot_spend, tot_ua_clicks), 4),
        "ua_ctr_pct": round(_div(tot_ua_clicks, tot_ua_imps) * 100.0, 2),
        "total_new_users": tot_new,
        "paid_cpc_new_users": tot_paid_new,
        "blended_cpi_usd": round(_div(tot_spend, tot_new), 4),
        "paid_cpi_usd": round(_div(tot_spend, tot_paid_new), 4),
        "ad_revenue_usd": round(tot_ad_rev, 4),
        "iap_revenue_usd": round(tot_iap_rev, 4),
        "total_revenue_usd": round(tot_rev, 4),
        "net_profit_usd": round(tot_rev - tot_spend, 4),
        "blended_roas_pct": round(_div(tot_rev, tot_spend) * 100.0, 2),
        "publisher_impressions": tot_pub_imps,
        "publisher_clicks": tot_pub_clicks,
        "overall_ecpm_usd": round(_div(tot_ad_rev, tot_pub_imps) * 1000.0, 3),
        "daily_pnl": daily_pnl,
        "campaigns": _build_campaigns(ua_rows),
        "format_ecpm": _build_format_ecpm(fmt_rows),
        "top_countries_revenue": _build_country_revenue(cty_rows),
    }


def build_roas_recommendations(roas: Dict[str, Any]) -> List[str]:
    """
    Sinh khuyến nghị tự động về hiệu quả chi tiêu UA và ROAS khi phát hiện mất cân đối thu-chi.
    Generate automated UA & ROAS optimization advice when spend/revenue imbalance is detected.
    """
    spend = _num(roas.get("ad_spend_usd"))
    roas_pct = _num(roas.get("blended_roas_pct"))
    ecpm = _num(roas.get("overall_ecpm_usd"))
    cpi = _num(roas.get("paid_cpi_usd"))
    if spend <= 0 or roas_pct >= 80.0:
        return []
    return [
        f"HIỆU QUẢ CHI TIÊU ADS (ROAS): Blended ROAS hiện đạt {roas_pct}% "
        f"(Chi ${spend:,.2f} / Thu ${roas.get('total_revenue_usd', 0):,.2f}, "
        f"Paid CPI ${cpi:,.3f} vs eCPM TB ${ecpm:,.3f}). "
        "Cần loại trừ các quốc gia Tier-3 có eCPM < $0.10 khỏi chiến dịch Install Volume "
        "và chuyển Google Ads sang đấu thầu Target ROAS (Ad Revenue)."
    ]
