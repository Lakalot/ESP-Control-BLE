#include <Arduino.h>
#include <EspControlBle.h>

#define MANIFEST_DEFINE_DATA
#include "generated/manifest_data.h"

#include "device_ui.h"
#include "PublishScheduler.h"

namespace {

EspControl control("ESP32-Test", "1234");

// Telemetry publish cadence (see device_ui.cpp for the resources these feed).
app::PublishScheduler tempSched(2000u);
app::PublishScheduler loadSched(1000u);

}  // namespace

void setup() {
  Serial.begin(115200);
  Serial.println("[App] Starting...");
  // Build the single UI description with RuntimeUi (seeds resources, registers the
  // typed handlers), then begin() with the embedded manifest the host emitter wrote.
  control.beginUi(buildUi, MANIFEST_DATA, MANIFEST_LEN);
  Serial.printf("[App] Ready (manifest, %u bytes)\n", (unsigned)MANIFEST_LEN);
}

void loop() {
  control.tick();

  const uint32_t now = millis();
  // The constants below (humidity/rssi/load) are demo placeholders -- replace each
  // with a real sensor read. temperatureRead() is the ESP32's on-die temperature.
  if (tempSched.shouldPublish(now)) {
    dev::temperature.set(temperatureRead());
    dev::humidity.set(45.0f);  // demo placeholder -- replace with a real sensor read
  }
  if (loadSched.shouldPublish(now)) {
    dev::rssi.set(-58);        // demo placeholder -- replace with a real WiFi.RSSI()
    dev::uptime.set(now);
    dev::load.set(0u);         // demo placeholder -- replace with a real load metric
  }

  vTaskDelay(pdMS_TO_TICKS(50));
}
