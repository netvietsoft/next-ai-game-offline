"""
Bộ phân tích chỉ số GA4 chuyên sâu cho Game Gate Offline (Gameplay, R2, Ads, IAP, Notification).
Deep GA4 KPI analyzer for Game Gate Offline (Gameplay, R2 Downloads, Ads, IAP, Notifications).
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, List

from .roas_analyzer import analyze_roas, build_roas_recommendations


def _safe_float(value: Any) -> float:
    """
    Chuyển giá trị bất kỳ sang float an toàn, trả về 0.0 nếu lỗi hoặc None.
    Safely coerce a value to float, returning 0.0 on None or parse error.
    """
    if value is None or value == "":
        return 0.0
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _safe_int(value: Any) -> int:
    """
    Chuyển giá trị bất kỳ sang int an toàn, trả về 0 nếu lỗi hoặc None.
    Safely coerce a value to int, returning 0 on None or parse error.
    """
    return int(round(_safe_float(value)))


def _safe_div(numerator: float, denominator: float) -> float:
    """
    Phép chia an toàn chống lỗi ZeroDivisionError.
    Safe division helper guarding against zero denominators.
    """
    if denominator <= 0:
        return 0.0
    return numerator / denominator


def _pct(numerator: float, denominator: float, digits: int = 2) -> float:
    """
    Tính phần trăm an toàn làm tròn theo số chữ số thập phân chỉ định.
    Compute safe percentage rounded to the requested decimal places.
    """
    return round(_safe_div(numerator, denominator) * 100.0, digits)


def _format_ga4_date(raw: str) -> str:
    """
    Chuyển ngày dạng YYYYMMDD sang YYYY-MM-DD dễ đọc.
    Format GA4 YYYYMMDD date string into readable YYYY-MM-DD.
    """
    clean = (raw or "").strip()
    if len(clean) == 8 and clean.isdigit():
        return f"{clean[:4]}-{clean[4:6]}-{clean[6:8]}"
    return clean


def _is_unset(value: Any) -> bool:
    """
    Kiểm tra giá trị dimension từ GA4 có rỗng hoặc '(not set)' không.
    Check whether a GA4 dimension value is empty or '(not set)'.
    """
    text = str(value or "").strip()
    return text == "" or text == "(not set)"


class GA4Analyzer:
    """
    Phân tích toàn diện bộ báo cáo JSON kéo từ GA4 Data API (hoặc chế độ Demo).
    Comprehensive analyzer transforming raw GA4 report bundles into actionable KPIs.
    """

    def __init__(self, bundle: Dict[str, Any]) -> None:
        """
        Khởi tạo analyzer từ gói dữ liệu ga4_bundle.
        Initialize analyzer with a loaded ga4_bundle dictionary.
        """
        self.bundle = bundle
        self.meta: Dict[str, Any] = bundle.get("meta", {})
        self.realtime: Dict[str, Any] = bundle.get("realtime", {})
        self.reports: Dict[str, Any] = bundle.get("reports", {})

    def _rows(self, report_key: str) -> List[Dict[str, Any]]:
        """
        Lấy danh sách dòng của một report key, trả về mảng rỗng nếu thiếu.
        Retrieve rows for a given report key, defaulting to an empty list.
        """
        payload = self.reports.get(report_key, {})
        rows = payload.get("rows", [])
        return rows if isinstance(rows, list) else []

    def analyze(self) -> Dict[str, Any]:
        """
        Chạy toàn bộ pipeline phân tích và trả về cấu trúc dữ liệu hợp nhất.
        Run the complete analysis pipeline and return a consolidated KPI structure.
        """
        events_map = self._build_events_map()
        overview = self._analyze_overview()
        versions_geo = self._analyze_versions_and_geo()
        gameplay = self._analyze_gameplay(events_map)
        ads = self._analyze_ads(events_map)
        iap = self._analyze_iap(events_map)
        notifications = self._analyze_notifications(events_map)
        roas = analyze_roas(self.reports)
        schema_audit = self._analyze_schema_audit()

        summary: Dict[str, Any] = {
            "meta": self.meta,
            "overview": overview,
            "versions_geo": versions_geo,
            "gameplay": gameplay,
            "ads": ads,
            "iap": iap,
            "notifications": notifications,
            "roas": roas,
            "events_map": events_map,
            "schema_audit": schema_audit,
        }
        summary["recommendations"] = self._build_recommendations(summary)
        return summary

    def _build_events_map(self) -> Dict[str, Dict[str, Any]]:
        """
        Lập bảng tra cứu nhanh số lượt và user cho mọi eventName.
        Build a quick lookup dictionary of eventCount and totalUsers by eventName.
        """
        out: Dict[str, Dict[str, Any]] = {}
        for row in self._rows("events_summary"):
            ev = str(row.get("eventName", "")).strip()
            if not ev:
                continue
            out[ev] = {
                "eventCount": _safe_int(row.get("eventCount")),
                "totalUsers": _safe_int(row.get("totalUsers")),
                "eventCountPerUser": round(_safe_float(row.get("eventCountPerUser")), 2),
            }
        return out

    def _analyze_overview(self) -> Dict[str, Any]:
        """
        Phân tích DAU, người dùng mới, phiên, tỉ lệ tương tác và xu hướng tăng trưởng.
        Analyze DAU, new users, sessions, engagement rate, and period-over-period growth.
        """
        rows = sorted(
            self._rows("daily_overview"),
            key=lambda r: str(r.get("date", "")),
        )
        daily_series: List[Dict[str, Any]] = []
        total_dau_sum = 0
        total_new_users = 0
        total_sessions = 0
        total_engaged = 0
        total_eng_sec = 0.0
        total_views = 0
        total_events = 0
        max_dau = 0

        for row in rows:
            dau = _safe_int(row.get("activeUsers"))
            new_u = _safe_int(row.get("newUsers"))
            sess = _safe_int(row.get("sessions"))
            eng_sess = _safe_int(row.get("engagedSessions"))
            eng_sec = _safe_float(row.get("userEngagementDuration"))
            views = _safe_int(row.get("screenPageViews"))
            events = _safe_int(row.get("eventCount"))

            total_dau_sum += dau
            total_new_users += new_u
            total_sessions += sess
            total_engaged += eng_sess
            total_eng_sec += eng_sec
            total_views += views
            total_events += events
            if dau > max_dau:
                max_dau = dau

            daily_series.append(
                {
                    "date": _format_ga4_date(str(row.get("date", ""))),
                    "activeUsers": dau,
                    "newUsers": new_u,
                    "sessions": sess,
                    "engagedSessions": eng_sess,
                    "engagementRatePct": round(_safe_float(row.get("engagementRate")) * 100.0, 2),
                    "avgSessionMin": round(_safe_div(eng_sec, max(1, dau)) / 60.0, 2),
                    "eventCount": events,
                }
            )

        num_days = len(daily_series)
        avg_dau = round(_safe_div(total_dau_sum, num_days), 1)

        # So sánh DAU trung bình nửa cuối kỳ với nửa đầu kỳ để phát hiện xu hướng.
        # Compare second-half vs first-half average DAU to measure growth trend.
        trend_dau_pct = 0.0
        if num_days >= 4:
            mid = num_days // 2
            first_half = sum(d["activeUsers"] for d in daily_series[:mid]) / max(1, mid)
            second_half = sum(d["activeUsers"] for d in daily_series[mid:]) / max(
                1, num_days - mid
            )
            trend_dau_pct = round(_safe_div(second_half - first_half, first_half) * 100.0, 2)

        return {
            "days_count": num_days,
            "avg_dau": avg_dau,
            "max_dau": max_dau,
            "total_new_users": total_new_users,
            "total_sessions": total_sessions,
            "total_engaged_sessions": total_engaged,
            "engagement_rate_pct": _pct(total_engaged, total_sessions),
            "avg_engagement_min_per_dau": round(
                _safe_div(total_eng_sec, max(1, total_dau_sum)) / 60.0, 2
            ),
            "total_screen_views": total_views,
            "total_events": total_events,
            "trend_dau_pct": trend_dau_pct,
            "realtime_active_users_30m": _safe_int(
                self.realtime.get("active_users_last_30m")
            ),
            "realtime_countries": self.realtime.get("countries", []),
            "daily_series": daily_series,
        }

    def _analyze_versions_and_geo(self) -> Dict[str, Any]:
        """
        Tổng hợp phân bố quốc gia, thiết bị, phiên bản ứng dụng và khung giờ truy cập.
        Aggregate country, device model, app version, and hourly traffic distributions.
        """
        countries_agg: Dict[str, Dict[str, int]] = defaultdict(
            lambda: {"activeUsers": 0, "sessions": 0, "engagedSessions": 0}
        )
        devices_list: List[Dict[str, Any]] = []

        for row in self._rows("geo_devices"):
            country = str(row.get("country", "(not set)"))
            model = str(row.get("mobileDeviceModel", "(not set)"))
            cat = str(row.get("deviceCategory", "mobile"))
            au = _safe_int(row.get("activeUsers"))
            sess = _safe_int(row.get("sessions"))
            eng = _safe_int(row.get("engagedSessions"))

            countries_agg[country]["activeUsers"] += au
            countries_agg[country]["sessions"] += sess
            countries_agg[country]["engagedSessions"] += eng
            devices_list.append(
                {
                    "country": country,
                    "deviceCategory": cat,
                    "mobileDeviceModel": model,
                    "activeUsers": au,
                    "sessions": sess,
                }
            )

        top_countries = sorted(
            [
                {
                    "country": k,
                    "activeUsers": v["activeUsers"],
                    "sessions": v["sessions"],
                    "engagementRatePct": _pct(v["engagedSessions"], v["sessions"]),
                }
                for k, v in countries_agg.items()
            ],
            key=lambda x: x["activeUsers"],
            reverse=True,
        )[:15]

        top_devices = sorted(
            devices_list, key=lambda x: x["activeUsers"], reverse=True
        )[:15]

        app_versions = sorted(
            [
                {
                    "appVersion": str(r.get("appVersion", "(not set)")),
                    "osVersion": str(r.get("operatingSystemVersion", "(not set)")),
                    "activeUsers": _safe_int(r.get("activeUsers")),
                    "newUsers": _safe_int(r.get("newUsers")),
                    "sessions": _safe_int(r.get("sessions")),
                }
                for r in self._rows("app_versions")
            ],
            key=lambda x: x["activeUsers"],
            reverse=True,
        )[:15]

        hourly_traffic = sorted(
            [
                {
                    "hour": str(r.get("hour", "00")).zfill(2),
                    "activeUsers": _safe_int(r.get("activeUsers")),
                    "sessions": _safe_int(r.get("sessions")),
                    "eventCount": _safe_int(r.get("eventCount")),
                }
                for r in self._rows("hourly_activity")
            ],
            key=lambda x: x["hour"],
        )

        return {
            "top_countries": top_countries,
            "top_devices": top_devices,
            "app_versions": app_versions,
            "hourly_traffic": hourly_traffic,
        }

    def _analyze_gameplay(self, events_map: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Phân tích hiệu suất từng mini-game, tỉ lệ thắng level và trạng thái tải gói R2.
        Analyze per-game opens, play duration, level win rate, and R2 download success rate.
        """
        per_game: Dict[str, Dict[str, Any]] = defaultdict(
            lambda: {
                "game_name": "",
                "category": "Unknown",
                "opens": 0,
                "starts": 0,
                "users": 0,
                "level_start": 0,
                "level_complete": 0,
                "level_failed": 0,
                "level_restart": 0,
                "play_time_sec": 0.0,
            }
        )

        totals_from_games: Dict[str, int] = defaultdict(int)
        for row in self._rows("games_performance"):
            ev = str(row.get("eventName", "")).strip()
            cnt = _safe_int(row.get("eventCount"))
            users = _safe_int(row.get("totalUsers"))
            dur = _safe_float(row.get("customEvent:session_duration_sec"))
            totals_from_games[ev] += cnt

            g_name = str(row.get("customEvent:game_name", "")).strip()
            if _is_unset(g_name):
                continue

            entry = per_game[g_name]
            entry["game_name"] = g_name
            cat = str(row.get("customEvent:game_category", "")).strip()
            if not _is_unset(cat):
                entry["category"] = cat
            if users > entry["users"]:
                entry["users"] = users

            if ev == "game_open":
                entry["opens"] += cnt
            elif ev == "game_start":
                entry["starts"] += cnt
            elif ev == "game_level_start":
                entry["level_start"] += cnt
            elif ev == "game_level_complete":
                entry["level_complete"] += cnt
            elif ev == "game_level_failed":
                entry["level_failed"] += cnt
            elif ev == "game_level_restart":
                entry["level_restart"] += cnt
            elif ev == "game_play_time":
                entry["play_time_sec"] += dur

        games_list: List[Dict[str, Any]] = []
        for g_name, item in per_game.items():
            outcomes = item["level_complete"] + item["level_failed"]
            games_list.append(
                {
                    **item,
                    "play_time_min": round(item["play_time_sec"] / 60.0, 1),
                    "win_rate_pct": _pct(item["level_complete"], outcomes),
                    "level_outcomes": outcomes,
                }
            )

        top_games = sorted(
            games_list, key=lambda x: (x["opens"], x["starts"]), reverse=True
        )[:20]

        hardest_games = sorted(
            [g for g in games_list if g["level_outcomes"] >= 10],
            key=lambda x: x["win_rate_pct"],
        )[:10]

        # R2 on-demand downloads
        r2_status_counts: Dict[str, int] = defaultdict(int)
        r2_game_stats: Dict[str, Dict[str, int]] = defaultdict(
            lambda: {"started": 0, "completed": 0, "failed": 0}
        )
        r2_errors: Dict[str, int] = defaultdict(int)

        for row in self._rows("r2_downloads"):
            cnt = _safe_int(row.get("eventCount"))
            status = str(row.get("customEvent:status", "(not set)")).strip().lower()
            g_name = str(row.get("customEvent:game_name", "(not set)")).strip()
            err = str(row.get("customEvent:error_message", "(not set)")).strip()

            if not _is_unset(status):
                r2_status_counts[status] += cnt
                if not _is_unset(g_name):
                    if status in ("started", "completed", "failed"):
                        r2_game_stats[g_name][status] += cnt
            if status == "failed" and not _is_unset(err):
                r2_errors[err] += cnt

        r2_started = r2_status_counts.get("started", 0)
        r2_completed = r2_status_counts.get("completed", 0)
        r2_failed = r2_status_counts.get("failed", 0)
        r2_offline = r2_status_counts.get("offline", 0)
        r2_denom = r2_completed + r2_failed if (r2_completed + r2_failed) > 0 else r2_started

        r2_top_failed_games = sorted(
            [
                {
                    "game_name": g,
                    "started": v["started"],
                    "completed": v["completed"],
                    "failed": v["failed"],
                    "success_rate_pct": _pct(v["completed"], v["completed"] + v["failed"]),
                }
                for g, v in r2_game_stats.items()
                if v["failed"] > 0
            ],
            key=lambda x: x["failed"],
            reverse=True,
        )[:10]

        total_opens = totals_from_games.get("game_open") or events_map.get("game_open", {}).get("eventCount", 0)
        total_starts = totals_from_games.get("game_start") or events_map.get("game_start", {}).get("eventCount", 0)
        total_complete = totals_from_games.get("game_level_complete") or events_map.get("game_level_complete", {}).get("eventCount", 0)
        total_failed = totals_from_games.get("game_level_failed") or events_map.get("game_level_failed", {}).get("eventCount", 0)

        return {
            "total_game_opens": total_opens,
            "total_game_starts": total_starts,
            "total_level_complete": total_complete,
            "total_level_failed": total_failed,
            "overall_level_win_rate_pct": _pct(total_complete, total_complete + total_failed),
            "unique_games_observed": len(per_game),
            "top_games": top_games,
            "hardest_games": hardest_games,
            "r2_downloads": {
                "started": r2_started,
                "completed": r2_completed,
                "failed": r2_failed,
                "offline": r2_offline,
                "success_rate_pct": _pct(r2_completed, r2_denom),
                "top_failed_games": r2_top_failed_games,
                "top_errors": [
                    {"error_message": k, "count": v}
                    for k, v in sorted(r2_errors.items(), key=lambda x: x[1], reverse=True)[:10]
                ],
            },
        }

    def _analyze_ads(self, events_map: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Phân tích Fill Rate, Show Rate, CTR, Mediation share (Google vs Meta) và mã lỗi quảng cáo.
        Analyze Ad Fill Rate, Show Rate, CTR, Mediation winner share, and error diagnostics.
        """
        overall_counts: Dict[str, int] = defaultdict(int)
        by_type: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        mediation_share: Dict[str, int] = defaultdict(int)

        for row in self._rows("ads_funnel"):
            ev = str(row.get("eventName", "")).strip()
            cnt = _safe_int(row.get("eventCount"))
            ad_type = str(row.get("customEvent:ad_type", "")).strip()
            ad_network = str(row.get("customEvent:ad_network", "")).strip()

            overall_counts[ev] += cnt
            if not _is_unset(ad_type):
                by_type[ad_type][ev] += cnt
            if ev == "ad_mediation_loaded" and not _is_unset(ad_network):
                mediation_share[ad_network] += cnt

        def _count(name: str) -> int:
            return overall_counts.get(name) or events_map.get(name, {}).get("eventCount", 0)

        reqs = _count("ad_request")
        loaded = _count("ad_loaded")
        imps = _count("ad_impression")
        clicks = _count("ad_clicked")
        failed_load = _count("ad_failed_to_load")
        failed_show = _count("ad_failed_to_show")
        rewards = _count("ad_reward_earned")
        med_loaded = _count("ad_mediation_loaded")
        med_failed = _count("ad_mediation_failed")
        suppressed = _count("ad_load_suppressed")

        ad_type_rows: List[Dict[str, Any]] = []
        banner_policy_warning = False
        for ad_t, counts in sorted(by_type.items()):
            t_req = counts.get("ad_request", 0)
            t_load = counts.get("ad_loaded", 0)
            t_imp = counts.get("ad_impression", 0)
            t_clk = counts.get("ad_clicked", 0)
            t_ctr = _pct(t_clk, t_imp)
            if ad_t.upper() == "BANNER" and t_imp >= 100 and t_ctr > 3.5:
                banner_policy_warning = True
            ad_type_rows.append(
                {
                    "ad_type": ad_t,
                    "requests": t_req,
                    "loaded": t_load,
                    "failed_to_load": counts.get("ad_failed_to_load", 0),
                    "impressions": t_imp,
                    "clicks": t_clk,
                    "rewards": counts.get("ad_reward_earned", 0),
                    "fill_rate_pct": _pct(t_load, t_req),
                    "show_rate_pct": _pct(t_imp, t_load),
                    "ctr_pct": t_ctr,
                }
            )

        errors_agg: Dict[tuple[str, str, str, str], int] = defaultdict(int)
        suppression_agg: Dict[tuple[str, str], int] = defaultdict(int)
        for row in self._rows("ads_diagnostics"):
            ev = str(row.get("eventName", "")).strip()
            cnt = _safe_int(row.get("eventCount"))
            ad_t = str(row.get("customEvent:ad_type", "(not set)")).strip()
            err_code = str(row.get("customEvent:error_code", "(not set)")).strip()
            err_msg = str(row.get("customEvent:error_message", "(not set)")).strip()
            reason = str(row.get("customEvent:reason", "(not set)")).strip()
            if ev == "ad_load_suppressed":
                suppression_agg[(ad_t, reason)] += cnt
            else:
                errors_agg[(ev, ad_t, err_code, err_msg)] += cnt

        top_errors = [
            {
                "event": k[0],
                "ad_type": k[1],
                "error_code": k[2],
                "error_message": k[3],
                "count": v,
            }
            for k, v in sorted(errors_agg.items(), key=lambda x: x[1], reverse=True)[:12]
        ]

        suppression_reasons = [
            {"ad_type": k[0], "reason": k[1], "count": v}
            for k, v in sorted(suppression_agg.items(), key=lambda x: x[1], reverse=True)[:10]
        ]

        total_mediation = sum(mediation_share.values())
        mediation_breakdown = [
            {
                "network": net,
                "wins": cnt,
                "share_pct": _pct(cnt, total_mediation),
            }
            for net, cnt in sorted(mediation_share.items(), key=lambda x: x[1], reverse=True)
        ]

        return {
            "requests": reqs,
            "loaded": loaded,
            "impressions": imps,
            "clicks": clicks,
            "failed_to_load": failed_load,
            "failed_to_show": failed_show,
            "rewards_earned": rewards,
            "mediation_loaded": med_loaded,
            "mediation_failed": med_failed,
            "suppressed": suppressed,
            "fill_rate_pct": _pct(loaded, reqs),
            "show_rate_pct": _pct(imps, loaded),
            "effective_imp_rate_pct": _pct(imps, reqs),
            "ctr_pct": _pct(clicks, imps),
            "banner_policy_warning": banner_policy_warning,
            "by_ad_type": ad_type_rows,
            "mediation_breakdown": mediation_breakdown,
            "top_errors": top_errors,
            "suppression_reasons": suppression_reasons,
        }

    def _analyze_iap(self, events_map: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Phân tích phễu chuyển đổi In-App Purchase (VIP Remove Ads) và nguồn mở Paywall.
        Analyze the VIP Remove Ads IAP funnel and Paywall entry source performance.
        """
        counts: Dict[str, int] = defaultdict(int)
        by_source: Dict[str, int] = defaultdict(int)

        for row in self._rows("iap_funnel"):
            ev = str(row.get("eventName", "")).strip()
            cnt = _safe_int(row.get("eventCount"))
            src = str(row.get("customEvent:source", "")).strip()
            counts[ev] += cnt
            if ev == "inapp_paywall_viewed" and not _is_unset(src):
                by_source[src] += cnt

        def _count(name: str) -> int:
            return counts.get(name) or events_map.get(name, {}).get("eventCount", 0)

        viewed = _count("inapp_paywall_viewed")
        initiated = _count("inapp_purchase_initiated")
        success = _count("inapp_purchase_success")
        failed = _count("inapp_purchase_failed")
        canceled = _count("inapp_purchase_canceled")
        restore_init = _count("inapp_restore_initiated")
        restore_ok = _count("inapp_restore_success")
        restore_none = _count("inapp_restore_none_found")

        return {
            "paywall_viewed": viewed,
            "purchase_initiated": initiated,
            "purchase_success": success,
            "purchase_failed": failed,
            "purchase_canceled": canceled,
            "restore_initiated": restore_init,
            "restore_success": restore_ok,
            "restore_none_found": restore_none,
            "paywall_to_init_pct": _pct(initiated, viewed),
            "init_to_success_pct": _pct(success, initiated),
            "paywall_to_success_pct": _pct(success, viewed),
            "by_source": [
                {"source": k, "views": v, "share_pct": _pct(v, viewed)}
                for k, v in sorted(by_source.items(), key=lambda x: x[1], reverse=True)
            ],
        }

    def _analyze_notifications(self, events_map: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Phân tích hiệu quả lịch 5 Notification/ngày, tìm khung giờ vàng có Open Rate cao nhất.
        Analyze 5-notifications/day cohorts and discover Golden Hours with highest Open Rate.
        """
        totals: Dict[str, int] = defaultdict(int)
        by_hour_raw: Dict[int, Dict[str, int]] = defaultdict(
            lambda: {"scheduled": 0, "delivered": 0, "suppressed": 0, "opened": 0}
        )
        by_slot_raw: Dict[str, Dict[str, int]] = defaultdict(
            lambda: {"scheduled": 0, "delivered": 0, "opened": 0}
        )

        for row in self._rows("notifications_cohort"):
            ev = str(row.get("eventName", "")).strip()
            cnt = _safe_int(row.get("eventCount"))
            slot = str(row.get("customEvent:notification_slot", "")).strip()
            hour_raw = str(row.get("customEvent:scheduled_hour", "")).strip()
            # Nhãn chữ dùng được cho dimension app; ưu tiên hơn trường số cũ.
            # Prefer the alphanumeric app dimension over the legacy numeric value.
            hour_label = str(row.get("customEvent:scheduled_hour_label", "")).strip()
            if hour_label in {"hour_08", "hour_12", "hour_20"}:
                hour_raw = hour_label.removeprefix("hour_")
            d_status = str(row.get("customEvent:delivery_status", "")).strip().lower()

            totals[ev] += cnt
            hour_int: int | None = None
            if not _is_unset(hour_raw) and hour_raw.isdigit():
                hour_int = max(0, min(23, int(hour_raw)))

            if ev == "notification_scheduled":
                if hour_int is not None:
                    by_hour_raw[hour_int]["scheduled"] += cnt
                if not _is_unset(slot):
                    by_slot_raw[slot]["scheduled"] += cnt
            elif ev == "notification_delivery":
                is_suppressed = d_status not in {"displayed", "posted"}
                if is_suppressed:
                    totals["delivery_suppressed"] += cnt
                    if hour_int is not None:
                        by_hour_raw[hour_int]["suppressed"] += cnt
                else:
                    totals["delivery_displayed"] += cnt
                    if hour_int is not None:
                        by_hour_raw[hour_int]["delivered"] += cnt
                    if not _is_unset(slot):
                        by_slot_raw[slot]["delivered"] += cnt
            elif ev == "notification_opened":
                if hour_int is not None:
                    by_hour_raw[hour_int]["opened"] += cnt
                if not _is_unset(slot):
                    by_slot_raw[slot]["opened"] += cnt

        scheduled_total = totals.get("notification_scheduled") or events_map.get(
            "notification_scheduled", {}
        ).get("eventCount", 0)
        # Không dùng mọi delivery attempt làm số đã nhận khi0 lần post thành công.
        # Never replace zero successful posts with the total delivery-attempt count.
        delivered_total = totals.get("delivery_displayed", 0)
        opened_total = totals.get("notification_opened") or events_map.get(
            "notification_opened", {}
        ).get("eventCount", 0)
        permission_events = totals.get("notification_permission") or events_map.get(
            "notification_permission", {}
        ).get("eventCount", 0)

        by_hour = []
        for hr in sorted(by_hour_raw.keys()):
            d = by_hour_raw[hr]
            by_hour.append(
                {
                    "hour": hr,
                    "hour_label": f"{hr:02d}:00",
                    "scheduled": d["scheduled"],
                    "delivered": d["delivered"],
                    "suppressed": d["suppressed"],
                    "opened": d["opened"],
                    "delivery_rate_pct": _pct(d["delivered"], d["scheduled"]),
                    "open_rate_pct": _pct(d["opened"], d["delivered"]),
                }
            )

        golden_hours = sorted(
            [h for h in by_hour if h["delivered"] > 0],
            key=lambda x: (x["open_rate_pct"], x["opened"]),
            reverse=True,
        )[:3]

        by_slot = []
        for slot_key in sorted(by_slot_raw.keys(), key=lambda s: int(s) if s.isdigit() else 99):
            s = by_slot_raw[slot_key]
            by_slot.append(
                {
                    "slot": slot_key,
                    "scheduled": s["scheduled"],
                    "delivered": s["delivered"],
                    "opened": s["opened"],
                    "open_rate_pct": _pct(s["opened"], s["delivered"]),
                }
            )

        return {
            "scheduled": scheduled_total,
            "delivered": delivered_total,
            "suppressed": totals.get("delivery_suppressed", 0),
            "opened": opened_total,
            "permission_events": permission_events,
            "delivery_rate_pct": _pct(delivered_total, scheduled_total),
            "open_rate_pct": _pct(opened_total, delivered_total),
            "by_hour": by_hour,
            "golden_hours": golden_hours,
            "by_slot": by_slot,
        }

    def _analyze_schema_audit(self) -> Dict[str, Any]:
        """
        Tổng hợp tình trạng đăng ký Custom Dimensions/Metrics và các trường bị bỏ qua.
        Summarize Custom Dimension/Metric registration status and skipped optional fields.
        """
        schema_status = self.meta.get("schema_status", {})
        skipped_by_report: Dict[str, List[str]] = {}
        for key, payload in self.reports.items():
            skipped = payload.get("skipped_optional_fields") or []
            if skipped:
                skipped_by_report[key] = list(skipped)

        return {
            "missing_dimensions": schema_status.get("missing_dimensions", []),
            "missing_metrics": schema_status.get("missing_metrics", []),
            "registered_dimensions_count": len(schema_status.get("registered_dimensions", [])),
            "total_expected_dimensions": schema_status.get("total_expected_dimensions", 0),
            "registered_metrics_count": len(schema_status.get("registered_metrics", [])),
            "total_expected_metrics": schema_status.get("total_expected_metrics", 0),
            "skipped_by_report": skipped_by_report,
        }

    def _build_recommendations(self, summary: Dict[str, Any]) -> List[str]:
        """
        Sinh danh sách khuyến nghị tối ưu hóa tự động dựa trên ngưỡng KPI thực tế.
        Generate prioritized optimization recommendations based on observed KPI thresholds.
        """
        recs: List[str] = []
        schema_audit = summary["schema_audit"]
        ads = summary["ads"]
        gameplay = summary["gameplay"]
        iap = summary["iap"]
        notif = summary["notifications"]

        missing_dims = schema_audit.get("missing_dimensions", [])
        missing_mets = schema_audit.get("missing_metrics", [])
        if missing_dims or missing_mets:
            recs.append(
                f"Cần đồng bộ {len(missing_dims)} Custom Dimensions và {len(missing_mets)} Custom Metrics "
                "còn thiếu lên GA4 bằng lệnh `--sync-dimensions` để mở khóa báo cáo chi tiết theo từng game, mã lỗi và khung giờ."
            )

        if ads["requests"] > 0 and ads["fill_rate_pct"] < 75.0:
            recs.append(
                f"Tỉ lệ Fill Rate quảng cáo hiện đạt {ads['fill_rate_pct']}% (< 75%). "
                "Ưu tiên hoàn thiện Meta Audience Network Bidding trên AdMob Mediation (TASK-045) để tăng cạnh tranh giá thầu."
            )

        if ads["banner_policy_warning"]:
            recs.append(
                "CẢNH BÁO CHÍNH SÁCH ADMOB: CTR Banner đang vượt ngưỡng 3.5%. "
                "Kiểm tra lại khoảng cách dải phân cách xanh 3dp phía trên Banner trên các thiết bị màn hình nhỏ."
            )

        r2 = gameplay["r2_downloads"]
        if r2["started"] > 0 and r2["success_rate_pct"] < 90.0:
            recs.append(
                f"Tỉ lệ tải thành công gói game R2 đạt {r2['success_rate_pct']}% (< 90%). "
                "Kiểm tra cấu hình DNS `pub-r2.nextai.games` và tăng cơ chế retry cho các game có lượt failed cao."
            )

        hardest = gameplay["hardest_games"]
        if hardest:
            top_hard = hardest[0]
            if top_hard["win_rate_pct"] < 40.0:
                recs.append(
                    f"Game '{top_hard['game_name']}' có tỉ lệ qua màn thấp ({top_hard['win_rate_pct']}%). "
                    "Cân nhắc gắn gợi ý xem Rewarded Video để nhận trợ giúp hoặc cân bằng lại độ khó các màn đầu."
                )

        if iap["paywall_viewed"] > 0 and iap["paywall_to_success_pct"] < 2.0:
            recs.append(
                f"Tỉ lệ chuyển đổi Paywall -> Mua VIP đạt {iap['paywall_to_success_pct']}%. "
                "Thử A/B testing điểm đặt Paywall ngay sau lần hiện Interstitial thứ 2 hoặc tối ưu copy ưu đãi."
            )

        recs.extend(build_roas_recommendations(summary.get("roas", {})))

        golden = notif["golden_hours"]
        if golden:
            top_h_labels = ", ".join(f"{h['hour_label']} ({h['open_rate_pct']}%)" for h in golden)
            recs.append(
                f"Khung giờ vàng mở Notification cao nhất: {top_h_labels}. "
                "Ưu tiên đẩy thông điệp game mới / streak thưởng vào các khung giờ này."
            )

        if not recs:
            recs.append("Các chỉ số vận hành và schema GA4 đang ở trạng thái ổn định; tiếp tục theo dõi xu hướng tuần tới.")

        return recs
