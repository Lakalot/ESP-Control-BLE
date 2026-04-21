"""Emit src/manifest_data.h from build_cache/manifest_demo.pb."""
Import("env")  # noqa: F821
from pathlib import Path
import sys

PROJECT = Path(env["PROJECT_DIR"])
SRC = PROJECT / "build_cache" / "manifest_demo.pb"
OUT = PROJECT / "src" / "manifest_data.h"

def emit():
    if not SRC.exists():
        print(f"[embed_manifest] missing {SRC}", file=sys.stderr)
        sys.exit(1)
    data = SRC.read_bytes()
    lines = ["// Generated from manifest_demo.pb - do not edit by hand.",
             "#pragma once",
             "#include <stdint.h>",
             "",
             f"#define MANIFEST_LEN {len(data)}u",
             "extern const uint8_t MANIFEST_DATA[MANIFEST_LEN];",
             "#ifdef MANIFEST_DEFINE_DATA",
             f"const uint8_t MANIFEST_DATA[{len(data)}u] = {{"]
    for i in range(0, len(data), 16):
        chunk = data[i:i+16]
        lines.append("    " + ",".join(f"0x{b:02x}" for b in chunk) + ",")
    lines.append("};")
    lines.append("#endif")
    OUT.write_text("\n".join(lines) + "\n")
    print(f"[embed_manifest] wrote {OUT} ({len(data)} bytes)")

emit()
