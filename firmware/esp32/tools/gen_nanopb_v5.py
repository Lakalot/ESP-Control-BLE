"""PlatformIO pre-build step: regenerate manifest_v5.pb.h/.c from the repo-root proto files.

Runs via nanopb_generator bundled with the Nanopb PlatformIO library. Output lands in
lib/esp-control-ble/src/nanopb/ and is checked in so native tests can build without
platformio_access to the espressif toolchain.
"""
Import("env")  # noqa: F821  (PlatformIO injects it)
from pathlib import Path
import subprocess
import sys

ROOT = Path(env["PROJECT_DIR"]).resolve().parent.parent
PROTO = ROOT / "proto" / "manifest_v5.proto"
OPTIONS = ROOT / "proto" / "nanopb" / "manifest_v5.options"
OUT_DIR = Path(env["PROJECT_DIR"]) / "lib" / "esp-control-ble" / "src" / "nanopb"

try:
    pkg_dir = env.PioPlatform().get_package_dir("framework-nanopb")
    GENERATOR = Path(pkg_dir) / "generator" / "nanopb_generator.py" if pkg_dir else None
except Exception:
    GENERATOR = None

if not GENERATOR or not GENERATOR.exists():
    GENERATOR = Path(env["PROJECT_DIR"]) / ".pio" / "libdeps" / env.subst("$PIOENV") / "Nanopb" / "generator" / "nanopb_generator.py"

def main():
    if not GENERATOR.exists():
        print(f"[gen_nanopb_v5] generator missing at {GENERATOR}", file=sys.stderr)
        sys.exit(1)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    cmd = [
        sys.executable, str(GENERATOR),
        f"--options-file={OPTIONS}",
        f"--output-dir={OUT_DIR}",
        f"-I{PROTO.parent}",
        str(PROTO.name),
    ]
    print("[gen_nanopb_v5]", " ".join(cmd))
    subprocess.check_call(cmd)

main()
