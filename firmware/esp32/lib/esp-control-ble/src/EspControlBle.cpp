#include "EspControlBle.h"
#include <Arduino.h>
#include <pgmspace.h>

namespace {
void logManifestSummary(const uint8_t* manifestData, uint16_t manifestLen) {
  if (manifestData == nullptr || manifestLen < 1) {
    Serial.printf("[ECB] Manifest invalid len=%u\n", manifestLen);
    return;
  }
  const uint8_t version = pgm_read_byte(manifestData);
  Serial.printf("[ECB] Manifest v%u: %u bytes\n", version, manifestLen);
}
} // namespace

EspControl::EspControl(const char* deviceName, const char* pin)
  : _deviceName(deviceName), _pin(pin) {}

void EspControl::registerCallback(uint8_t cmdId, EcbCommandFn callback) {
  _registry.registerCommand(cmdId, callback);
}

void EspControl::begin(const uint8_t* manifestData, uint16_t manifestLen) {
  _auth.setPin(_pin);
  logManifestSummary(manifestData, manifestLen);
  _transport.begin(_deviceName, &_auth, &_registry, manifestData, manifestLen);
}
