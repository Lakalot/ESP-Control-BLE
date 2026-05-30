#include <Arduino.h>
#include <EspControlBle.h>

#define MANIFEST_DEFINE_DATA
#include "../src/manifest_data.h"

#include "device/DeviceTelemetry.h"
#include "runtime/AppRuntime.h"

namespace {

app::AppRuntime runtime;
app::DeviceTelemetry telemetry;
EspControl control("ESP32-Test", "1234");

}  // namespace

void setup() {
  Serial.begin(115200);
  Serial.println("[App] Starting...");
  runtime.setup(control, telemetry, MANIFEST_DATA, MANIFEST_LEN, temperatureRead());
  Serial.printf("[App] Ready (manifest, %u bytes)\n", (unsigned)MANIFEST_LEN);
}

void loop() {
  runtime.tick(control, telemetry, temperatureRead());
}
