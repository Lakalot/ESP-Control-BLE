"""PlatformIO pre-build step: compile src/manifest.yaml → src/manifest_data.h.

Requires Node.js + the tools/manifest workspace (pnpm install) at repo root.
"""
Import("env")  # noqa: F821
from pathlib import Path
import subprocess
import sys
import os

PROJECT = Path(env["PROJECT_DIR"])
REPO = PROJECT.parent.parent
MANIFEST_YAML = PROJECT / "src" / "manifest.yaml"
BUILD_CACHE = PROJECT / "build_cache"
BUILD_CACHE.mkdir(exist_ok=True)
PB_FILE = BUILD_CACHE / "manifest_compiled.pb"
OUT_HEADER = PROJECT / "src" / "manifest_data.h"
SYMBOL_HEADER = PROJECT / "src" / "manifest_symbols.h"
SYMBOL_SOURCE = PROJECT / "src" / "manifest_symbols.cpp"
CLI = REPO / "tools" / "manifest" / "src" / "cli" / "main.ts"


def main():
    if not MANIFEST_YAML.exists():
        print(f"[embed_manifest] missing {MANIFEST_YAML}", file=sys.stderr)
        sys.exit(1)

    print(f"[embed_manifest] compiling {MANIFEST_YAML.name} -> protobuf")
    result = subprocess.run(
        [os.name == "nt" and "npx.cmd" or "npx", "tsx", str(CLI),
         "compile", "--source", str(MANIFEST_YAML), "--out", str(PB_FILE)],
        cwd=str(REPO / "tools" / "manifest"),
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        print(f"[embed_manifest] compile failed:\n{result.stderr}", file=sys.stderr)
        sys.exit(1)
    print(result.stdout.strip())

    data = PB_FILE.read_bytes()
    lines = [
        "// Generated from manifest.yaml - do not edit by hand.",
        "#pragma once",
        "#include <stdint.h>",
        "",
        f"#define MANIFEST_LEN {len(data)}u",
        "extern const uint8_t MANIFEST_DATA[MANIFEST_LEN];",
        "#ifdef MANIFEST_DEFINE_DATA",
        f"const uint8_t MANIFEST_DATA[{len(data)}u] = {{",
    ]
    for i in range(0, len(data), 16):
        chunk = data[i:i + 16]
        lines.append("    " + ",".join(f"0x{b:02x}" for b in chunk) + ",")
    lines.append("};")
    lines.append("#endif")
    OUT_HEADER.write_text("\n".join(lines) + "\n")
    print(f"[embed_manifest] wrote {OUT_HEADER} ({len(data)} bytes)")

    result = subprocess.run(
        [os.name == "nt" and "npx.cmd" or "npx", "tsx", str(CLI),
         "symbols", "--source", str(MANIFEST_YAML),
         "--header-out", str(SYMBOL_HEADER), "--source-out", str(SYMBOL_SOURCE)],
        cwd=str(REPO / "tools" / "manifest"),
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        print(f"[embed_manifest] symbol generation failed:\n{result.stderr}", file=sys.stderr)
        sys.exit(1)
    print(result.stdout.strip())


main()
