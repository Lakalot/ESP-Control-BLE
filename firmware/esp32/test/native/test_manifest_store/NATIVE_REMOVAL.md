## Native Duplicate Removal Check

Red-phase reference scan command:

```bash
git grep -n "esp-control-ble""-native\|EspControlBle""Native" -- firmware/esp32
```

Expected before cleanup: one or more matches from config, tooling, or the duplicate library tree.

Current local verification for Task 1:

- The scan above is already green in this workspace.
- `git status --short` still shows the `firmware/esp32/lib/esp-control-ble` + `-native/` tree as deleted, which is the remaining local evidence that the duplicate library removal is already in progress.
- `firmware/esp32/platformio.ini`, `firmware/esp32/platformio_test.ini`, and `firmware/esp32/.vscode/c_cpp_properties.json` contain no `esp-control-ble` + `-native` references.

Green verification commands:

```bash
git grep -n "esp-control-ble""-native\|EspControlBle""Native" -- firmware/esp32
py -m platformio test -c "platformio_test.ini" -e native_v5 -f native/test_manifest_store -f native/test_ble_transport_runtime
```
