import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = resolve(import.meta.dirname, '..', '..', '..');
const FIRMWARE_ROOT = resolve(REPO_ROOT, 'firmware', 'esp32');

describe('firmware manifest ids', () => {
  it('firmware app sources no longer hardcode manifest ids', () => {
    // The publish side of the example app lives in AppRuntime.cpp (the former
    // DeviceActions.cpp); telemetry publishing in DeviceTelemetry.cpp. Both must
    // address resources via the generated manifest_resources:: symbols, never via
    // raw numeric ids.
    const runtime = readFileSync(resolve(FIRMWARE_ROOT, 'app', 'runtime', 'AppRuntime.cpp'), 'utf8');
    const telemetry = readFileSync(resolve(FIRMWARE_ROOT, 'app', 'device', 'DeviceTelemetry.cpp'), 'utf8');

    expect(runtime).not.toMatch(/constexpr\s+uint32_t\s+k\w+Id\s*=/);
    expect(telemetry).not.toMatch(/constexpr\s+uint32_t\s+k\w+Id\s*=/);
    expect(runtime).not.toMatch(/registerAction\(\s*\d+u?\s*,/);
    expect(runtime).not.toMatch(/set(?:Bool|Uint|Int|Float|String)\(\s*\d+u?\s*,/);
    expect(runtime).not.toMatch(/publishDelta\(\s*\d+u?\s*\)/);
    expect(telemetry).not.toMatch(/set(?:Bool|Uint|Int|Float|String)\(\s*\d+u?\s*,/);
    expect(telemetry).not.toMatch(/publishDelta\(\s*\d+u?\s*\)/);

    expect(runtime).toContain('#include "../../src/manifest_symbols.h"');
    expect(telemetry).toContain('#include "../../src/manifest_symbols.h"');

    // Action handlers are registered by computed id (RuntimeUi from device_ui.cpp),
    // so the app no longer references manifest_actions:: at all.
    expect(runtime).not.toMatch(/manifest_actions::/);

    expect(runtime).toContain('manifest_resources::relay_auto');
    expect(runtime).toContain('manifest_resources::light_brightness');
    expect(runtime).toContain('manifest_resources::fan_profile');
    expect(runtime).toContain('manifest_resources::device_debug');
    expect(runtime).toContain('manifest_resources::device_name');
    expect(runtime).toContain('manifest_resources::light_color');

    expect(telemetry).toContain('manifest_resources::env_humidity');
    expect(telemetry).toContain('manifest_resources::env_temperature');
    expect(telemetry).toContain('manifest_resources::system_load');
    expect(telemetry).toContain('manifest_resources::system_uptime');
    expect(telemetry).toContain('manifest_resources::wifi_rssi');
  });
});
