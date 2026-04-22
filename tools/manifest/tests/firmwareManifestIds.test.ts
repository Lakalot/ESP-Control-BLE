import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = resolve(import.meta.dirname, '..', '..', '..');
const FIRMWARE_ROOT = resolve(REPO_ROOT, 'firmware', 'esp32');

describe('firmware manifest ids', () => {
  it('firmware app sources no longer hardcode manifest ids', () => {
    const actions = readFileSync(resolve(FIRMWARE_ROOT, 'app', 'device', 'DeviceActions.cpp'), 'utf8');
    const telemetry = readFileSync(resolve(FIRMWARE_ROOT, 'app', 'device', 'DeviceTelemetry.cpp'), 'utf8');

    expect(actions).not.toMatch(/constexpr\s+uint32_t\s+k\w+Id\s*=/);
    expect(telemetry).not.toMatch(/constexpr\s+uint32_t\s+k\w+Id\s*=/);
    expect(actions).not.toMatch(/registerAction\(\s*\d+u?\s*,/);
    expect(actions).not.toMatch(/set(?:Bool|Uint|Int|Float|String)\(\s*\d+u?\s*,/);
    expect(actions).not.toMatch(/publishDelta\(\s*\d+u?\s*\)/);
    expect(telemetry).not.toMatch(/set(?:Bool|Uint|Int|Float|String)\(\s*\d+u?\s*,/);
    expect(telemetry).not.toMatch(/publishDelta\(\s*\d+u?\s*\)/);

    expect(actions).toContain('#include "../../src/manifest_symbols.h"');
    expect(telemetry).toContain('#include "../../src/manifest_symbols.h"');

    expect(actions).toContain('manifest_actions::relay_toggle');
    expect(actions).toContain('manifest_actions::light_set_brightness');
    expect(actions).toContain('manifest_actions::fan_set_profile');
    expect(actions).toContain('manifest_actions::device_set_debug');
    expect(actions).toContain('manifest_actions::device_rename');
    expect(actions).toContain('manifest_actions::light_set_color');
    expect(actions).toContain('manifest_actions::system_factory_reset');
    expect(actions).toContain('manifest_actions::system_restart');

    expect(actions).toContain('manifest_resources::relay_auto');
    expect(actions).toContain('manifest_resources::light_brightness');
    expect(actions).toContain('manifest_resources::fan_profile');
    expect(actions).toContain('manifest_resources::device_debug');
    expect(actions).toContain('manifest_resources::device_name');
    expect(actions).toContain('manifest_resources::light_color');

    expect(telemetry).toContain('manifest_resources::env_humidity');
    expect(telemetry).toContain('manifest_resources::env_temperature');
    expect(telemetry).toContain('manifest_resources::system_load');
    expect(telemetry).toContain('manifest_resources::system_uptime');
    expect(telemetry).toContain('manifest_resources::wifi_rssi');
  });
});
