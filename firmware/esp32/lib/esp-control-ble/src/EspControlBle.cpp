#include "EspControlBle.h"
#include "protocol/ManifestStore.h"
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
  : _deviceName(deviceName), _pin(pin), _transportV5(nullptr) {}

void EspControl::registerCallback(uint8_t cmdId, EcbCommandFn callback) {
  _registry.registerCommand(cmdId, callback);
}

void EspControl::registerActionV5(uint32_t actionId, ecb::v5::ActionHandler h) { _registryV5.registerAction(actionId, h); }
void EspControl::publishDelta(uint32_t resourceId) { if (_transportV5) _transportV5->sendDelta(resourceId); }

void EspControl::begin(const uint8_t* manifestData, uint16_t manifestLen) {
  _auth.setPin(_pin);
  logManifestSummary(manifestData, manifestLen);
  _transport.begin(_deviceName, &_auth, &_registry, manifestData, manifestLen);
  
  static ecb::v5::ManifestStore storeV5(manifestData, manifestLen); // Simplification: assume V5 manifest is passed here too
  _transportV5 = new ecb::v5::BleTransportV5(
    storeV5,
    _resourcesV5, _subsV5, _registryV5,
    [this](const uint8_t* data, size_t len) { _transport.notifyRawV5(data, len); });
}

