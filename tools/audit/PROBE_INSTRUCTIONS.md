# Runtime Probe — User Instructions

The probe instruments the firmware with heap + stack logging so the audit
report can include real-device runtime numbers (free heap, stack high-water
marks, heap fragmentation). Instrumentation lives on a **separate branch**
(`audit/probe-runtime`) and is **never merged** into `master`. After the
probe data has been captured, the branch is discarded.

## Prerequisites

- ESP32 board flashed and reachable via USB
- Mobile app installed on phone
- `pio` CLI working: try `pio --version`. If not on PATH, use the full path
  `C:\Users\<user>\.platformio\penv\Scripts\pio.exe` (Windows).

## Steps

### 1. Check out the probe branch

```powershell
git fetch origin
git checkout audit/probe-runtime
```

If `git fetch` errors because the remote does not have the branch, that is
fine — the probe branch is created locally by the audit pipeline (Task 9
of `docs/superpowers/plans/2026-04-24-esp-control-ble-audit.md`). It does
not need to be pushed.

### 2. Build and flash

```powershell
cd firmware/esp32
pio run -e esp32dev -t upload
```

Or with the full path:

```powershell
& "$env:USERPROFILE\.platformio\penv\Scripts\pio.exe" run -e esp32dev -t upload
```

The build emits the same firmware as `master` plus the probe `printf`s.
Expect a small `.text` and `.bss` overhead from the instrumentation.

### 3. Start the serial monitor

```powershell
pio device monitor
```

(or `& $pio device monitor` with the variable from step 2.)

Keep the monitor running. After boot you should see three labelled
checkpoints intermixed with normal logs:

```
[PROBE] post-setup: free=<N> minfree=<N>
[PROBE] post-ble-connected: free=<N> minfree=<N>
[PROBE] post-manifest-sent: free=<N> minfree=<N>
[PROBE] stack loop hwm=<N>
[PROBE] heap_caps_8bit:
  ... (heap_caps_print_heap_info output)
```

The first checkpoint is reached as soon as `setup()` completes. The
ble-connected and manifest-sent checkpoints fire when you connect the
mobile app — they are the values that matter for "RAM in use during a real
session".

### 4. Connect the mobile app

- Open the app on your phone
- Scan for `ESP32-Test` (default device name) and connect
- Enter PIN `1234`
- Wait ~10 seconds after the dashboard renders so the stack loop has time
  to hit a high-water mark

The monitor should now show all three `[PROBE]` checkpoint lines plus at
least one `stack` and one `heap_caps_8bit` block.

### 5. Copy the serial output

Paste the **entire** monitor log (from boot to ~10 seconds after dashboard)
into the audit conversation as a fenced code block. The agent integrates
the numbers into the audit report (§3 pass 2 + §8.2 raw logs).

### 6. Clean up

Switch back to the audit main branch when done:

```powershell
git checkout audit/esp-control-ble-lib
```

The `audit/probe-runtime` branch stays in your local repo as a record but
is not merged. You may delete it after the audit closes:

```powershell
git branch -D audit/probe-runtime
```

## What to do if a checkpoint never fires

- **`post-setup` missing:** `setup()` itself is failing — open an issue;
  the probe added nothing that should break setup.
- **`post-ble-connected` missing:** the mobile app did not connect.
  Confirm BLE is on, app sees `ESP32-Test`, PIN is `1234`.
- **`post-manifest-sent` missing:** authentication probably failed or the
  app disconnected during manifest streaming. Reconnect; if persistent,
  the issue is unrelated to the probe.
- **`stack loop hwm` not appearing:** the loop probe fires once every
  5 seconds; ensure the monitor has been running long enough.
