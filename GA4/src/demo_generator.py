"""
Trình sinh dữ liệu mô phỏng GA4 sát với cấu trúc thực tế của Game Gate Offline.
Demo dataset generator matching Game Gate Offline's exact GA4 report structure.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
import json
from pathlib import Path
import random
from typing import Any, Dict, List, Optional, Tuple

from .ga4_client import export_report_csv
from .roas_demo_data import generate_roas_demo_rows
from .schema import CUSTOM_DIMENSIONS, CUSTOM_METRICS, REPORT_SPECS

# Danh sách dự phòng nếu không tìm thấy tệp games_catalog_full_419_r2.json.
# Fallback catalog if games_catalog_full_419_r2.json is unavailable.
FALLBACK_GAMES: Tuple[Dict[str, Any], ...] = (
    {"name": "apple_worm", "title": "Apple Worm", "category": "Puzzle", "isDownloaded": 1},
    {"name": "block_blast", "title": "Block Blast", "category": "Puzzle", "isDownloaded": 1},
    {"name": "ball_8_pool", "title": "8 Ball Pool", "category": "2 Players", "isDownloaded": 1},
    {"name": "jewel_block", "title": "Jewel Block", "category": "Puzzle", "isDownloaded": 1},
    {"name": "abalone", "title": "Abalone", "category": "Casual", "isDownloaded": 0},
    {"name": "chess_classic", "title": "Chess Classic", "category": "Classic", "isDownloaded": 0},
    {"name": "twenty48", "title": "2048", "category": "Puzzle", "isDownloaded": 1},
    {"name": "snake_io", "title": "Snake Arcade", "category": "Arcade", "isDownloaded": 0},
    {"name": "fruit_slice", "title": "Fruit Slice", "category": "Arcade", "isDownloaded": 1},
    {"name": "sudoku_master", "title": "Sudoku Master", "category": "Classic", "isDownloaded": 0},
    {"name": "solitaire_classic", "title": "Solitaire", "category": "Classic", "isDownloaded": 1},
    {"name": "ludo_party", "title": "Ludo Party", "category": "2 Players", "isDownloaded": 0},
)


def _load_catalog_sample(project_root: Path) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Đọc danh mục 419 game thật từ Android assets để lấy tên game bundled & remote cho bản demo.
    Read the real 419-game catalog from Android assets to sample bundled and remote games.
    """
    catalog_path = (
        project_root / "Android" / "src" / "main" / "assets" / "games_catalog_full_419_r2.json"
    )
    items: List[Dict[str, Any]] = []
    if catalog_path.is_file():
        try:
            loaded = json.loads(catalog_path.read_text(encoding="utf-8"))
            if isinstance(loaded, list):
                items = [x for x in loaded if isinstance(x, dict) and x.get("name")]
        except (OSError, json.JSONDecodeError):
            items = []

    if not items:
        items = list(FALLBACK_GAMES)

    bundled = [g for g in items if int(g.get("isDownloaded", 1)) == 1][:12]
    remote = [g for g in items if int(g.get("isDownloaded", 1)) == 0][:8]
    if not bundled:
        bundled = items[:8]
    if not remote:
        remote = items[8:14] if len(items) > 8 else items[:4]
    return bundled, remote


def generate_demo_bundle(
    project_root: Path,
    days: int = 30,
    output_demo_dir: Optional[Path] = None,
    seed: int = 20261116,
) -> Dict[str, Any]:
    """
    Tạo gói dữ liệu mô phỏng đầy đủ 11 bảng báo cáo GA4 và ghi ra thư mục demo.
    Generate a full 11-report demo GA4 dataset and optionally persist JSON & CSV outputs.
    """
    rng = random.Random(seed)
    bundled_games, remote_games = _load_catalog_sample(project_root)

    end_dt = date.today()
    start_dt = end_dt - timedelta(days=max(1, days) - 1)

    # 1. Daily Overview
    daily_rows: List[Dict[str, Any]] = []
    for offset in range(max(1, days)):
        cur_dt = start_dt + timedelta(days=offset)
        growth_factor = 1.0 + (offset / max(1, days)) * 0.28
        weekend_boost = 1.18 if cur_dt.weekday() >= 5 else 1.0
        active_users = int((1120 + rng.randint(-120, 160)) * growth_factor * weekend_boost)
        new_users = int(active_users * rng.uniform(0.24, 0.34))
        total_users = int(active_users * 1.04)
        sessions = int(active_users * rng.uniform(1.65, 2.05))
        engagement_rate = round(rng.uniform(0.61, 0.74), 4)
        engaged_sessions = int(sessions * engagement_rate)
        user_eng_sec = int(active_users * rng.uniform(460, 720))
        screen_views = int(sessions * rng.uniform(4.2, 6.0))
        event_count = int(sessions * rng.uniform(18.5, 25.0))
        daily_rows.append(
            {
                "date": cur_dt.strftime("%Y%m%d"),
                "activeUsers": active_users,
                "newUsers": new_users,
                "totalUsers": total_users,
                "sessions": sessions,
                "engagedSessions": engaged_sessions,
                "engagementRate": engagement_rate,
                "userEngagementDuration": user_eng_sec,
                "screenPageViews": screen_views,
                "eventCount": event_count,
            }
        )

    # 2. App versions & Geo/Devices & Hourly Activity
    app_versions_rows = [
        {"appVersion": "1.3", "operatingSystemVersion": "Android 16", "activeUsers": 8420, "newUsers": 2910, "sessions": 19340, "userEngagementDuration": 5420100},
        {"appVersion": "1.3", "operatingSystemVersion": "Android 15", "activeUsers": 6150, "newUsers": 1820, "sessions": 13920, "userEngagementDuration": 3890400},
        {"appVersion": "1.2", "operatingSystemVersion": "Android 14", "activeUsers": 3480, "newUsers": 740, "sessions": 7210, "userEngagementDuration": 1920300},
        {"appVersion": "1.2", "operatingSystemVersion": "Android 13", "activeUsers": 1890, "newUsers": 310, "sessions": 3620, "userEngagementDuration": 910200},
    ]
    geo_devices_rows = [
        {"country": "Vietnam", "deviceCategory": "mobile", "mobileDeviceModel": "SM-A075F", "activeUsers": 5420, "sessions": 13450, "engagedSessions": 9420, "userEngagementDuration": 3620000},
        {"country": "Indonesia", "deviceCategory": "mobile", "mobileDeviceModel": "Redmi 13C", "activeUsers": 3890, "sessions": 9210, "engagedSessions": 6210, "userEngagementDuration": 2410000},
        {"country": "India", "deviceCategory": "mobile", "mobileDeviceModel": "SM-A155F", "activeUsers": 3410, "sessions": 7820, "engagedSessions": 5190, "userEngagementDuration": 1980000},
        {"country": "Philippines", "deviceCategory": "mobile", "mobileDeviceModel": "Infinix Smart 8", "activeUsers": 2240, "sessions": 5140, "engagedSessions": 3420, "userEngagementDuration": 1320000},
        {"country": "Brazil", "deviceCategory": "mobile", "mobileDeviceModel": "Moto G24", "activeUsers": 1860, "sessions": 4210, "engagedSessions": 2740, "userEngagementDuration": 1090000},
        {"country": "United States", "deviceCategory": "mobile", "mobileDeviceModel": "Pixel 8a", "activeUsers": 980, "sessions": 2190, "engagedSessions": 1540, "userEngagementDuration": 690000},
    ]
    hourly_rows = []
    hourly_weights = [
        0.35, 0.25, 0.20, 0.18, 0.22, 0.35,
        0.58, 0.85, 0.96, 0.92, 0.88, 1.05,
        1.22, 1.10, 0.95, 0.98, 1.12, 1.28,
        1.45, 1.65, 1.78, 1.68, 1.25, 0.72,
    ]
    for hr, w in enumerate(hourly_weights):
        au = int(1600 * w + rng.randint(-60, 80))
        hourly_rows.append(
            {
                "hour": f"{hr:02d}",
                "activeUsers": au,
                "sessions": int(au * 1.35),
                "eventCount": int(au * 15.2),
            }
        )

    # 3. Games Performance & R2 Downloads
    games_rows: List[Dict[str, Any]] = []
    sampled_games = bundled_games[:10] + remote_games[:5]
    event_totals: Dict[str, int] = {}

    for idx, game in enumerate(sampled_games):
        g_name = str(game["name"])
        g_cat = str(game.get("category", "Casual"))
        scale = max(0.25, 1.35 - idx * 0.08)
        opens = int(8500 * scale + rng.randint(150, 900))
        starts = int(opens * rng.uniform(0.82, 0.94))
        lvl_starts = int(starts * rng.uniform(2.1, 3.6))
        win_prob = rng.uniform(0.38, 0.81)
        lvl_complete = int(lvl_starts * win_prob * 0.85)
        lvl_failed = int(lvl_starts * (1.0 - win_prob) * 0.78)
        lvl_restart = int(lvl_failed * rng.uniform(0.45, 0.72))
        play_events = int(opens * rng.uniform(0.75, 0.90))
        play_sec_total = int(play_events * rng.uniform(140, 390))
        users_est = int(opens * rng.uniform(0.32, 0.48))

        per_game = [
            ("game_open", opens, users_est, 0),
            ("game_start", starts, int(users_est * 0.92), 0),
            ("game_level_start", lvl_starts, int(users_est * 0.88), 0),
            ("game_level_complete", lvl_complete, int(users_est * 0.75), 0),
            ("game_level_failed", lvl_failed, int(users_est * 0.68), 0),
            ("game_level_restart", lvl_restart, int(users_est * 0.52), 0),
            ("game_play_time", play_events, int(users_est * 0.86), play_sec_total),
            ("game_score_submitted", int(lvl_complete * 0.8), int(users_est * 0.65), 0),
        ]
        for ev_name, count, users, dur_sec in per_game:
            event_totals[ev_name] = event_totals.get(ev_name, 0) + count
            games_rows.append(
                {
                    "eventName": ev_name,
                    "customEvent:game_name": g_name,
                    "customEvent:game_category": g_cat,
                    "eventCount": count,
                    "totalUsers": users,
                    "customEvent:session_duration_sec": dur_sec,
                }
            )

    r2_rows: List[Dict[str, Any]] = []
    for idx, game in enumerate(remote_games[:6]):
        g_name = str(game["name"])
        started = int(1450 * max(0.3, 1.1 - idx * 0.14))
        fail_rate = 0.04 if idx != 2 else 0.18
        failed = max(5, int(started * fail_rate))
        completed = max(0, started - failed)
        for status_name, cnt, err in (
            ("started", started, "(not set)"),
            ("completed", completed, "(not set)"),
            ("failed", failed, "ERR_NAME_NOT_RESOLVED: pub-r2.nextai.games" if idx == 2 else "SocketTimeoutException: read timed out"),
        ):
            event_totals["game_download"] = event_totals.get("game_download", 0) + cnt
            r2_rows.append(
                {
                    "eventName": "game_download",
                    "customEvent:game_name": g_name,
                    "customEvent:status": status_name,
                    "customEvent:error_message": err,
                    "eventCount": cnt,
                    "totalUsers": max(1, int(cnt * 0.86)),
                }
            )

    # 4. Ads & Mediation Funnel + Diagnostics
    ads_rows: List[Dict[str, Any]] = []
    ad_profiles = (
        ("BANNER", "ca-app-pub-4108090245719282/4579664323", 124000, 0.89, 0.94, 0.014, 0.18),
        ("INTERSTITIAL", "ca-app-pub-4108090245719282/3500572281", 46500, 0.76, 0.84, 0.041, 0.24),
        ("REWARDED", "ca-app-pub-4108090245719282/7458098782", 18200, 0.71, 0.88, 0.056, 0.21),
        ("APP_OPEN", "ca-app-pub-4108090245719282/3518853778", 29800, 0.81, 0.79, 0.025, 0.05),
    )
    for ad_type, unit_id, reqs, fill_r, show_r, ctr_r, meta_share in ad_profiles:
        loaded = int(reqs * fill_r)
        failed_load = reqs - loaded
        imps = int(loaded * show_r)
        clicks = int(imps * ctr_r)
        dismissed = int(imps * 0.92) if ad_type != "BANNER" else 0
        reward_earned = int(imps * 0.86) if ad_type == "REWARDED" else 0
        meta_wins = int(loaded * meta_share)
        google_wins = loaded - meta_wins

        ad_events = [
            ("ad_request", unit_id, "(not set)", reqs),
            ("ad_loaded", unit_id, "(not set)", loaded),
            ("ad_failed_to_load", unit_id, "(not set)", failed_load),
            ("ad_impression", unit_id, "(not set)", imps),
            ("ad_clicked", unit_id, "(not set)", clicks),
            ("ad_mediation_loaded", "(not set)", "google", google_wins),
            ("ad_mediation_loaded", "(not set)", "meta", meta_wins),
        ]
        if dismissed:
            ad_events.append(("ad_dismissed", unit_id, "(not set)", dismissed))
        if reward_earned:
            ad_events.append(("ad_reward_earned", unit_id, "(not set)", reward_earned))

        for ev_name, u_id, net_name, cnt in ad_events:
            event_totals[ev_name] = event_totals.get(ev_name, 0) + cnt
            ads_rows.append(
                {
                    "eventName": ev_name,
                    "customEvent:ad_type": ad_type,
                    "customEvent:ad_unit_id": u_id,
                    "customEvent:ad_network": net_name,
                    "eventCount": cnt,
                    "totalUsers": max(1, int(min(18500, cnt * 0.22))),
                }
            )

    ads_diag_rows = [
        {"eventName": "ad_failed_to_load", "customEvent:ad_type": "INTERSTITIAL", "customEvent:error_code": "3", "customEvent:error_message": "No fill.", "customEvent:reason": "(not set)", "eventCount": 8940},
        {"eventName": "ad_failed_to_load", "customEvent:ad_type": "BANNER", "customEvent:error_code": "3", "customEvent:error_message": "No fill.", "customEvent:reason": "(not set)", "eventCount": 10250},
        {"eventName": "ad_failed_to_load", "customEvent:ad_type": "REWARDED", "customEvent:error_code": "2", "customEvent:error_message": "Network Error", "customEvent:reason": "(not set)", "eventCount": 3180},
        {"eventName": "ad_mediation_failed", "customEvent:ad_type": "INTERSTITIAL", "customEvent:error_code": "101", "customEvent:error_message": "Meta placement mapping not configured", "customEvent:reason": "(not set)", "eventCount": 4120},
        {"eventName": "ad_load_suppressed", "customEvent:ad_type": "INTERSTITIAL", "customEvent:error_code": "(not set)", "customEvent:error_message": "(not set)", "customEvent:reason": "frequency_cap_90s", "eventCount": 6340},
        {"eventName": "ad_load_suppressed", "customEvent:ad_type": "APP_OPEN", "customEvent:error_code": "(not set)", "customEvent:error_message": "(not set)", "customEvent:reason": "cache_ttl_valid", "eventCount": 2190},
    ]
    event_totals["ad_mediation_failed"] = 4120
    event_totals["ad_load_suppressed"] = 8530

    # 5. IAP Funnel
    iap_rows = [
        {"eventName": "inapp_paywall_viewed", "customEvent:source": "launcher_header", "customEvent:product_id": "(not set)", "eventCount": 4280, "totalUsers": 2810},
        {"eventName": "inapp_paywall_viewed", "customEvent:source": "settings_dialog", "customEvent:product_id": "(not set)", "eventCount": 1640, "totalUsers": 1220},
        {"eventName": "inapp_paywall_viewed", "customEvent:source": "game_exit", "customEvent:product_id": "(not set)", "eventCount": 2190, "totalUsers": 1590},
        {"eventName": "inapp_purchase_initiated", "customEvent:source": "(not set)", "customEvent:product_id": "com.nextai.gameoffline.remove_ads", "eventCount": 612, "totalUsers": 524},
        {"eventName": "inapp_purchase_success", "customEvent:source": "(not set)", "customEvent:product_id": "com.nextai.gameoffline.remove_ads", "eventCount": 184, "totalUsers": 184},
        {"eventName": "inapp_purchase_canceled", "customEvent:source": "(not set)", "customEvent:product_id": "com.nextai.gameoffline.remove_ads", "eventCount": 376, "totalUsers": 330},
        {"eventName": "inapp_purchase_failed", "customEvent:source": "(not set)", "customEvent:product_id": "com.nextai.gameoffline.remove_ads", "eventCount": 52, "totalUsers": 49},
        {"eventName": "inapp_restore_initiated", "customEvent:source": "(not set)", "customEvent:product_id": "(not set)", "eventCount": 240, "totalUsers": 210},
        {"eventName": "inapp_restore_success", "customEvent:source": "(not set)", "customEvent:product_id": "com.nextai.gameoffline.remove_ads", "eventCount": 44, "totalUsers": 44},
        {"eventName": "inapp_restore_none_found", "customEvent:source": "(not set)", "customEvent:product_id": "(not set)", "eventCount": 196, "totalUsers": 168},
    ]
    for row in iap_rows:
        ev = row["eventName"]
        event_totals[ev] = event_totals.get(ev, 0) + int(row["eventCount"])

    # 6. Notifications Cohort (5 slots/day across anchor hours)
    notif_rows: List[Dict[str, Any]] = []
    # Giờ vàng thực tế cao vào buổi trưa (12h) và tối (19h-21h).
    # Realistic open-rate curve peaking around lunch (12:00) and evening (19:00-21:00).
    slot_hours = [8, 12, 16, 20, 22]
    open_rates = {8: 0.082, 12: 0.146, 16: 0.105, 20: 0.184, 22: 0.118}
    for slot_idx, hour_val in enumerate(slot_hours):
        scheduled = 15200 - slot_idx * 420
        delivered = int(scheduled * 0.87)
        suppressed = scheduled - delivered
        opened = int(delivered * open_rates[hour_val])
        cohort_hr = str(slot_hours[0])
        entries = [
            ("notification_scheduled", str(slot_idx), str(hour_val), "(not set)", cohort_hr, scheduled),
            ("notification_delivery", str(slot_idx), str(hour_val), "displayed", cohort_hr, delivered),
            ("notification_delivery", str(slot_idx), str(hour_val), "permission_denied", cohort_hr, suppressed),
            ("notification_opened", str(slot_idx), str(hour_val), "(not set)", cohort_hr, opened),
        ]
        for ev_name, s_idx, s_hr, d_status, c_hr, cnt in entries:
            event_totals[ev_name] = event_totals.get(ev_name, 0) + cnt
            notif_rows.append(
                {
                    "eventName": ev_name,
                    "customEvent:notification_slot": s_idx,
                    "customEvent:scheduled_hour": s_hr,
                    "customEvent:delivery_status": d_status,
                    "customUser:notification_cohort_hour": c_hr,
                    "eventCount": cnt,
                    "totalUsers": max(1, int(cnt * 0.35)),
                }
            )
    notif_rows.append(
        {
            "eventName": "notification_permission",
            "customEvent:notification_slot": "(not set)",
            "customEvent:scheduled_hour": "(not set)",
            "customEvent:delivery_status": "(not set)",
            "customUser:notification_cohort_hour": "8",
            "eventCount": 14850,
            "totalUsers": 14200,
        }
    )
    event_totals["notification_permission"] = 14850

    # 7. Events Summary
    events_summary_rows = [
        {
            "eventName": ev_name,
            "eventCount": cnt,
            "totalUsers": max(1, min(19500, int(cnt * 0.28))),
            "eventCountPerUser": round(cnt / max(1, min(19500, int(cnt * 0.28))), 2),
        }
        for ev_name, cnt in sorted(event_totals.items(), key=lambda x: x[1], reverse=True)
    ]

    raw_rows_by_key: Dict[str, List[Dict[str, Any]]] = {
        "daily_overview": daily_rows,
        "events_summary": events_summary_rows,
        "app_versions": app_versions_rows,
        "geo_devices": geo_devices_rows,
        "hourly_activity": hourly_rows,
        "games_performance": games_rows,
        "r2_downloads": r2_rows,
        "ads_funnel": ads_rows,
        "ads_diagnostics": ads_diag_rows,
        "iap_funnel": iap_rows,
        "notifications_cohort": notif_rows,
        **generate_roas_demo_rows(start_dt, days),
    }

    reports_map: Dict[str, Any] = {}
    for spec in REPORT_SPECS:
        rows = raw_rows_by_key.get(spec.key, [])
        dims = list(spec.dimensions) + list(spec.optional_dimensions)
        mets = list(spec.metrics) + list(spec.optional_metrics)
        reports_map[spec.key] = {
            "key": spec.key,
            "title": spec.title,
            "dimensions": dims,
            "metrics": mets,
            "skipped_optional_fields": [],
            "row_count": len(rows),
            "total_available_rows": len(rows),
            "rows": rows,
        }

    bundle: Dict[str, Any] = {
        "meta": {
            "data_source": "DEMO_PREVIEW",
            "property_id": "DEMO-PREVIEW (nextai-game-offline)",
            "start_date": start_dt.isoformat(),
            "end_date": end_dt.isoformat(),
            "timezone": "Asia/Ho_Chi_Minh",
            "extracted_at_utc": datetime.now(timezone.utc).isoformat(),
            "schema_status": {
                "total_expected_dimensions": len(CUSTOM_DIMENSIONS),
                "registered_dimensions": [d.parameter_name for d in CUSTOM_DIMENSIONS],
                "missing_dimensions": [],
                "total_expected_metrics": len(CUSTOM_METRICS),
                "registered_metrics": [m.parameter_name for m in CUSTOM_METRICS],
                "missing_metrics": [],
            },
        },
        "realtime": {
            "active_users_last_30m": 148,
            "countries": [
                {"country": "Vietnam", "activeUsers": 54},
                {"country": "Indonesia", "activeUsers": 37},
                {"country": "India", "activeUsers": 31},
                {"country": "Philippines", "activeUsers": 26},
            ],
        },
        "reports": reports_map,
    }

    if output_demo_dir is not None:
        output_demo_dir.mkdir(parents=True, exist_ok=True)
        (output_demo_dir / "ga4_bundle.json").write_text(
            json.dumps(bundle, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        csv_dir = output_demo_dir / "csv"
        for spec_key, payload in reports_map.items():
            (output_demo_dir / f"{spec_key}.json").write_text(
                json.dumps(payload, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            export_report_csv(
                csv_dir / f"{spec_key}.csv",
                payload["dimensions"] + payload["metrics"],
                payload["rows"],
            )

    return bundle
