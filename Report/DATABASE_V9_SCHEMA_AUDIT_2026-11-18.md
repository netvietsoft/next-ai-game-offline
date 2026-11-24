# Installed Play v9 database compatibility

Result: the previously pulled original Play A07 APK (`com.nextai.game.offline`, versionCode9, versionName1.2) already uses **Room database version3**, the same identity hash and the same four table schemas as the current application. There is no database-version transition from that v9 installation to the current version3 schema.

## Evidence

- Original Play APK SHA-256: `198819f39b8df46950dab77042d780cce1470bb3d7f30b871b632b6a4a00eed8`.
- Database file: `nextai_games_offline.db` (string exists in the original DEX and current builder).
- Original `AppDatabase_Impl` supplies identity `e14385a283652817b8af1221b599be50` and legacy identity `49235eea4d0d5cc1998c201beaa05d14` to its Room helper. Both match the current KSP-generated implementation.
- All four application table `CREATE TABLE` statements (`games`, `banners`, `user_game_stats`, `offline_games_interstitial`) were compared exactly and match. They also match the local v9 release APK.
- The original Play DEX constructor chain confirms version3: `AppDatabase_Impl.e` creates `L0.k(AppDatabase_Impl)`; that constructor passes3 into `H1.b`; Room helper `t0.u` copies this into its version field; SQLite helper `y0.g` passes that field as the version parameter to `SQLiteOpenHelper`. Compact instruction offsets and SQL are retained in `DATABASE_V9_SCHEMA_EVIDENCE_2026-11-18.json`.
- Current generated implementation directly constructs `RoomOpenDelegate(3, "e14385a283652817b8af1221b599be50", "49235eea4d0d5cc1998c201beaa05d14")`.

## Consequences for the update

- Do not invent a2→3 migration for this A07 v9 installation: the examined installed APK is already schema3.
- Preserving Room schema does not make catalog reseeding safe by itself. `DELETE`/`INSERT OR REPLACE` on `games` can cascade-delete `user_game_stats` and `banners`; the concurrent reviewer is replacing that behavior with upsert and testing child-row preservation.
- `fallbackToDestructiveMigration(true)` is not needed for this matching-schema update and remains dangerous for unknown older versions or future schema changes. Prefer removing the destructive fallback; only add explicit migrations after recovering the actual older schema, and test that migration with populated child rows.
- This proves code/schema compatibility, not that every historic installation has intact data. Unknown older app versions were not certified by this report. A real same-package Play update still requires a device check of existing favorites, scores, downloaded games and preferences without clearing application data.

No device commands, database modifications or application-source changes were performed by this investigation. Inspection used the existing APK artifact, Android build-tools36 `aapt2`/`dexdump`, and the current generated Room implementation.
