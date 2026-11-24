"""
Trình kết xuất phần Báo cáo Chi phí Ads, Doanh thu & ROAS cho Markdown và HTML Dashboard.
Renders UA Ad Spend, Revenue (AdMob + IAP), Net P&L, and ROAS sections for Markdown & HTML.
"""

from __future__ import annotations

import html
from typing import Any, Dict, List


def _usd(value: Any, digits: int = 2) -> str:
    """Định dạng số tiền USD có dấu phân cách hàng nghìn / Format USD currency string."""
    try:
        num = float(value or 0.0)
    except (TypeError, ValueError):
        num = 0.0
    if num < 0:
        return f"-${abs(num):,.{digits}f}"
    return f"${num:,.{digits}f}"


def _int_fmt(value: Any) -> str:
    """Định dạng số nguyên có dấu phẩy / Format integer with thousand separators."""
    try:
        return f"{int(round(float(value or 0))):,}"
    except (TypeError, ValueError):
        return "0"


def render_roas_markdown(roas: Dict[str, Any]) -> List[str]:
    """
    Tạo danh sách dòng Markdown cho mục 8: Chi Phí Ads (UA), Doanh Thu & Chỉ Số ROAS.
    Build Markdown lines for Section 8: UA Ad Spend, Monetization Revenue & ROAS.
    """
    if not roas:
        return []

    lines: List[str] = [
        "",
        "## 8. Chi Phí Quảng Cáo (UA), Doanh Thu & Chỉ Số ROAS",
        "",
        "| Chỉ Số Tài Chính | Giá Trị (USD) | Chi Tiết & Công Thức |",
        "| :--- | ---: | :--- |",
        (
            f"| **Tổng Chi Phí Ads (Google Ads Spend)** | **{_usd(roas.get('ad_spend_usd'))}** | "
            f"{_int_fmt(roas.get('ua_impressions'))} imps · {_int_fmt(roas.get('ua_clicks'))} clicks · "
            f"CPC: {_usd(roas.get('cpc_usd'), 4)} (CTR {roas.get('ua_ctr_pct', 0)}%) |"
        ),
        (
            f"| **Chi Phí / Cài Đặt (CPI)** | **{_usd(roas.get('blended_cpi_usd'), 4)}** | "
            f"Paid CPC CPI: {_usd(roas.get('paid_cpi_usd'), 4)} "
            f"({_int_fmt(roas.get('paid_cpc_new_users'))} paid / {_int_fmt(roas.get('total_new_users'))} new users) |"
        ),
        (
            f"| **Doanh Thu AdMob (`totalAdRevenue`)** | **{_usd(roas.get('ad_revenue_usd'), 4)}** | "
            f"{_int_fmt(roas.get('publisher_impressions'))} imps · "
            f"eCPM gộp: **{_usd(roas.get('overall_ecpm_usd'), 3)}** |"
        ),
        (
            f"| **Doanh Thu Gói VIP (`purchaseRevenue`)** | **{_usd(roas.get('iap_revenue_usd'), 4)}** | "
            "Doanh thu In-App Purchase / Subscription |"
        ),
        (
            f"| **Tổng Doanh Thu (`totalRevenue`)** | **{_usd(roas.get('total_revenue_usd'), 4)}** | "
            "AdMob + Google Play Billing |"
        ),
        (
            f"| **Lãi / Lỗ Gộp (Net P&L)** | **{_usd(roas.get('net_profit_usd'))}** | "
            "`Tổng Doanh Thu - Tổng Chi Phí Ads` |"
        ),
        (
            f"| **Chỉ Số ROAS Tổng Thể (Blended ROAS)** | **{roas.get('blended_roas_pct', 0)}%** | "
            "`Tổng Doanh Thu / Tổng Chi Phí Ads` |"
        ),
    ]

    campaigns = roas.get("campaigns", [])[:8]
    if campaigns:
        lines.extend(
            [
                "",
                "### Hiệu Quả Theo Chiến Dịch / Nguồn Cài Đặt",
                "",
                "| Chiến Dịch | Nguồn / Kênh | Chi Phí | Clicks | New Users | "
                "CPI | Doanh Thu Gắn Trực Tiếp | ROAS Trực Tiếp |",
                "| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: |",
            ]
        )
        for c in campaigns:
            lines.append(
                f"| `{c['campaign_name']}` | `{c['source_medium']}` | {_usd(c['spend_usd'])} | "
                f"{_int_fmt(c['ua_clicks'])} | {_int_fmt(c['new_users'])} | {_usd(c['cpi_usd'], 3)} | "
                f"{_usd(c['attributed_revenue_usd'], 4)} | {c['direct_roas_pct']}% |"
            )

    fmt_ecpm = roas.get("format_ecpm", [])[:10]
    if fmt_ecpm:
        lines.extend(
            [
                "",
                "### Doanh Thu & eCPM Theo Phiên Bản Và Định Dạng",
                "",
                "| Phiên Bản | Định Dạng | Doanh Thu | Impressions | Clicks | CTR | eCPM |",
                "| :---: | :--- | ---: | ---: | ---: | ---: | ---: |",
            ]
        )
        for f_row in fmt_ecpm:
            lines.append(
                f"| `{f_row['app_version']}` | `{f_row['ad_format']}` | {_usd(f_row['revenue_usd'], 4)} | "
                f"{_int_fmt(f_row['impressions'])} | {_int_fmt(f_row['clicks'])} | "
                f"{f_row['ctr_pct']}% | **{_usd(f_row['ecpm_usd'], 3)}** |"
            )

    daily = roas.get("daily_pnl", [])[-10:]
    if daily:
        lines.extend(
            [
                "",
                "### Bảng Lãi / Lỗ & Blended ROAS 10 Ngày Gần Nhất",
                "",
                "| Ngày | DAU | New Users | Chi Phí Ads | Doanh Thu | "
                "Imps (AdMob) | eCPM | Lãi/Lỗ Ngày | Blended ROAS |",
                "| :---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
            ]
        )
        for d in daily:
            lines.append(
                f"| `{d['date']}` | {_int_fmt(d['dau'])} | {_int_fmt(d['new_users'])} | "
                f"{_usd(d['spend_usd'])} | {_usd(d['total_revenue_usd'], 4)} | "
                f"{_int_fmt(d['publisher_impressions'])} | {_usd(d['ecpm_usd'], 3)} | "
                f"{_usd(d['net_profit_usd'])} | **{d['blended_roas_pct']}%** |"
            )

    cty = roas.get("top_countries_revenue", [])[:10]
    if cty:
        lines.extend(
            [
                "",
                "### Top Quốc Gia Theo Doanh Thu, eCPM & ARPU",
                "",
                "| Quốc Gia | Active Users | Doanh Thu | Impressions | eCPM | ARPU / 1,000 Users |",
                "| :--- | ---: | ---: | ---: | ---: | ---: |",
            ]
        )
        for r in cty:
            lines.append(
                f"| {r['country']} | {_int_fmt(r['active_users'])} | {_usd(r['revenue_usd'], 4)} | "
                f"{_int_fmt(r['impressions'])} | {_usd(r['ecpm_usd'], 3)} | {_usd(r['arpu_per_1k_usd'], 2)} |"
            )

    return lines


def render_roas_html(roas: Dict[str, Any]) -> str:
    """
    Kết xuất khối thẻ KPI tài chính và 2 bảng Chiến dịch / eCPM cho Dashboard HTML Sáng/Tối.
    Render responsive financial KPI cards and Campaign/eCPM tables for the Light/Dark HTML dashboard.
    """
    if not roas:
        return ""

    camp_rows = "".join(
        f"<tr><td><code>{html.escape(str(c['campaign_name']))}</code></td>"
        f"<td class='num'>{_usd(c['spend_usd'])}</td>"
        f"<td class='num'>{_int_fmt(c['new_users'])}</td>"
        f"<td class='num'>{_usd(c['cpi_usd'], 3)}</td>"
        f"<td class='num'>{_usd(c['attributed_revenue_usd'], 3)}</td></tr>"
        for c in roas.get("campaigns", [])[:7]
    ) or "<tr><td colspan='5'>Chưa có dữ liệu chiến dịch Google Ads.</td></tr>"

    fmt_rows = "".join(
        f"<tr><td><code>v{html.escape(str(f['app_version']))}</code></td>"
        f"<td>{html.escape(str(f['ad_format']))}</td>"
        f"<td class='num'>{_usd(f['revenue_usd'], 3)}</td>"
        f"<td class='num'>{_int_fmt(f['impressions'])}</td>"
        f"<td class='num'>{_usd(f['ecpm_usd'], 3)}</td></tr>"
        for f in roas.get("format_ecpm", [])[:7]
    ) or "<tr><td colspan='5'>Chưa có dữ liệu doanh thu định dạng quảng cáo.</td></tr>"

    return f"""
    <section class="kpi-grid">
      <article class="card">
        <div class="kpi-label">Chi Phí Google Ads (UA)</div>
        <div class="kpi-value">{_usd(roas.get('ad_spend_usd'))}</div>
        <div class="kpi-sub">
          Paid CPI: {_usd(roas.get('paid_cpi_usd'), 3)} &bull; CPC: {_usd(roas.get('cpc_usd'), 4)}
        </div>
      </article>
      <article class="card">
        <div class="kpi-label">Tổng Doanh Thu (AdMob + IAP)</div>
        <div class="kpi-value">{_usd(roas.get('total_revenue_usd'), 2)}</div>
        <div class="kpi-sub">
          AdMob: {_usd(roas.get('ad_revenue_usd'), 2)} &bull; IAP: {_usd(roas.get('iap_revenue_usd'), 2)}
        </div>
      </article>
      <article class="card">
        <div class="kpi-label">Blended ROAS / Lãi Lỗ</div>
        <div class="kpi-value">{roas.get('blended_roas_pct', 0)}%</div>
        <div class="kpi-sub">
          Net P&amp;L: {_usd(roas.get('net_profit_usd'))} &bull; eCPM: {_usd(roas.get('overall_ecpm_usd'), 3)}
        </div>
      </article>
    </section>

    <section class="grid-2">
      <article class="card">
        <h2>Chi Phí &amp; CPI Theo Chiến Dịch Google Ads</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Chiến dịch</th><th class="num">Chi phí</th><th class="num">New Users</th><th class="num">CPI</th><th class="num">Thu trực tiếp</th></tr></thead>
            <tbody>{camp_rows}</tbody>
          </table>
        </div>
      </article>
      <article class="card">
        <h2>Doanh Thu &amp; eCPM Theo Phiên Bản / Định Dạng</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Bản</th><th>Định dạng</th><th class="num">Doanh thu</th><th class="num">Imps</th><th class="num">eCPM</th></tr></thead>
            <tbody>{fmt_rows}</tbody>
          </table>
        </div>
      </article>
    </section>
"""
