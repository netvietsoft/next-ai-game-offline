#!/usr/bin/env python3
"""Kiểm tra PT_LOAD ELF >= 16 KB trong APK/AAB. / Check ELF PT_LOAD >= 16 KB."""

from __future__ import annotations

import struct
import sys
import zipfile
from pathlib import Path


def load_alignments(binary: bytes) -> list[int]:
    """Đọc p_align của PT_LOAD. / Read p_align values for PT_LOAD program headers."""
    if binary[:4] != b"\x7fELF":
        raise ValueError("not an ELF file")
    elf_class = binary[4]
    byte_order = binary[5]
    endian = "<" if byte_order == 1 else ">" if byte_order == 2 else None
    if endian is None:
        raise ValueError("unsupported ELF byte order")
    if elf_class == 1:
        phoff = struct.unpack_from(endian + "I", binary, 28)[0]
        phentsize = struct.unpack_from(endian + "H", binary, 42)[0]
        phnum = struct.unpack_from(endian + "H", binary, 44)[0]
        align_offset, align_format = 28, "I"
    elif elf_class == 2:
        phoff = struct.unpack_from(endian + "Q", binary, 32)[0]
        phentsize = struct.unpack_from(endian + "H", binary, 54)[0]
        phnum = struct.unpack_from(endian + "H", binary, 56)[0]
        align_offset, align_format = 48, "Q"
    else:
        raise ValueError("unsupported ELF class")

    alignments: list[int] = []
    for index in range(phnum):
        header = phoff + index * phentsize
        program_type = struct.unpack_from(endian + "I", binary, header)[0]
        if program_type == 1:  # PT_LOAD
            alignments.append(
                struct.unpack_from(endian + align_format, binary, header + align_offset)[0]
            )
    return alignments


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: check_elf_alignment.py <apk-or-aab>", file=sys.stderr)
        return 2
    archive_path = Path(sys.argv[1]).resolve()
    failures = 0
    with zipfile.ZipFile(archive_path) as archive:
        libraries = sorted(name for name in archive.namelist() if name.endswith(".so"))
        print(f"native_so_count={len(libraries)}")
        for name in libraries:
            alignments = load_alignments(archive.read(name))
            minimum = min(alignments) if alignments else 0
            passed = bool(alignments) and minimum >= 0x4000
            print(f"{name}: min_pt_load_align=0x{minimum:x} {'PASS' if passed else 'FAIL'}")
            failures += 0 if passed else 1
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
