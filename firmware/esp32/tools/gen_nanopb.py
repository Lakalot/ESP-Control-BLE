"""PlatformIO pre-build step: regenerate manifest.pb.h/.c from the repo-root proto files.

Runs via nanopb_generator bundled with the Nanopb PlatformIO library. Output lands in
lib/esp-control-ble/src/nanopb/ and is checked in so native tests can build without
platformio_access to the espressif toolchain.
"""
Import("env")  # noqa: F821  (PlatformIO injects it)
from pathlib import Path
import subprocess
import sys

ROOT = Path(env["PROJECT_DIR"]).resolve().parent.parent
PROTO = ROOT / "proto" / "manifest.proto"
OPTIONS = ROOT / "proto" / "nanopb" / "manifest.options"
OUT_DIR = Path(env["PROJECT_DIR"]) / "lib" / "esp-control-ble" / "src" / "nanopb"

def find_generator():
    """Locate a runnable nanopb generator.

    Different Nanopb releases ship the generator differently:
      * older: a standalone "nanopb_generator.py" script (run directly)
      * newer (CMake/pip layout): a "nanopb_generator" package directory
        (run as `python -m nanopb_generator`)
    The bare "nanopb_generator" launcher stub cannot be run directly because it
    does `from nanopb_generator import *` without the package on sys.path, so we
    skip it in favour of the package module form.

    Returns a command-prefix list (without the generator arguments), or None.
    """
    candidate_dirs = []
    try:
        pkg_dir = env.PioPlatform().get_package_dir("framework-nanopb")
        if pkg_dir:
            candidate_dirs.append(Path(pkg_dir) / "generator")
    except Exception:
        pass
    candidate_dirs.append(
        Path(env["PROJECT_DIR"]) / ".pio" / "libdeps" / env.subst("$PIOENV") / "Nanopb" / "generator"
    )
    for d in candidate_dirs:
        script = d / "nanopb_generator.py"
        if script.is_file():
            return [sys.executable, str(script)]
        package = d / "nanopb_generator" / "__init__.py"
        if package.is_file():
            return [sys.executable, "-m", "nanopb_generator", "-D", str(d)]
    return None


GENERATOR_CMD = find_generator()


def main():
    if GENERATOR_CMD is None:
        # The generated manifest.pb.{h,c} are checked in, so a missing generator
        # is not fatal: skip regeneration and build against the committed output.
        print(
            "[gen_nanopb] generator not found; using checked-in nanopb output",
            file=sys.stderr,
        )
        return
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    cmd = GENERATOR_CMD + [
        f"--options-file={OPTIONS}",
        f"--output-dir={OUT_DIR}",
        f"-I{PROTO.parent}",
        str(PROTO.name),
    ]
    print("[gen_nanopb]", " ".join(cmd))
    try:
        subprocess.check_call(cmd)
    except subprocess.CalledProcessError as exc:
        # Fall back to the checked-in output rather than breaking the build when
        # the generator is present but not runnable in this environment.
        print(
            f"[gen_nanopb] generator failed ({exc}); using checked-in nanopb output",
            file=sys.stderr,
        )

main()
