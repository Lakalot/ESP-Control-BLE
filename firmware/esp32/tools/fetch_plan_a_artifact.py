"""Download the latest manifest_v5_demo.pb from the Plan A CI artifact cache.

Falls back to the checked-in tiny fixture when offline or when run in the
native test env so native tests stay deterministic.
"""
Import("env")  # noqa: F821
from pathlib import Path
import os
import shutil
import sys
import urllib.request

PROJECT = Path(env["PROJECT_DIR"])
CACHE = PROJECT / "build_cache"
CACHE.mkdir(exist_ok=True)
TARGET = CACHE / "manifest_v5_demo.pb"
FIXTURE = PROJECT / "test" / "native" / "fixtures" / "manifest_v5_tiny.pb"
URL = os.environ.get("MANIFEST_V5_ARTIFACT_URL", "")

def fetch():
    if env.subst("$PIOENV") == "native_v5":
        shutil.copyfile(FIXTURE, TARGET)
        print(f"[fetch_plan_a_artifact] native env -> copied fixture into {TARGET}")
        return
    if not URL:
        if not TARGET.exists():
            shutil.copyfile(FIXTURE, TARGET)
            print("[fetch_plan_a_artifact] MANIFEST_V5_ARTIFACT_URL not set -> fixture fallback")
        return
    print(f"[fetch_plan_a_artifact] downloading {URL} -> {TARGET}")
    with urllib.request.urlopen(URL) as resp, open(TARGET, "wb") as out:
        shutil.copyfileobj(resp, out)

fetch()