#include <Arduino.h>
#include <EspControlBle.h>

#define MANIFEST_DEFINE_DATA
#include "../src/manifest_data.h"

#include "device/DeviceActions.h"
#include "device/DeviceTelemetry.h"
#include "runtime/AppRuntime.h"

namespace {

constexpr uint8_t kLedPin = 2u;

app::AppRuntime runtime;
app::DeviceActions actions(kLedPin);
app::DeviceTelemetry telemetry;
ecb::EspControl control("ESP32-Test", "1234");

}  // namespace

void setup() {
  Serial.begin(115200);
  Serial.println("[App] Starting...");
  runtime.setup(control, actions, telemetry, MANIFEST_DATA, MANIFEST_LEN, temperatureRead());
  Serial.println("[App] Ready (manifest, 2034 bytes)");
}

void loop() {
  runtime.tick(control, telemetry, temperatureRead());
}
