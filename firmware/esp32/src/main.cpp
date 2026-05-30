#include <Arduino.h>
#include <esp_timer.h>
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

// Loop-load tracking: accumulate busy microseconds over a window, divide by the
// window's wall-clock to get a 0..100% busy ratio (the vTaskDelay is idle time).
int64_t  g_windowStartUs = 0;
uint64_t g_windowBusyUs  = 0;
uint32_t computeLoadPercent(int64_t nowUs) {
  const int64_t elapsed = nowUs - g_windowStartUs;
  if (elapsed <= 0) return 0u;
  uint32_t pct = (uint32_t)((g_windowBusyUs * 100ULL) / (uint64_t)elapsed);
  if (pct > 100u) pct = 100u;
  g_windowStartUs = nowUs;
  g_windowBusyUs = 0;
  return pct;
}

}  // namespace

void setup() {
  Serial.begin(115200);
  Serial.println("[App] Starting...");
  // Build the single UI description with RuntimeUi (seeds resources, registers the
  // typed handlers), then begin() with the embedded manifest the host emitter wrote.
  control.beginUi(buildUi, MANIFEST_DATA, MANIFEST_LEN);
  g_windowStartUs = esp_timer_get_time();  // start the loop-load measurement window
  Serial.printf("[App] Ready (manifest, %u bytes)\n", (unsigned)MANIFEST_LEN);
}

void loop() {
  const int64_t loopStartUs = esp_timer_get_time();
  control.tick();

  const uint32_t now = millis();
  // The constants below (humidity/rssi) are demo placeholders -- replace each with a
  // real sensor read. temperatureRead() is the ESP32's on-die temperature.
  if (tempSched.shouldPublish(now)) {
    dev::temperature.set(temperatureRead());
    dev::humidity.set(45.0f);  // demo placeholder -- replace with a real sensor read
  }
  if (loadSched.shouldPublish(now)) {
    dev::rssi.set(-58);        // demo placeholder -- replace with a real WiFi.RSSI()
    dev::uptime.set(now);
    dev::load.set(computeLoadPercent(esp_timer_get_time()));  // real loop-load %
  }

  // Account the busy time of THIS loop iteration, then idle (the vTaskDelay below is
  // counted as idle -- it is NOT included in g_windowBusyUs).
  g_windowBusyUs += (uint64_t)(esp_timer_get_time() - loopStartUs);
  vTaskDelay(pdMS_TO_TICKS(50));
}
