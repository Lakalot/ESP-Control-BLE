# Task 1 Naming Regression Evidence

## Red

Filesystem grep, including active untracked files:

```powershell
Get-ChildItem -Recurse "proto","firmware/esp32" -File |
  Where-Object { $_.FullName -notlike "*\.pio\*" -and $_.FullName -notlike "*NO_V5_ARTIFACTS.md" } |
  Select-String -Pattern "manifest_v5|esp_control_v5|MANIFEST_V5"
```

```text
grep: D:\DEV\Amazing\ESP-Control-BLE\firmware\esp32\app\main.cpp
  Line 4: #define MANIFEST_V5_DEFINE_DATA
  Line 5: #include "../src/manifest_v5_data.h"
  Line 25:   runtime.setup(control, actions, telemetry, MANIFEST_V5_DATA, MANIFEST_V5_LEN, temperatureRead());
```

Firmware build before the fix:

```powershell
py -m platformio run -e esp32dev
```

```text
[gen_nanopb] ... --options-file=D:\DEV\Amazing\ESP-Control-BLE\proto\nanopb\manifest.options ... manifest.proto
Following patterns in D:\DEV\Amazing\ESP-Control-BLE\proto\nanopb\manifest.options did not match any fields:
ResourceSnapshot.values, CommonObject.fields, CommonList.items, CommonValue.string_value,
CommonValue.enum_value, InvokeResult.message, Subscribe.resource_ids, Unsubscribe.resource_ids

app/main.cpp:5:10: fatal error: ../src/manifest_v5_data.h: No such file or directory
```

## Green

Filesystem grep after the fix:

```powershell
Get-ChildItem -Recurse "proto","firmware/esp32" -File |
  Where-Object { $_.FullName -notlike "*\.pio\*" -and $_.FullName -notlike "*NO_V5_ARTIFACTS.md" } |
  Select-String -Pattern "manifest_v5|esp_control_v5|MANIFEST_V5" -ErrorAction SilentlyContinue
```

```text
no output
```

Firmware build after the fix:

```powershell
py -m platformio run -e esp32dev
```

```text
[gen_nanopb] ... --options-file=D:\DEV\Amazing\ESP-Control-BLE\proto\nanopb\manifest.options ... manifest.proto
Writing to ...\manifest.pb.h and ...\manifest.pb.c
SUCCESS
```

Targeted native tests after the fix:

```powershell
py -m platformio test -c "platformio_test.ini" -e native_v5 -f native/test_manifest_embed -f native/test_nanopb_generated_decl
```

```text
native/test_manifest_embed         PASSED
native/test_nanopb_generated_decl  PASSED
```
