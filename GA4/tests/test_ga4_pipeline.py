"""
Bộ kiểm thử tự động cho công cụ kết nối & phân tích GA4 (schema, analyzer, CLI, demo).
Automated pytest suite for the GA4 analytics toolkit (schema, analyzer, CLI, demo).
"""

from __future__ import annotations

import csv
import json
from pathlib import Path
import sys

import pytest

GA4_ROOT = Path(__file__).resolve().parent.parent
if str(GA4_ROOT) not in sys.path:
    sys.path.insert(0, str(GA4_ROOT))

from src.analyzer import GA4Analyzer  # noqa: E402
from src.cli import main as cli_main  # noqa: E402
from src.config import load_config  # noqa: E402
from src.demo_generator import generate_demo_bundle  # noqa: E402
from src.ga4_client import export_report_csv  # noqa: E402
from src.report_builder import build_html_dashboard, build_markdown_report, write_reports  # noqa: E402
from src.schema import (  # noqa: E402
    ALL_TRACKED_EVENTS,
    CUSTOM_DIMENSIONS,
    CUSTOM_METRICS,
    FORMAT_AD_EVENTS,
    MAX_GA4_DIMENSIONS_PER_REQUEST,
    MAX_GA4_METRICS_PER_REQUEST,
    REPORT_SPECS,
    resolve_report_fields,
)


def test_schema_contains_all_android_events_and_respects_ga4_limits() -> None:
    """
    Xác nhận đủ toàn bộ sự kiện Android và mọi ReportSpec không vượt giới hạn 9 dim / 10 metric.
    Verify all Android events are registered and every ReportSpec fits within GA4 API limits.
    """
    expected_events = {
        # GameAnalyticsManager.kt
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
        "ad_request",
        "ad_loaded",
        "ad_failed_to_load",
        "ad_impression",
        "ad_clicked",
        "ad_dismissed",
        "ad_failed_to_show",
        "ad_reward_earned",
        "inapp_paywall_viewed",
        "inapp_purchase_initiated",
        "inapp_purchase_success",
        "inapp_purchase_failed",
        "inapp_purchase_canceled",
        "inapp_restore_initiated",
        "inapp_restore_success",
        "inapp_restore_none_found",
        # AdMediationAnalytics.kt
        "ad_mediation_loaded",
        "ad_mediation_failed",
        "ad_load_suppressed",
        # NotificationAnalyticsTracker.kt
        "notification_scheduled",
        "notification_delivery",
        "notification_opened",
        "notification_permission",
    }
    assert expected_events.issubset(set(ALL_TRACKED_EVENTS))
    assert {"game_search", "ad_free_pass_activated", "daily_quest_completed"}.issubset(
        set(ALL_TRACKED_EVENTS)
    )
    assert len(CUSTOM_DIMENSIONS) == 28
    assert any(d.parameter_name == "level_label" and d.scope == "EVENT" for d in CUSTOM_DIMENSIONS)
    assert any(d.parameter_name == "search_term" and d.scope == "EVENT" for d in CUSTOM_DIMENSIONS)
    assert len(CUSTOM_METRICS) == 6
    assert any(m.parameter_name == "result_count" and m.measurement_unit == "STANDARD" for m in CUSTOM_METRICS)
    assert any(m.parameter_name == "streak_days" and m.measurement_unit == "STANDARD" for m in CUSTOM_METRICS)

    reports = {spec.key: spec for spec in REPORT_SPECS}
    search_spec = reports["search_terms"]
    assert search_spec.event_names == ("game_search",)
    assert "customEvent:search_term" in search_spec.optional_dimensions
    assert "customEvent:result_count" in search_spec.optional_metrics

    for spec in REPORT_SPECS:
        total_dims = len(spec.dimensions) + len(spec.optional_dimensions)
        total_mets = len(spec.metrics) + len(spec.optional_metrics)
        assert total_dims <= MAX_GA4_DIMENSIONS_PER_REQUEST, f"{spec.key} exceeds 9 dimensions"
        assert total_mets <= MAX_GA4_METRICS_PER_REQUEST, f"{spec.key} exceeds 10 metrics"


def test_new_reports_keep_game_levels_and_ad_format_events_separate() -> None:
    """Giữ phân tách event mới/cũ / Keep new and legacy event reporting separate."""
    reports = {spec.key: spec for spec in REPORT_SPECS}
    level_report = reports["game_levels"]
    assert {"customEvent:game_name", "customEvent:level_label"}.issubset(level_report.optional_dimensions)
    assert set(level_report.event_names) == {"game_level_start", "game_level_complete", "game_level_failed", "game_level_reached", "game_level_restart"}
    format_report = reports["ads_format_events"]
    assert len(FORMAT_AD_EVENTS) == 25
    assert {
        "native_load",
        "native_loaded",
        "native_load_fail",
        "native_showed",
        "native_click",
    }.issubset(set(FORMAT_AD_EVENTS))
    assert set(format_report.event_names) == set(FORMAT_AD_EVENTS)
    assert set(format_report.event_names).isdisjoint(reports["ads_funnel"].event_names)
    assert "appVersion" in format_report.dimensions
    dims, _, skipped = resolve_report_fields(level_report, {"eventName", "customEvent:game_name"}, None)
    assert dims == ["eventName", "customEvent:game_name"]
    assert "customEvent:level_label" in skipped


def test_resolve_report_fields_filters_unregistered_custom_fields() -> None:
    """
    Đảm bảo resolve_report_fields loại bỏ custom dimension/metric chưa đăng ký khỏi truy vấn.
    Ensure resolve_report_fields drops unregistered custom fields so GA4 API never returns 400.
    """
    games_spec = next(s for s in REPORT_SPECS if s.key == "games_performance")
    dims, mets, skipped = resolve_report_fields(
        games_spec,
        available_dimensions={"eventName", "customEvent:game_name"},
        available_metrics={"eventCount", "totalUsers"},
    )
    assert dims == ["eventName", "customEvent:game_name"]
    assert mets == ["eventCount", "totalUsers"]
    assert set(skipped) == {
        "customEvent:game_category",
        "customEvent:session_duration_sec",
    }


def test_analyzer_handles_empty_bundle_without_zero_division() -> None:
    """
    Đảm bảo analyzer xử lý dữ liệu rỗng 0 dòng mà không gặp lỗi ZeroDivisionError.
    Verify analyzer handles empty bundles with 0 rows without ZeroDivisionError.
    """
    empty_bundle = {
        "meta": {"data_source": "LIVE_GA4", "property_id": "123456789"},
        "realtime": {},
        "reports": {spec.key: {"rows": []} for spec in REPORT_SPECS},
    }
    result = GA4Analyzer(empty_bundle).analyze()
    assert result["overview"]["avg_dau"] == 0.0
    assert result["ads"]["fill_rate_pct"] == 0.0
    assert result["ads"]["ctr_pct"] == 0.0
    assert result["gameplay"]["overall_level_win_rate_pct"] == 0.0
    assert result["iap"]["paywall_to_success_pct"] == 0.0
    assert result["notifications"]["open_rate_pct"] == 0.0
    assert len(result["recommendations"]) >= 1


def test_analyzer_kpi_calculations_exact() -> None:
    """
    Kiểm tra tính toán chính xác Fill Rate, Show Rate, CTR, Win Rate và Golden Hour Notification.
    Verify exact KPI calculations for Ads, Gameplay win rate, IAP funnel, and Golden Hours.
    """
    bundle = {
        "meta": {
            "data_source": "LIVE_GA4",
            "property_id": "987654321",
            "start_date": "2026-11-01",
            "end_date": "2026-11-04",
            "schema_status": {
                "total_expected_dimensions": 23,
                "registered_dimensions": ["game_name", "ad_type"],
                "missing_dimensions": ["ad_network"],
                "total_expected_metrics": 4,
                "registered_metrics": ["session_duration_sec"],
                "missing_metrics": ["load_duration_ms"],
            },
        },
        "realtime": {"active_users_last_30m": 12, "countries": []},
        "reports": {
            "daily_overview": {
                "rows": [
                    {"date": "20261101", "activeUsers": 100, "newUsers": 20, "sessions": 150, "engagedSessions": 90, "engagementRate": 0.6, "userEngagementDuration": 6000, "screenPageViews": 300, "eventCount": 1200},
                    {"date": "20261102", "activeUsers": 120, "newUsers": 25, "sessions": 180, "engagedSessions": 117, "engagementRate": 0.65, "userEngagementDuration": 7200, "screenPageViews": 360, "eventCount": 1500},
                    {"date": "20261103", "activeUsers": 150, "newUsers": 30, "sessions": 220, "engagedSessions": 154, "engagementRate": 0.7, "userEngagementDuration": 9000, "screenPageViews": 420, "eventCount": 1800},
                    {"date": "20261104", "activeUsers": 180, "newUsers": 40, "sessions": 250, "engagedSessions": 175, "engagementRate": 0.7, "userEngagementDuration": 10800, "screenPageViews": 500, "eventCount": 2100},
                ]
            },
            "events_summary": {"rows": []},
            "app_versions": {"rows": []},
            "geo_devices": {"rows": []},
            "hourly_activity": {"rows": []},
            "games_performance": {
                "rows": [
                    {"eventName": "game_open", "customEvent:game_name": "apple_worm", "customEvent:game_category": "Puzzle", "eventCount": 500, "totalUsers": 200, "customEvent:session_duration_sec": 0},
                    {"eventName": "game_level_complete", "customEvent:game_name": "apple_worm", "customEvent:game_category": "(not set)", "eventCount": 75, "totalUsers": 50, "customEvent:session_duration_sec": 0},
                    {"eventName": "game_level_failed", "customEvent:game_name": "apple_worm", "customEvent:game_category": "(not set)", "eventCount": 25, "totalUsers": 20, "customEvent:session_duration_sec": 0},
                ]
            },
            "r2_downloads": {
                "rows": [
                    {"eventName": "game_download", "customEvent:game_name": "abalone", "customEvent:status": "started", "customEvent:error_message": "(not set)", "eventCount": 100},
                    {"eventName": "game_download", "customEvent:game_name": "abalone", "customEvent:status": "completed", "customEvent:error_message": "(not set)", "eventCount": 90},
                    {"eventName": "game_download", "customEvent:game_name": "abalone", "customEvent:status": "failed", "customEvent:error_message": "Timeout", "eventCount": 10},
                ]
            },
            "ads_funnel": {
                "rows": [
                    {"eventName": "ad_request", "customEvent:ad_type": "BANNER", "eventCount": 1000},
                    {"eventName": "ad_loaded", "customEvent:ad_type": "BANNER", "eventCount": 800},
                    {"eventName": "ad_impression", "customEvent:ad_type": "BANNER", "eventCount": 600},
                    {"eventName": "ad_clicked", "customEvent:ad_type": "BANNER", "eventCount": 30},
                ]
            },
            "ads_diagnostics": {"rows": []},
            "iap_funnel": {
                "rows": [
                    {"eventName": "inapp_paywall_viewed", "customEvent:source": "launcher_header", "eventCount": 200},
                    {"eventName": "inapp_purchase_initiated", "customEvent:source": "(not set)", "eventCount": 20},
                    {"eventName": "inapp_purchase_success", "customEvent:source": "(not set)", "eventCount": 5},
                ]
            },
            "notifications_cohort": {
                "rows": [
                    {"eventName": "notification_scheduled", "customEvent:notification_slot": "0", "customEvent:scheduled_hour": "8", "customEvent:delivery_status": "(not set)", "eventCount": 100},
                    {"eventName": "notification_delivery", "customEvent:notification_slot": "0", "customEvent:scheduled_hour": "8", "customEvent:delivery_status": "displayed", "eventCount": 80},
                    {"eventName": "notification_opened", "customEvent:notification_slot": "0", "customEvent:scheduled_hour": "8", "eventCount": 8},
                    {"eventName": "notification_scheduled", "customEvent:notification_slot": "1", "customEvent:scheduled_hour": "20", "customEvent:delivery_status": "(not set)", "eventCount": 100},
                    {"eventName": "notification_delivery", "customEvent:notification_slot": "1", "customEvent:scheduled_hour": "20", "customEvent:delivery_status": "displayed", "eventCount": 80},
                    {"eventName": "notification_opened", "customEvent:notification_slot": "1", "customEvent:scheduled_hour": "20", "eventCount": 20},
                ]
            },
        },
    }
    res = GA4Analyzer(bundle).analyze()
    assert res["overview"]["trend_dau_pct"] == 50.0  # (165 - 110) / 110 = 50%
    assert res["gameplay"]["overall_level_win_rate_pct"] == 75.0
    assert res["gameplay"]["r2_downloads"]["success_rate_pct"] == 90.0
    assert res["ads"]["fill_rate_pct"] == 80.0
    assert res["ads"]["show_rate_pct"] == 75.0
    assert res["ads"]["ctr_pct"] == 5.0
    assert res["ads"]["banner_policy_warning"] is True
    assert res["iap"]["paywall_to_success_pct"] == 2.5
    assert res["notifications"]["golden_hours"][0]["hour"] == 20
    assert res["notifications"]["golden_hours"][0]["open_rate_pct"] == 25.0


def test_demo_end_to_end_and_csv_export(tmp_path: Path) -> None:
    """
    Kiểm thử quy trình Demo End-to-End tạo JSON, CSV, Markdown và Dashboard HTML.
    Verify end-to-end demo pipeline generates valid JSON, CSV, Markdown, and HTML outputs.
    """
    demo_dir = tmp_path / "demo"
    reports_dir = tmp_path / "reports"
    bundle = generate_demo_bundle(
        project_root=GA4_ROOT.parent,
        days=7,
        output_demo_dir=demo_dir,
    )
    assert (demo_dir / "ga4_bundle.json").is_file()
    assert (demo_dir / "csv" / "daily_overview.csv").is_file()

    with (demo_dir / "csv" / "daily_overview.csv").open("r", encoding="utf-8-sig") as f:
        csv_rows = list(csv.DictReader(f))
    assert len(csv_rows) == 7

    analysis = GA4Analyzer(bundle).analyze()
    written = write_reports(
        analysis,
        reports_dir=reports_dir,
        markdown_filename="GA4_DEMO_REPORT.md",
        html_filename="demo_dashboard.html",
    )
    md_text = written["markdown"].read_text(encoding="utf-8")
    html_text = written["html"].read_text(encoding="utf-8")
    assert "[DEMO PREVIEW - CHƯA KẾT NỐI KEY THẬT]" in md_text
    assert "data-theme=" in html_text
    assert "window.__GA4_SUMMARY__" in html_text


def test_cli_check_without_credentials_returns_exit_2(tmp_path: Path) -> None:
    """
    Kiểm tra lệnh --check khi chưa có service-account.json trả mã 2 sạch sẽ không crash.
    Verify CLI --check returns exit code 2 cleanly when credentials are missing.
    """
    missing_key = tmp_path / "nonexistent-key.json"
    code = cli_main(["--check", "--credentials", str(missing_key)])
    assert code == 2


def test_notification_hour_aliases_are_separate_from_delivery_funnel() -> None:
    """Không đếm đôi alias posted vào funnel / Do not double-count posted aliases in the lifecycle funnel."""
    from src.schema import NOTIFICATION_TIME_EVENTS, NOTIFICATION_EVENTS, REPORT_SPECS
    expected = {"notifycation_time_8h", "notifycation_time_12h", "notifycation_time_20h"}
    assert set(NOTIFICATION_TIME_EVENTS) == expected
    assert expected.isdisjoint(NOTIFICATION_EVENTS)
    report = next(item for item in REPORT_SPECS if item.key == "notification_time_events")
    assert set(report.event_names) == expected
    assert "customEvent:scheduled_hour_label" in report.optional_dimensions
    assert "customEvent:game_name" in report.optional_dimensions


def test_blocked_notifications_never_count_as_delivered() -> None:
    """Blocked/expired attempts are not successful deliveries / Lượt bị chặn hoặc hết hạn không phải post thành công."""
    bundle = {"reports": {"notifications_cohort": {"rows": [
        {"eventName": "notification_delivery", "eventCount": 4,
         "customEvent:scheduled_hour": "(not set)", "customEvent:scheduled_hour_label": "hour_08",
         "customEvent:delivery_status": "runtime_permission_blocked"},
        {"eventName": "notification_delivery", "eventCount": 3,
         "customEvent:scheduled_hour_label": "hour_12", "customEvent:delivery_status": "expired"},
    ]}}}
    result = GA4Analyzer(bundle).analyze()["notifications"]
    assert all(row["delivered"] == 0 for row in result["by_hour"])
    assert {row["hour"] for row in result["by_hour"]} == {8, 12}
    assert sum(row["suppressed"] for row in result["by_hour"]) == 7


def test_offline_r2_downloads_do_not_pollute_infrastructure_failure_rate() -> None:
    """
    Người chơi ngoại tuyến (`status=offline`) không được cộng vào `failed` hay `UnknownHostException`
    để tránh làm sai lệch tỉ lệ thành công của hạ tầng R2.
    Offline players (`status=offline`) must stay separate from R2 infrastructure failures.
    """
    bundle = {
        "reports": {
            "r2_downloads": {
                "rows": [
                    {
                        "eventName": "game_download",
                        "customEvent:game_name": "abalone",
                        "customEvent:status": "started",
                        "customEvent:error_message": "(not set)",
                        "eventCount": 100,
                    },
                    {
                        "eventName": "game_download",
                        "customEvent:game_name": "abalone",
                        "customEvent:status": "completed",
                        "customEvent:error_message": "(not set)",
                        "eventCount": 95,
                    },
                    {
                        "eventName": "game_download",
                        "customEvent:game_name": "abalone",
                        "customEvent:status": "failed",
                        "customEvent:error_message": "SocketTimeoutException",
                        "eventCount": 5,
                    },
                    {
                        "eventName": "game_download",
                        "customEvent:game_name": "abalone",
                        "customEvent:status": "offline",
                        "customEvent:error_message": "NoNetworkConnection",
                        "eventCount": 40,
                    },
                ]
            }
        }
    }
    r2 = GA4Analyzer(bundle).analyze()["gameplay"]["r2_downloads"]
    assert r2["started"] == 100
    assert r2["completed"] == 95
    assert r2["failed"] == 5
    assert r2["offline"] == 40
    assert r2["success_rate_pct"] == 95.0
    assert r2["top_errors"] == [{"error_message": "SocketTimeoutException", "count": 5}]
