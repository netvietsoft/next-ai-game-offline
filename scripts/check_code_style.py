#!/usr/bin/env python3
"""
Cổng kiểm tra phong cách mã nguồn chống Vibe Code theo Luật Cứng Mục 2 trong AGENTS.md.
Offline anti-vibe-code style gate enforcing AGENTS.md Section 2 on Kotlin and TypeScript files.

Kiểm tra / Checks:
1. Cấm nén nhiều câu lệnh trên 1 dòng bằng dấu `;` (Kotlin).
2. Độ dài dòng tối đa 120 ký tự (bỏ qua dòng URL/comment/chuỗi tài nguyên hoặc JS nội tuyến).
3. Kích thước file mục tiêu <= 350 dòng (có tùy chọn --max-lines).
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SEMICOLON_STMT_RE = re.compile(r";\s*\S")
EXEMPT_LINE_RE = re.compile(
    r"^\s*(//|\*|/\*|import |package )|https?://|c3_callFunction|clearLocalStorage|"
    r"evaluateJavascript|window\.|document\.|console\.|function\s*\(|"
    r"default-src|script-src|style-src|base-uri|@Query\("
)


def strip_quoted_strings(line: str) -> str:
    """Loại bỏ nội dung chuỗi trong nháy kép để tránh báo nhầm dấu `;` trong string."""
    return re.sub(r'"(?:\\.|[^"\\])*"', '""', line)


def check_file(path: Path, max_lines: int, max_line_length: int) -> list[str]:
    """Kiểm tra một tệp mã nguồn và trả về danh sách lỗi vi phạm."""
    violations: list[str] = []
    lines = path.read_text(encoding="utf-8").splitlines()
    is_kotlin = path.suffix == ".kt"

    if len(lines) > max_lines:
        violations.append(
            f"{path}: file has {len(lines)} lines (limit {max_lines})"
        )

    in_multiline_string = False
    for line_no, raw_line in enumerate(lines, start=1):
        triple_count = raw_line.count('"""')
        if triple_count % 2 == 1:
            in_multiline_string = not in_multiline_string
            continue
        if in_multiline_string:
            continue

        stripped = raw_line.strip()
        if not stripped or EXEMPT_LINE_RE.search(raw_line):
            continue

        if is_kotlin:
            code_only = strip_quoted_strings(raw_line.split("//", 1)[0])
            if SEMICOLON_STMT_RE.search(code_only):
                violations.append(
                    f"{path}:{line_no}: semicolon-crammed multi-statement line: {stripped[:90]}"
                )

        if len(raw_line) > max_line_length:
            violations.append(
                f"{path}:{line_no}: line length {len(raw_line)} exceeds {max_line_length}"
            )

    return violations


def main() -> int:
    parser = argparse.ArgumentParser(description="Anti-vibe-code style gate (AGENTS.md Section 2)")
    parser.add_argument("paths", nargs="+", help="Files or directories to check")
    parser.add_argument("--max-lines", type=int, default=350, help="Max lines per file (default: 350)")
    parser.add_argument("--max-col", type=int, default=120, help="Max characters per line (default: 120)")
    args = parser.parse_args()

    files: list[Path] = []
    for raw in args.paths:
        target = Path(raw)
        if target.is_file():
            files.append(target)
        elif target.is_dir():
            for ext in ("*.kt", "*.ts"):
                files.extend(sorted(target.rglob(ext)))

    all_violations: list[str] = []
    for file_path in files:
        all_violations.extend(check_file(file_path, args.max_lines, args.max_col))

    if all_violations:
        for item in all_violations:
            print(f"[FAIL] {item}")
        print(f"\nTotal violations: {len(all_violations)}")
        return 1

    print(f"[PASS] Checked {len(files)} file(s) with 0 style violations.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
