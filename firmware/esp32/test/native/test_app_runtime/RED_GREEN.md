# Task 1 Red/Green Evidence

This note records the Task 1 verification history for the `PublishScheduler` test.

## Red

Command run before the app skeleton existed:

```powershell
& "C:\Users\pailh\.platformio\packages\toolchain-gccmingw32\bin\g++.exe" -std=gnu++17 -DUNIT_TEST -I".pio\libdeps\native\Unity\src" -c "test\native\test_app_runtime.cpp" -o ".pio\test_app_runtime.o"; Write-Output "EXIT:$LASTEXITCODE"
```

Observed outcome at that time:

```text
EXIT:1
```

Failure reason: the new scheduler test referenced the Task 1 skeleton path `app/runtime/PublishScheduler.h`, which did not exist yet.

## Green

Current verification command:

```powershell
py -m platformio test -c platformio_test.ini -e native_v5 -f native/test_app_runtime
```

Current outcome:

```text
test\native\test_app_runtime\test_main.cpp:11: test_publish_scheduler_gates_until_interval_elapsed [PASSED]
test\native\test_app_runtime\test_main.cpp:12: test_publish_scheduler_handles_millis_wraparound [PASSED]
2 test cases: 2 succeeded
```
