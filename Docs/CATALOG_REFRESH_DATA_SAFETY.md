# Catalog refresh and database preservation

Reviewed on2026-11-18 before preparing the redesigned subscription build for Internal Testing.

## Corrected data-loss path

The former catalog refresh ran on every database open and called `DELETE FROM games`, followed by `INSERT OR REPLACE`. `user_game_stats` and `banners` both reference `games.name` with `ON DELETE CASCADE`. Either deleting or replacing the parent row could erase related scores/favorites/banners.

The refresh now uses Room2.8.5 `@Upsert` for the full game list. Room generates an insert/update adapter and performs the list operation in one transaction. Refresh no longer calls `deleteAll()`. Rows not mentioned by the current catalog batch are retained rather than silently removing their associated user data. The existing shared catalog/install mutex remains in place.

`fallbackToDestructiveMigration(true)` was removed. An unknown database version now requires an explicit migration and fails closed instead of silently dropping data. This does not provide migration support for versions whose schema has not been audited.

## Known v9 schema evidence

- Git HEAD and current `AppDatabase` both declare database version3; entity source schemas have not changed in this update.
- The local signed `Release_APK/GameGateOffline-v9-release.apk` contains `AppDatabase_Impl` using identity hash `e14385a283652817b8af1221b599be50` and legacy hash `49235eea4d0d5cc1998c201beaa05d14`, matching the current generated Room schema.
- Its DEX Room delegate constructor passes database version3; its game/stats/banner SQL definitions match current definitions.
- This source/artifact audit does not by itself prove the state of every installed user's database. In particular, do not invent a2→3 migration or claim older versions are covered. Unknown versions require an audited migration before rollout to those users.

## Regression validation

After running `kspDebugKotlin`, run:

```powershell
python scripts/android/test_catalog_upsert.py
```

The test reads **actual compiler-generated DAO and schema SQL**, then runs it against host SQLite with foreign keys enabled. It verifies that metadata refresh preserves scores, favorites, banners and unrelated game rows, verifies rollback after an invalid batch item, and checks the generated transactional callsite and absence of the destructive seed call.

Result after regenerating Room's debug DAO: **3/3 tests PASS**. The generated adapter is `EntityUpsertAdapter`, with separate `INSERT INTO games` and `UPDATE games ... WHERE name = ?` statements and `performSuspending(..., false, true)` for the list transaction. The test harness deliberately rejects stale generated `INSERT OR REPLACE` output.

The separate audit of the actual Play-installed v9 APK is recorded in `Report/DATABASE_V9_SCHEMA_AUDIT_2026-11-18.md`; it likewise confirms version3 and matching identity/schema. No2→3 migration was invented.

This is host SQLite regression coverage, not an Android migration or device upgrade test. Actual signed-package upgrade testing and verification of older schema versions remain necessary before broader release.
