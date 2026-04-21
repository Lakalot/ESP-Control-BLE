from pathlib import Path
import os
import shutil
import sys

Import("env")


def prepend_native_toolchain_path() -> None:
    toolchain_dir = native_toolchain_dir()
    if toolchain_dir is None:
        return

    path_entries = os.environ.get("PATH", "").split(os.pathsep)
    toolchain_str = str(toolchain_dir)
    if toolchain_str not in path_entries:
        os.environ["PATH"] = os.pathsep.join([toolchain_str] + path_entries)
        env.PrependENVPath("PATH", toolchain_str)


def copy_native_runtime_dlls() -> None:
    toolchain_dir = native_toolchain_dir()
    if toolchain_dir is None:
        return

    build_dir = Path(env.subst("$BUILD_DIR"))
    build_dir.mkdir(parents=True, exist_ok=True)

    for dll_name in ("libgcc_s_dw2-1.dll", "libstdc++-6.dll", "libwinpthread-1.dll"):
        dll_path = toolchain_dir / dll_name
        if dll_path.is_file():
            shutil.copy2(dll_path, build_dir / dll_name)


def native_toolchain_dir():
    if sys.platform != "win32":
        return None

    core_dir = Path(env.subst("$PROJECT_CORE_DIR"))
    toolchain_dir = core_dir / "packages" / "toolchain-gccmingw32" / "bin"
    if toolchain_dir.is_dir():
        return toolchain_dir
    return None
prepend_native_toolchain_path()
copy_native_runtime_dlls()
