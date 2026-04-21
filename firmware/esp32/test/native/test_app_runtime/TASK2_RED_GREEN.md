# Task 2 Red/Green Evidence

This note records the Task 2 verification history for the runtime refactor follow-up.

## Red

Command run before the Task 2 review fixes were implemented:

```powershell
py -m platformio test -c platformio_test.ini -e native_v5 -f native/test_app_runtime
```

Observed outcome at that time:

```text
test\native\test_app_runtime.cpp:78:25: error: 'sampleLoadPercent' is not a member of 'app::DeviceTelemetry'
test\native\test_app_runtime.cpp:89:25: error: 'sampleLoadPercent' is not a member of 'app::DeviceTelemetry'
native_v5:native/test_app_runtime [ERRORED]
```

Failure reason: the new Task 2 tests referenced telemetry/runtime behavior that had not been extracted into the app modules yet.

## Green

Verification commands after the fixes:

```powershell
py -m platformio test -c platformio_test.ini -e native_v5 -f native/test_app_runtime
py -m platformio run -e esp32dev
```

Observed outcomes:

```text
native_v5:native/test_app_runtime [PASSED]
6 test cases: 6 succeeded

esp32dev SUCCESS
RAM:   14.4% (used 47124 bytes from 327680 bytes)
Flash: 47.1% (used 616785 bytes from 1310720 bytes)
```
