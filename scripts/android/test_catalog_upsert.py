"""Kiểm tra SQL Room sinh ra cho @Upsert và Migration v3 -> v4 bảo toàn 100% dữ liệu người chơi.
Tests Room-generated @Upsert SQL and verifies real SQLite v3 -> v4 schema migration data safety.

Run after :kspDebugKotlin. This exercises generated SQL against host SQLite with
foreign keys enabled; it is not a substitute for Android device tests.
"""
from pathlib import Path
import json
import re
import sqlite3
import unittest


ROOT = Path(__file__).resolve().parents[2]
GENERATED = ROOT / "Android/build/generated/ksp/debug/kotlin/com/nextai/gameoffline/data/local"
MIGRATIONS_KT = ROOT / "Android/src/main/java/com/nextai/gameoffline/data/local/DatabaseMigrations.kt"


def quoted_strings(pattern: str, source: str) -> list[str]:
    """Đọc SQL literal mà không eval mã Kotlin / Decode SQL literals without evaluating Kotlin."""
    return [json.loads('"' + value + '"') for value in re.findall(pattern, source)]


class CatalogUpsertTest(unittest.TestCase):
    """Dùng schema v4 và query do compiler sinh / Use compiler-generated v4 schema and queries."""

    @classmethod
    def setUpClass(cls):
        """Yêu cầu generated code mới, không tự dựng query upsert."""
        dao = (GENERATED / "dao/GamesDao_Impl.kt").read_text(encoding="utf-8-sig")
        database = (GENERATED / "AppDatabase_Impl.kt").read_text(encoding="utf-8-sig")
        if "EntityUpsertAdapter" not in dao:
            raise AssertionError("Run kspDebugKotlin first; DAO must be generated from @Upsert")
        cls.schema = [
            sql
            for sql in quoted_strings(r'connection\.execSQL\("((?:\\.|[^"\\])*)"\)', database)
            if sql.startswith("CREATE TABLE")
        ]
        queries = quoted_strings(r'createQuery\(\): String = "((?:\\.|[^"\\])*)"', dao)
        cls.insert_sql = next(sql for sql in queries if sql.startswith("INSERT") and "`games`" in sql)
        cls.update_sql = next(sql for sql in queries if sql.startswith("UPDATE") and "`games`" in sql)
        if "REPLACE" in cls.insert_sql:
            raise AssertionError("REPLACE would cascade-delete user stats")
        cls.insert_columns = re.findall(r"`([^`]+)`", cls.insert_sql.split("VALUES", 1)[0])[1:]
        assignment, where = cls.update_sql.split(" SET ", 1)[1].split(" WHERE ", 1)
        cls.update_columns = re.findall(r"`([^`]+)`\s*=\s*\?", assignment)
        cls.where_columns = re.findall(r"`([^`]+)`\s*=\s*\?", where)
        cls.generated_dao = dao

    def setUp(self):
        """Bật FK như Room và nạp schema thật / Enable Room-style FKs using generated v4 schema."""
        self.db = sqlite3.connect(":memory:")
        self.db.execute("PRAGMA foreign_keys=ON")
        for sql in self.schema:
            self.db.execute(sql)
        self.columns = {row[1]: row for row in self.db.execute("PRAGMA table_info(games)")}

    def tearDown(self):
        self.db.close()

    def game(self, name: str, title: str = "Original title") -> dict:
        values = {}
        for column in self.insert_columns:
            _, _, affinity, _, default, _ = self.columns[column]
            if default is None:
                values[column] = None
            elif affinity == "INTEGER":
                values[column] = int(default)
            elif affinity == "REAL":
                values[column] = float(default)
            else:
                values[column] = default.strip("'")
        values.update(name=name, title=title, category="Puzzle", position=1)
        return values

    def upsert(self, value: dict):
        try:
            self.db.execute(self.insert_sql, [value[column] for column in self.insert_columns])
        except sqlite3.IntegrityError as error:
            if error.sqlite_errorcode not in (
                sqlite3.SQLITE_CONSTRAINT_PRIMARYKEY,
                sqlite3.SQLITE_CONSTRAINT_UNIQUE,
            ):
                raise
            self.db.execute(
                self.update_sql,
                [value[column] for column in self.update_columns + self.where_columns],
            )

    def seed_stats(self, name: str, score: int):
        """Tạo điểm/yêu thích/open_count/highest_level có khóa ngoại tới bảng games."""
        self.upsert(self.game(name))
        self.db.execute(
            "INSERT INTO user_game_stats"
            "(game_name, high_score, games_played, total_time_spent_sec, is_favorite, "
            "last_played, open_count, highest_level) VALUES(?,?,?,?,?,?,?,?)",
            (name, score, 7, 1200, 1, 123456789, 5, 9),
        )
        self.db.commit()

    def test_refresh_preserves_stats_favorites_and_unlisted_game(self):
        """Đổi metadata không xóa dữ liệu chơi hoặc game ngoài batch."""
        self.seed_stats("retained_game", 900)
        self.seed_stats("not_in_current_batch", 700)
        before_stats = self.db.execute("SELECT * FROM user_game_stats ORDER BY game_name").fetchall()
        with self.db:
            self.upsert(self.game("retained_game", "Updated catalog title"))
            self.upsert(self.game("new_game", "New catalog item"))
        self.assertEqual(
            before_stats,
            self.db.execute("SELECT * FROM user_game_stats ORDER BY game_name").fetchall(),
        )
        self.assertEqual(
            ("Updated catalog title",),
            self.db.execute("SELECT title FROM games WHERE name='retained_game'").fetchone(),
        )
        self.assertEqual(3, self.db.execute("SELECT count(*) FROM games").fetchone()[0])

    def test_failed_batch_rolls_back_without_losing_user_data(self):
        """Lỗi batch rollback cập nhật trước đó."""
        self.seed_stats("retained_game", 900)
        invalid = self.game("invalid_game")
        invalid["title"] = None
        with self.assertRaises(sqlite3.IntegrityError):
            with self.db:
                self.upsert(self.game("retained_game", "Must roll back"))
                self.upsert(invalid)
        self.assertEqual(
            ("Original title",),
            self.db.execute("SELECT title FROM games WHERE name='retained_game'").fetchone(),
        )
        self.assertEqual(
            (900, 1, 5, 9),
            self.db.execute(
                "SELECT high_score, is_favorite, open_count, highest_level "
                "FROM user_game_stats WHERE game_name='retained_game'"
            ).fetchone(),
        )

    def test_generated_batch_is_transactional_and_refresh_never_deletes(self):
        """Kiểm tra callsite thật và cờ transaction Room."""
        self.assertRegex(
            self.generated_dao,
            r"insertAll\(games: List<GameEntity>\).*?performSuspending\(__db, false, true\)",
        )
        self.assertIn(".upsert(", self.generated_dao)
        source = (
            ROOT / "Android/src/main/java/com/nextai/gameoffline/data/local/AppDatabase.kt"
        ).read_text(encoding="utf-8-sig")
        self.assertNotIn("gamesDao.deleteAll()", source)
        self.assertIn("gamesDao.insertAll(gamesList)", source)

    def test_migration_3_to_4_preserves_v3_user_stats_and_drops_dead_tables(self):
        """Xác minh SQL MIGRATION_3_4 nâng cấp từ schema v3 thật mà không mất dữ liệu người chơi."""
        migrations_src = MIGRATIONS_KT.read_text(encoding="utf-8-sig")
        statements = quoted_strings(r'"((?:ALTER TABLE|DROP TABLE)[^"]+)"', migrations_src)
        self.assertGreaterEqual(len(statements), 4)

        v3_db = sqlite3.connect(":memory:")
        try:
            v3_db.execute("PRAGMA foreign_keys=ON")
            v3_db.execute("CREATE TABLE games (name TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL)")
            v3_db.execute(
                "CREATE TABLE user_game_stats ("
                "game_name TEXT PRIMARY KEY NOT NULL, "
                "high_score INTEGER NOT NULL DEFAULT 0, "
                "games_played INTEGER NOT NULL DEFAULT 0, "
                "total_time_spent_sec INTEGER NOT NULL DEFAULT 0, "
                "is_favorite INTEGER NOT NULL DEFAULT 0, "
                "last_played INTEGER NOT NULL, "
                "FOREIGN KEY(game_name) REFERENCES games(name) ON DELETE CASCADE)"
            )
            v3_db.execute("CREATE TABLE banners (id INTEGER PRIMARY KEY AUTOINCREMENT, gameId TEXT)")
            v3_db.execute("CREATE TABLE offline_ads (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)")

            v3_db.execute("INSERT INTO games VALUES ('chess', 'Chess Master')")
            v3_db.execute(
                "INSERT INTO user_game_stats VALUES ('chess', 1500, 12, 3400, 1, 1700000000)"
            )
            v3_db.execute("INSERT INTO banners(gameId) VALUES ('chess')")
            v3_db.execute("INSERT INTO offline_ads(name) VALUES ('legacy_ad')")

            for sql in statements:
                v3_db.execute(sql)

            tables = {
                row[0]
                for row in v3_db.execute("SELECT name FROM sqlite_master WHERE type='table'")
            }
            self.assertNotIn("banners", tables)
            self.assertNotIn("offline_ads", tables)
            self.assertIn("user_game_stats", tables)

            row = v3_db.execute(
                "SELECT high_score, games_played, total_time_spent_sec, is_favorite, "
                "open_count, highest_level FROM user_game_stats WHERE game_name='chess'"
            ).fetchone()
            self.assertEqual((1500, 12, 3400, 1, 0, 1), row)
        finally:
            v3_db.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
