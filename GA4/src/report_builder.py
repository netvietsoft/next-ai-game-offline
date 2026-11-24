"""
Trình xuất báo cáo phân tích Markdown và Dashboard HTML Sáng/Tối đáp ứng thiết bị di động.
Generates structured Markdown analysis reports and a responsive Light/Dark HTML dashboard.
"""

from __future__ import annotations

import html
import json
from pathlib import Path
from typing import Any, Dict, List, Sequence

from .roas_report_section import render_roas_html, render_roas_markdown


def _fmt_num(val: Any) -> str:
    """
    Định dạng số có dấu phẩy phân tách hàng nghìn cho bảng báo cáo.
    Format numeric values with thousand separators for report readability.
    """
    if isinstance(val, float):
        if val.is_integer():
            return f"{int(val):,}"
        return f"{val:,.2f}"
    if isinstance(val, int):
        return f"{val:,}"
    return str(val)


def _source_badge(data_source: str) -> str:
    """
    Trả về nhãn nguồn dữ liệu rõ ràng để tránh nhầm lẫn giữa Demo và Live GA4.
    Return a clear source badge distinguishing Demo Preview from Live GA4 data.
    """
    if data_source == "LIVE_GA4":
        return "[LIVE GA4 DATA]"
    return "[DEMO PREVIEW - CHƯA KẾT NỐI KEY THẬT]"


def build_markdown_report(analysis: Dict[str, Any]) -> str:
    """
    Biên soạn báo cáo phân tích GA4 đầy đủ dưới định dạng Markdown.
    Render the full GA4 analysis payload into a structured Vietnamese/English Markdown report.
    """
    meta = analysis.get("meta", {})
    ov = analysis.get("overview", {})
    vg = analysis.get("versions_geo", {})
    gp = analysis.get("gameplay", {})
    ads = analysis.get("ads", {})
    iap = analysis.get("iap", {})
    notif = analysis.get("notifications", {})
    audit = analysis.get("schema_audit", {})
    recs: List[str] = analysis.get("recommendations", [])

    source_tag = _source_badge(str(meta.get("data_source", "DEMO_PREVIEW")))
    lines: List[str] = [
        f"# BÁO CÁO PHÂN TÍCH GA4 — GAME GATE OFFLINE {source_tag}",
        "",
        f"- **Nguồn dữ liệu:** `{source_tag}`",
        f"- **GA4 Property ID:** `{meta.get('property_id', 'N/A')}`",
        f"- **Khoảng thời gian:** `{meta.get('start_date', 'N/A')}` → `{meta.get('end_date', 'N/A')}` ({ov.get('days_count', 0)} ngày)",
        f"- **Thời điểm trích xuất (UTC):** `{meta.get('extracted_at_utc', 'N/A')}`",
        f"- **Tình trạng Schema Custom:** Dimensions `{audit.get('registered_dimensions_count', 0)}/{audit.get('total_expected_dimensions', 0)}` | Metrics `{audit.get('registered_metrics_count', 0)}/{audit.get('total_expected_metrics', 0)}`",
        "",
        "---",
        "",
        "## 1. Tổng Quan Người Dùng & Tương Tác (Overview)",
        "",
        "| Chỉ Số KPI | Giá Trị | Ghi Chú |",
        "| :--- | ---: | :--- |",
        f"| **DAU Trung Bình** | {_fmt_num(ov.get('avg_dau', 0))} | Đỉnh ngày cao nhất: {_fmt_num(ov.get('max_dau', 0))} |",
        f"| **Xu Hướng DAU (Nửa cuối vs Nửa đầu kỳ)** | {ov.get('trend_dau_pct', 0)}% | Tăng/giảm giữa 2 nửa chu kỳ |",
        f"| **Tổng Người Dùng Mới (New Users)** | {_fmt_num(ov.get('total_new_users', 0))} | Cộng dồn theo ngày |",
        f"| **Tổng Phiên (Sessions)** | {_fmt_num(ov.get('total_sessions', 0))} | Engaged Sessions: {_fmt_num(ov.get('total_engaged_sessions', 0))} |",
        f"| **Engagement Rate** | {ov.get('engagement_rate_pct', 0)}% | Tỉ lệ phiên có tương tác thực |",
        f"| **Thời Gian Tương Tác TB / DAU** | {ov.get('avg_engagement_min_per_dau', 0)} phút | Trung bình mỗi người chơi/ngày |",
        f"| **Tổng Sự Kiện (Event Count)** | {_fmt_num(ov.get('total_events', 0))} | Active 30 phút gần nhất: {_fmt_num(ov.get('realtime_active_users_30m', 0))} |",
        "",
        "## 2. Khuyến Nghị Hành Động Tự Động (Actionable Recommendations)",
        "",
    ]
    for idx, rec in enumerate(recs, start=1):
        lines.append(f"{idx}. {rec}")

    lines.extend(
        [
            "",
            "## 3. Phân Tích Gameplay & Kho 419 Game",
            "",
            f"- **Tổng lượt mở game (`game_open`):** {_fmt_num(gp.get('total_game_opens', 0))}",
            f"- **Tổng ván bắt đầu (`game_start`):** {_fmt_num(gp.get('total_game_starts', 0))}",
            f"- **Hoàn thành / Thất bại Level:** {_fmt_num(gp.get('total_level_complete', 0))} thắng / {_fmt_num(gp.get('total_level_failed', 0))} thua (Win Rate tổng: **{gp.get('overall_level_win_rate_pct', 0)}%**)",
            f"- **Số game ghi nhận dữ liệu:** {_fmt_num(gp.get('unique_games_observed', 0))}",
            "",
            "### Top Mini-Game Mở Nhiều Nhất",
            "",
            "| # | Game ID | Thể Loại | Lượt Mở | Lượt Chơi | Tổng Phút Chơi | Win Rate (%) |",
            "| :---: | :--- | :--- | ---: | ---: | ---: | ---: |",
        ]
    )
    top_games = gp.get("top_games", [])[:15]
    if top_games:
        for i, g in enumerate(top_games, start=1):
            lines.append(
                f"| {i} | `{g['game_name']}` | {g['category']} | {_fmt_num(g['opens'])} | "
                f"{_fmt_num(g['starts'])} | {_fmt_num(g['play_time_min'])} | {g['win_rate_pct']}% |"
            )
    else:
        lines.append("| - | *(Chưa có dữ liệu customEvent:game_name)* | - | 0 | 0 | 0 | 0% |")

    r2 = gp.get("r2_downloads", {})
    lines.extend(
        [
            "",
            "### Tải Game On-Demand Từ Cloudflare R2",
            "",
            f"- **Started:** {_fmt_num(r2.get('started', 0))} | **Completed:** {_fmt_num(r2.get('completed', 0))} | **Failed:** {_fmt_num(r2.get('failed', 0))} | **Tỉ lệ thành công:** **{r2.get('success_rate_pct', 0)}%**",
            "",
        ]
    )
    if r2.get("top_errors"):
        lines.append("| Lỗi Tải R2 | Số Lượt |")
        lines.append("| :--- | ---: |")
        for err in r2["top_errors"]:
            lines.append(f"| `{err['error_message']}` | {_fmt_num(err['count'])} |")
        lines.append("")

    lines.extend(
        [
            "## 4. Hiệu Suất Quảng Cáo AdMob & Meta Mediation",
            "",
            "| Chỉ Số Ads | Giá Trị | Công Thức |",
            "| :--- | ---: | :--- |",
            f"| **Ad Requests** | {_fmt_num(ads.get('requests', 0))} | Tổng yêu cầu tải |",
            f"| **Ad Loaded** | {_fmt_num(ads.get('loaded', 0))} | Fill Rate: **{ads.get('fill_rate_pct', 0)}%** |",
            f"| **Ad Impressions** | {_fmt_num(ads.get('impressions', 0))} | Show Rate: **{ads.get('show_rate_pct', 0)}%** (Effective: {ads.get('effective_imp_rate_pct', 0)}%) |",
            f"| **Ad Clicks** | {_fmt_num(ads.get('clicks', 0))} | CTR: **{ads.get('ctr_pct', 0)}%** |",
            f"| **Rewarded Earned** | {_fmt_num(ads.get('rewards_earned', 0))} | Lượt nhận thưởng xem hết video |",
            f"| **Suppressed / Blocked** | {_fmt_num(ads.get('suppressed', 0))} | Bị chặn bởi Frequency Cap / Cooldown |",
            "",
            "### Chi Tiết Theo Định Dạng Quảng Cáo",
            "",
            "| Định Dạng | Requests | Loaded | Fill Rate | Impressions | Show Rate | Clicks | CTR |",
            "| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    if ads.get("by_ad_type"):
        for item in ads["by_ad_type"]:
            lines.append(
                f"| `{item['ad_type']}` | {_fmt_num(item['requests'])} | {_fmt_num(item['loaded'])} | "
                f"{item['fill_rate_pct']}% | {_fmt_num(item['impressions'])} | {item['show_rate_pct']}% | "
                f"{_fmt_num(item['clicks'])} | {item['ctr_pct']}% |"
            )
    else:
        lines.append("| *(Chưa đăng ký customEvent:ad_type)* | 0 | 0 | 0% | 0 | 0% | 0 | 0% |")

    if ads.get("mediation_breakdown"):
        lines.extend(["", "### Tỉ Trọng Thắng Thầu Mediation (Google vs Meta)", "", "| Mạng Quảng Cáo | Số Lần Thắng | Tỉ Trọng |", "| :--- | ---: | ---: |"])
        for med in ads["mediation_breakdown"]:
            lines.append(f"| `{med['network']}` | {_fmt_num(med['wins'])} | {med['share_pct']}% |")

    if ads.get("top_errors"):
        lines.extend(["", "### Top Mã Lỗi Tải/Hiển Thị Quảng Cáo", "", "| Sự Kiện | Định Dạng | Mã Lỗi | Thông Báo | Số Lượt |", "| :--- | :--- | :---: | :--- | ---: |"])
        for err in ads["top_errors"]:
            lines.append(
                f"| `{err['event']}` | `{err['ad_type']}` | `{err['error_code']}` | {err['error_message']} | {_fmt_num(err['count'])} |"
            )

    lines.extend(
        [
            "",
            "## 5. Phễu Mua Hàng VIP Remove Ads (In-App Purchase)",
            "",
            "| Bước Trong Phễu | Số Lượt | Tỉ Lệ Chuyển Đổi |",
            "| :--- | ---: | ---: |",
            f"| 1. Xem Paywall (`inapp_paywall_viewed`) | {_fmt_num(iap.get('paywall_viewed', 0))} | 100% |",
            f"| 2. Bấm Mua (`inapp_purchase_initiated`) | {_fmt_num(iap.get('purchase_initiated', 0))} | {iap.get('paywall_to_init_pct', 0)}% từ Paywall |",
            f"| 3. Mua Thành Công (`inapp_purchase_success`) | {_fmt_num(iap.get('purchase_success', 0))} | **{iap.get('paywall_to_success_pct', 0)}%** từ Paywall ({iap.get('init_to_success_pct', 0)}% từ Bấm Mua) |",
            f"| Hủy / Thất Bại | {_fmt_num(iap.get('purchase_canceled', 0))} hủy / {_fmt_num(iap.get('purchase_failed', 0))} lỗi | Restore thành công: {_fmt_num(iap.get('restore_success', 0))} |",
            "",
        ]
    )

    lines.extend(
        [
            "## 6. Lịch 5 Notification/Ngày & Khung Giờ Vàng",
            "",
            f"- **Lập lịch (`notification_scheduled`):** {_fmt_num(notif.get('scheduled', 0))} | **Hiển thị (`displayed`):** {_fmt_num(notif.get('delivered', 0))} ({notif.get('delivery_rate_pct', 0)}%) | **Người dùng mở (`opened`):** {_fmt_num(notif.get('opened', 0))} (**Open Rate: {notif.get('open_rate_pct', 0)}%**)",
            "",
            "| Khung Giờ | Scheduled | Delivered | Opened | Delivery Rate | Open Rate |",
            "| :---: | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    if notif.get("by_hour"):
        for hr in notif["by_hour"]:
            lines.append(
                f"| `{hr['hour_label']}` | {_fmt_num(hr['scheduled'])} | {_fmt_num(hr['delivered'])} | "
                f"{_fmt_num(hr['opened'])} | {hr['delivery_rate_pct']}% | **{hr['open_rate_pct']}%** |"
            )
    else:
        lines.append("| *(Chưa đăng ký customEvent:scheduled_hour)* | 0 | 0 | 0 | 0% | 0% |")

    lines.extend(
        [
            "",
            "## 7. Phân Bổ Quốc Gia & Thiết Bị Top Đầu",
            "",
            "| Quốc Gia | Active Users | Sessions | Engagement Rate |",
            "| :--- | ---: | ---: | ---: |",
        ]
    )
    for c in vg.get("top_countries", [])[:10]:
        lines.append(
            f"| {c['country']} | {_fmt_num(c['activeUsers'])} | {_fmt_num(c['sessions'])} | {c['engagementRatePct']}% |"
        )

    lines.extend(render_roas_markdown(analysis.get("roas", {})))
    lines.append("")
    return "\n".join(lines)


def _render_daily_svg(daily_series: Sequence[Dict[str, Any]]) -> str:
    """
    Vẽ biểu đồ SVG xu hướng DAU theo ngày hoàn toàn nội tuyến không phụ thuộc CDN.
    Render an inline self-contained SVG trend chart for daily active users.
    """
    if not daily_series:
        return '<div class="empty-note">Chưa có dữ liệu DAU theo ngày.</div>'

    width = 760
    height = 220
    pad_l, pad_r, pad_t, pad_b = 44, 16, 18, 30
    plot_w = width - pad_l - pad_r
    plot_h = height - pad_t - pad_b

    values = [int(d.get("activeUsers", 0)) for d in daily_series]
    max_v = max(max(values), 1)
    n = len(daily_series)

    points: List[str] = []
    bars: List[str] = []
    labels: List[str] = []
    step_x = plot_w / max(1, n - 1) if n > 1 else plot_w
    bar_w = max(4.0, min(18.0, (plot_w / max(1, n)) * 0.55))

    for idx, item in enumerate(daily_series):
        val = int(item.get("activeUsers", 0))
        x = pad_l + (idx * step_x if n > 1 else plot_w / 2)
        y = pad_t + plot_h - (val / max_v) * plot_h
        points.append(f"{x:.1f},{y:.1f}")
        bars.append(
            f'<rect x="{x - bar_w / 2:.1f}" y="{y:.1f}" width="{bar_w:.1f}" '
            f'height="{max(2.0, pad_t + plot_h - y):.1f}" rx="3" class="svg-bar">'
            f"<title>{html.escape(str(item.get('date', '')))}: {val:,} DAU</title></rect>"
        )
        if idx == 0 or idx == n - 1 or idx == n // 2:
            short_dt = str(item.get("date", ""))[5:] or str(item.get("date", ""))
            labels.append(
                f'<text x="{x:.1f}" y="{height - 8}" text-anchor="middle" class="svg-axis">{html.escape(short_dt)}</text>'
            )

    polyline = " ".join(points)
    return f"""
<svg viewBox="0 0 {width} {height}" class="chart-svg" role="img" aria-label="DAU Daily Chart">
  <line x1="{pad_l}" y1="{pad_t}" x2="{pad_l}" y2="{pad_t + plot_h}" class="svg-grid"/>
  <line x1="{pad_l}" y1="{pad_t + plot_h}" x2="{width - pad_r}" y2="{pad_t + plot_h}" class="svg-grid"/>
  <text x="{pad_l - 6}" y="{pad_t + 8}" text-anchor="end" class="svg-axis">{max_v:,}</text>
  <text x="{pad_l - 6}" y="{pad_t + plot_h}" text-anchor="end" class="svg-axis">0</text>
  {"".join(bars)}
  <polyline fill="none" stroke="var(--accent)" stroke-width="2.5" points="{polyline}"/>
  {"".join(labels)}
</svg>
""".strip()


def _render_hourly_notif_svg(by_hour: Sequence[Dict[str, Any]]) -> str:
    """
    Vẽ biểu đồ cột SVG tỉ lệ mở Notification theo từng giờ (đánh dấu giờ vàng).
    Render an inline SVG bar chart of Notification Open Rate by scheduled hour.
    """
    if not by_hour:
        return '<div class="empty-note">Chưa có dữ liệu Open Rate theo giờ (cần customEvent:scheduled_hour).</div>'

    width = 520
    height = 200
    pad_l, pad_r, pad_t, pad_b = 40, 14, 18, 32
    plot_w = width - pad_l - pad_r
    plot_h = height - pad_t - pad_b
    rates = [float(h.get("open_rate_pct", 0.0)) for h in by_hour]
    max_r = max(max(rates), 1.0)
    top_rate = max(rates)
    slot_w = plot_w / max(1, len(by_hour))
    bar_w = min(38.0, slot_w * 0.6)

    bars: List[str] = []
    for idx, item in enumerate(by_hour):
        rate = float(item.get("open_rate_pct", 0.0))
        x = pad_l + idx * slot_w + (slot_w - bar_w) / 2
        h = (rate / max_r) * plot_h
        y = pad_t + plot_h - h
        cls = "svg-bar-gold" if rate == top_rate and rate > 0 else "svg-bar"
        label = str(item.get("hour_label", ""))
        bars.append(
            f'<rect x="{x:.1f}" y="{y:.1f}" width="{bar_w:.1f}" height="{max(3.0, h):.1f}" rx="4" class="{cls}">'
            f"<title>{html.escape(label)} — Open Rate: {rate}%</title></rect>"
            f'<text x="{x + bar_w / 2:.1f}" y="{max(12.0, y - 5):.1f}" text-anchor="middle" class="svg-val">{rate:.1f}%</text>'
            f'<text x="{x + bar_w / 2:.1f}" y="{height - 10}" text-anchor="middle" class="svg-axis">{html.escape(label)}</text>'
        )

    return f"""
<svg viewBox="0 0 {width} {height}" class="chart-svg" role="img" aria-label="Notification Open Rate Chart">
  <line x1="{pad_l}" y1="{pad_t + plot_h}" x2="{width - pad_r}" y2="{pad_t + plot_h}" class="svg-grid"/>
  {"".join(bars)}
</svg>
""".strip()


def build_html_dashboard(analysis: Dict[str, Any]) -> str:
    """
    Tạo tệp Dashboard HTML5 tự chứa hỗ trợ Light/Dark mode và hiển thị Card responsive trên mobile.
    Build a self-contained responsive Light/Dark HTML5 Dashboard with card layouts.
    """
    meta = analysis.get("meta", {})
    ov = analysis.get("overview", {})
    vg = analysis.get("versions_geo", {})
    gp = analysis.get("gameplay", {})
    ads = analysis.get("ads", {})
    iap = analysis.get("iap", {})
    notif = analysis.get("notifications", {})
    audit = analysis.get("schema_audit", {})
    recs: List[str] = analysis.get("recommendations", [])

    is_live = meta.get("data_source") == "LIVE_GA4"
    badge_text = "LIVE GA4 DATA" if is_live else "DEMO PREVIEW (CHƯA GẮN KEY THẬT)"
    badge_cls = "badge-live" if is_live else "badge-demo"

    daily_svg = _render_daily_svg(ov.get("daily_series", []))
    notif_svg = _render_hourly_notif_svg(notif.get("by_hour", []))

    rec_items_html = "".join(f"<li>{html.escape(r)}</li>" for r in recs)

    top_games_rows = ""
    for i, g in enumerate(gp.get("top_games", [])[:10], start=1):
        top_games_rows += (
            f"<tr><td>{i}</td><td><code>{html.escape(str(g['game_name']))}</code></td>"
            f"<td>{html.escape(str(g['category']))}</td>"
            f"<td class='num'>{_fmt_num(g['opens'])}</td>"
            f"<td class='num'>{_fmt_num(g['play_time_min'])}p</td>"
            f"<td class='num'>{g['win_rate_pct']}%</td></tr>"
        )
    if not top_games_rows:
        top_games_rows = "<tr><td colspan='6'>Chưa có dữ liệu chi tiết từng game.</td></tr>"

    ads_rows_html = ""
    for a in ads.get("by_ad_type", []):
        ads_rows_html += (
            f"<tr><td><code>{html.escape(str(a['ad_type']))}</code></td>"
            f"<td class='num'>{_fmt_num(a['requests'])}</td>"
            f"<td class='num'>{a['fill_rate_pct']}%</td>"
            f"<td class='num'>{_fmt_num(a['impressions'])}</td>"
            f"<td class='num'>{a['show_rate_pct']}%</td>"
            f"<td class='num'>{a['ctr_pct']}%</td></tr>"
        )
    if not ads_rows_html:
        ads_rows_html = "<tr><td colspan='6'>Chưa có dữ liệu phân loại quảng cáo.</td></tr>"

    countries_html = ""
    for c in vg.get("top_countries", [])[:8]:
        countries_html += (
            f"<tr><td>{html.escape(str(c['country']))}</td>"
            f"<td class='num'>{_fmt_num(c['activeUsers'])}</td>"
            f"<td class='num'>{_fmt_num(c['sessions'])}</td>"
            f"<td class='num'>{c['engagementRatePct']}%</td></tr>"
        )

    r2 = gp.get("r2_downloads", {})
    payload_safe = json.dumps(
        {
            "meta": meta,
            "overview": {k: v for k, v in ov.items() if k != "daily_series"},
            "ads": {k: v for k, v in ads.items() if k != "top_errors"},
            "iap": iap,
        },
        ensure_ascii=False,
    ).replace("</", "<\\/")

    return f"""<!DOCTYPE html>
<html lang="vi" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GA4 Analytics Dashboard — Game Gate Offline</title>
  <style>
    :root {{
      --bg: #f4f6fb;
      --surface: #ffffff;
      --surface-2: #eef2f9;
      --text: #111827;
      --muted: #6b7280;
      --border: #dce3ef;
      --accent: #2563eb;
      --gold: #d97706;
      --ok: #059669;
      --warn: #dc2626;
      --shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    }}
    html[data-theme="dark"] {{
      --bg: #0b1120;
      --surface: #111827;
      --surface-2: #1e293b;
      --text: #f3f4f6;
      --muted: #94a3b8;
      --border: #293548;
      --accent: #3b82f6;
      --gold: #f59e0b;
      --ok: #10b981;
      --warn: #ef4444;
      --shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }}
    .container {{
      max-width: 1320px;
      margin: 0 auto;
      padding: 20px 16px 48px;
    }}
    .topbar {{
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: space-between;
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px 20px;
      box-shadow: var(--shadow);
      margin-bottom: 20px;
    }}
    .title-group h1 {{ margin: 0 0 4px; font-size: 1.28rem; }}
    .meta-sub {{ font-size: 0.86rem; color: var(--muted); }}
    .actions {{ display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }}
    .badge {{
      display: inline-block;
      padding: 5px 11px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
    }}
    .badge-live {{ background: rgba(16,185,129,0.16); color: var(--ok); border: 1px solid var(--ok); }}
    .badge-demo {{ background: rgba(245,158,11,0.16); color: var(--gold); border: 1px solid var(--gold); }}
    .btn-theme {{
      cursor: pointer;
      border: 1px solid var(--border);
      background: var(--surface-2);
      color: var(--text);
      padding: 8px 14px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.85rem;
    }}
    .kpi-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 14px;
      margin-bottom: 20px;
    }}
    .card {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px 18px;
      box-shadow: var(--shadow);
    }}
    .kpi-label {{ font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }}
    .kpi-value {{ font-size: 1.65rem; font-weight: 800; margin: 4px 0; }}
    .kpi-sub {{ font-size: 0.82rem; color: var(--muted); }}
    .grid-2 {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }}
    .card h2 {{
      margin: 0 0 12px;
      font-size: 1.04rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .rec-list {{ margin: 0; padding-left: 20px; }}
    .rec-list li {{ margin-bottom: 8px; }}
    .table-wrap {{ overflow-x: auto; }}
    table {{ width: 100%; border-collapse: collapse; font-size: 0.88rem; }}
    th, td {{ padding: 9px 8px; border-bottom: 1px solid var(--border); text-align: left; }}
    th {{ color: var(--muted); font-weight: 600; font-size: 0.8rem; }}
    td.num, th.num {{ text-align: right; font-variant-numeric: tabular-nums; }}
    code {{ background: var(--surface-2); padding: 2px 6px; border-radius: 6px; font-size: 0.82rem; }}
    .chart-svg {{ width: 100%; height: auto; display: block; }}
    .svg-grid {{ stroke: var(--border); stroke-width: 1; }}
    .svg-axis {{ fill: var(--muted); font-size: 11px; }}
    .svg-val {{ fill: var(--text); font-size: 10px; font-weight: 600; }}
    .svg-bar {{ fill: rgba(59, 130, 246, 0.38); }}
    .svg-bar-gold {{ fill: var(--gold); }}
    .empty-note {{ color: var(--muted); font-size: 0.9rem; padding: 12px 0; }}
    .funnel-row {{
      display: flex;
      justify-content: space-between;
      padding: 8px 10px;
      background: var(--surface-2);
      border-radius: 10px;
      margin-bottom: 8px;
      font-size: 0.88rem;
    }}
    @media (max-width: 600px) {{
      .kpi-value {{ font-size: 1.38rem; }}
      .topbar {{ padding: 14px; }}
    }}
  </style>
</head>
<body>
  <div class="container">
    <header class="topbar">
      <div class="title-group">
        <h1>Game Gate Offline — GA4 Analytics Dashboard</h1>
        <div class="meta-sub">
          Property: <strong>{html.escape(str(meta.get('property_id', 'N/A')))}</strong> &bull;
          Kỳ báo cáo: <strong>{html.escape(str(meta.get('start_date', '')))} → {html.escape(str(meta.get('end_date', '')))}</strong> &bull;
          Custom Schema: <strong>{audit.get('registered_dimensions_count', 0)}/{audit.get('total_expected_dimensions', 0)}</strong> dims
        </div>
      </div>
      <div class="actions">
        <span class="badge {badge_cls}">{html.escape(badge_text)}</span>
        <button id="themeToggle" class="btn-theme" type="button">Đổi Sáng / Tối</button>
      </div>
    </header>

    <section class="kpi-grid">
      <article class="card">
        <div class="kpi-label">DAU Trung Bình</div>
        <div class="kpi-value">{_fmt_num(ov.get('avg_dau', 0))}</div>
        <div class="kpi-sub">Đỉnh: {_fmt_num(ov.get('max_dau', 0))} &bull; Xu hướng: {ov.get('trend_dau_pct', 0)}%</div>
      </article>
      <article class="card">
        <div class="kpi-label">Engagement Rate</div>
        <div class="kpi-value">{ov.get('engagement_rate_pct', 0)}%</div>
        <div class="kpi-sub">TB {_fmt_num(ov.get('avg_engagement_min_per_dau', 0))} phút / DAU</div>
      </article>
      <article class="card">
        <div class="kpi-label">Ad Fill Rate / CTR</div>
        <div class="kpi-value">{ads.get('fill_rate_pct', 0)}%</div>
        <div class="kpi-sub">Show: {ads.get('show_rate_pct', 0)}% &bull; CTR: {ads.get('ctr_pct', 0)}%</div>
      </article>
      <article class="card">
        <div class="kpi-label">IAP VIP Conversion</div>
        <div class="kpi-value">{iap.get('paywall_to_success_pct', 0)}%</div>
        <div class="kpi-sub">{_fmt_num(iap.get('purchase_success', 0))} đơn / {_fmt_num(iap.get('paywall_viewed', 0))} Paywall</div>
      </article>
      <article class="card">
        <div class="kpi-label">Notification Open Rate</div>
        <div class="kpi-value">{notif.get('open_rate_pct', 0)}%</div>
        <div class="kpi-sub">{_fmt_num(notif.get('opened', 0))} mở / {_fmt_num(notif.get('delivered', 0))} hiển thị</div>
      </article>
      <article class="card">
        <div class="kpi-label">Tải Game R2 Thành Công</div>
        <div class="kpi-value">{r2.get('success_rate_pct', 0)}%</div>
        <div class="kpi-sub">{_fmt_num(r2.get('completed', 0))} xong / {_fmt_num(r2.get('failed', 0))} lỗi</div>
      </article>
    </section>

    <section class="grid-2">
      <article class="card">
        <h2>Xu Hướng DAU Theo Ngày</h2>
        {daily_svg}
      </article>
      <article class="card">
        <h2>Khuyến Nghị Hành Động Tự Động</h2>
        <ol class="rec-list">{rec_items_html}</ol>
      </article>
    </section>

    <section class="grid-2">
      <article class="card">
        <h2>Top Mini-Game Mở Nhiều Nhất</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Game</th><th>Thể loại</th><th class="num">Mở</th><th class="num">Thời lượng</th><th class="num">Win Rate</th></tr></thead>
            <tbody>{top_games_rows}</tbody>
          </table>
        </div>
      </article>

      <article class="card">
        <h2>Hiệu Suất Quảng Cáo Theo Định Dạng</h2>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Loại</th><th class="num">Requests</th><th class="num">Fill</th><th class="num">Imps</th><th class="num">Show</th><th class="num">CTR</th></tr></thead>
            <tbody>{ads_rows_html}</tbody>
          </table>
        </div>
      </article>
    </section>

    <section class="grid-2">
      <article class="card">
        <h2>Open Rate Notification Theo Giờ (5 Slot/Ngày)</h2>
        {notif_svg}
      </article>

      <article class="card">
        <h2>Phễu IAP VIP & Quốc Gia Top Đầu</h2>
        <div class="funnel-row"><span>1. Xem Paywall</span><strong>{_fmt_num(iap.get('paywall_viewed', 0))}</strong></div>
        <div class="funnel-row"><span>2. Bấm Mua Google Play</span><strong>{_fmt_num(iap.get('purchase_initiated', 0))} ({iap.get('paywall_to_init_pct', 0)}%)</strong></div>
        <div class="funnel-row"><span>3. Thanh Toán Thành Công</span><strong>{_fmt_num(iap.get('purchase_success', 0))} ({iap.get('paywall_to_success_pct', 0)}%)</strong></div>
        <div class="table-wrap" style="margin-top:12px;">
          <table>
            <thead><tr><th>Quốc Gia</th><th class="num">Active Users</th><th class="num">Sessions</th><th class="num">Engaged</th></tr></thead>
            <tbody>{countries_html}</tbody>
          </table>
        </div>
      </article>
    </section>
    {render_roas_html(analysis.get("roas", {}))}
  </div>

  <script>
    window.__GA4_SUMMARY__ = {payload_safe};
    (function () {{
      var root = document.documentElement;
      var saved = localStorage.getItem('nextai-ga4-theme');
      if (saved === 'light' || saved === 'dark') {{
        root.setAttribute('data-theme', saved);
      }}
      var btn = document.getElementById('themeToggle');
      if (btn) {{
        btn.addEventListener('click', function () {{
          var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
          root.setAttribute('data-theme', next);
          localStorage.setItem('nextai-ga4-theme', next);
        }});
      }}
    }})();
  </script>
</body>
</html>
"""


def write_reports(
    analysis: Dict[str, Any],
    reports_dir: Path,
    markdown_filename: str = "GA4_ANALYSIS_REPORT.md",
    html_filename: str = "dashboard.html",
) -> Dict[str, Path]:
    """
    Xuất cả hai tệp báo cáo Markdown, HTML Dashboard và tệp KPI JSON ra thư mục reports.
    Persist Markdown report, HTML dashboard, and KPI summary JSON into reports_dir.
    """
    reports_dir.mkdir(parents=True, exist_ok=True)
    md_path = reports_dir / markdown_filename
    html_path = reports_dir / html_filename
    summary_path = reports_dir / (
        "demo_summary.json"
        if analysis.get("meta", {}).get("data_source") != "LIVE_GA4"
        else "ga4_summary.json"
    )

    md_path.write_text(build_markdown_report(analysis), encoding="utf-8")
    html_path.write_text(build_html_dashboard(analysis), encoding="utf-8")
    summary_path.write_text(
        json.dumps(analysis, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return {
        "markdown": md_path,
        "html": html_path,
        "summary_json": summary_path,
    }
