from pathlib import Path
import os
import shutil
import sys

Import("env")


def prepend_native_toolchain_path() -> None:
    toolchain_bin = _toolchain_bin_dir()
    if toolchain_bin is None:
        return

    path_entries = os.environ.get("PATH", "").split(os.pathsep)
    toolchain_str = str(toolchain_bin)
    if toolchain_str not in path_entries:
        os.environ["PATH"] = os.pathsep.join([toolchain_str] + path_entries)
        env.PrependENVPath("PATH", toolchain_str)


def copy_native_runtime_dlls() -> None:
    if sys.platform != "win32":
        return

    build_dir = Path(env.subst("$BUILD_DIR"))
    build_dir.mkdir(parents=True, exist_ok=True)

    for dll_name in ("libgcc_s_dw2-1.dll", "libstdc++-6.dll", "libwinpthread-1.dll"):
        dll_path = _find_dll(dll_name)
        if dll_path is not None:
            shutil.copy2(dll_path, build_dir / dll_name)


def _toolchain_bin_dir():
    if sys.platform != "win32":
        return None

    core_dir = Path(env.subst("$PROJECT_CORE_DIR"))
    toolchain_bin = core_dir / "packages" / "toolchain-gccmingw32" / "bin"
    return toolchain_bin if toolchain_bin.is_dir() else None


def _find_dll(dll_name: str):
    """Search for a DLL in the toolchain bin/ and i686-w64-mingw32/lib/ directories."""
    core_dir = Path(env.subst("$PROJECT_CORE_DIR"))
    pkg_root = core_dir / "packages" / "toolchain-gccmingw32"

    candidates = [
        pkg_root / "bin" / dll_name,
        pkg_root / "i686-w64-mingw32" / "lib" / dll_name,
    ]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return None


prepend_native_toolchain_path()
copy_native_runtime_dlls()
