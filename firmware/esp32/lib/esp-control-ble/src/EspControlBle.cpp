#include "EspControlBle.h"
#include "protocol/manifest/ManifestStore.h"
#include "support/EcbLogging.h"

#ifdef UNIT_TEST

#include <stddef.h>

#else

#include <pgmspace.h>

#endif

namespace {
void logManifestSummary(const uint8_t* manifestData, uint16_t manifestLen) {
#ifdef UNIT_TEST
  (void)manifestData;
  (void)manifestLen;
#else
  if (manifestData == nullptr || manifestLen < 1) {
    ECB_LOGF("[ECB] Manifest invalid len=%u\n", manifestLen);
    return;
  }
  const uint8_t version = pgm_read_byte(manifestData);
  ECB_LOGF("[ECB] Manifest v%u: %u bytes\n", version, manifestLen);
#endif
}
} // namespace

EspControl::EspControl(const char* deviceName, const char* pin)
  : _deviceName(deviceName), _pin(pin), _dataTransport(nullptr) {}

void EspControl::sendDataFrame(void* context, const uint8_t* data, size_t len) {
  static_cast<EspControl*>(context)->_transport.notifyRawData(data, len);
}

void EspControl::registerAction(uint32_t actionId, ecb::ActionFn fn, void* context) { _actionRegistry.registerAction(actionId, fn, context); }
void EspControl::publishDelta(uint32_t resourceId) { if (_dataTransport) _dataTransport->sendDelta(resourceId); }
void EspControl::tick() { if (_dataTransport) _dataTransport->tick(); }

void EspControl::begin(const uint8_t* manifestData, uint16_t manifestLen) {
  _auth.setPin(_pin);
  logManifestSummary(manifestData, manifestLen);
  _transport.begin(_deviceName, &_auth, manifestData, manifestLen);

  static ecb::ManifestStore dataStore(manifestData, manifestLen); // Simplification: assume data manifest is passed here too
  _dataTransport = new ecb::DataBleTransport(
    dataStore,
    _resources, _subs, _actionRegistry,
    ecb::FrameSender{this, &EspControl::sendDataFrame});
  _transport.setDataTransport(_dataTransport);
}
