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

namespace ecb {

EspControl::EspControl(const char* deviceName, const char* pin)
  : _deviceName(deviceName), _pin(pin),
    _state{AuthHandler{}, ActionRegistry{}, ResourceTable<>{}, SubscriptionState{}, ManifestStore(nullptr, 0)},
    _dispatcher(_state.resources, _state.subscriptions, _state.actions, _state.manifest, &EspControl::sendDataFrame, this),
    _dataTransport(&EspControl::sendDataFrame, this, &EspControl::onDataFrame, this) {}

void EspControl::sendDataFrame(void* context, const uint8_t* data, size_t len) {
  static_cast<EspControl*>(context)->_transport.notifyRawData(data, len);
}

void EspControl::onDataFrame(ecb::FrameKind kind, const uint8_t* body, size_t len, void* context) {
  static_cast<EspControl*>(context)->_dispatcher.onFrame(kind, body, len);
}

void EspControl::onDisconnect(void* context) {
  static_cast<EspControl*>(context)->_dispatcher.reset();
}

void EspControl::onSubscribe(void* context) {
  static_cast<EspControl*>(context)->_dispatcher.sendManifest();
}

void EspControl::registerAction(uint32_t actionId, ecb::ActionFn fn, void* context) { _state.actions.registerAction(actionId, fn, context); }
void EspControl::publishDelta(uint32_t resourceId) { _dispatcher.publishDelta(resourceId); }
void EspControl::tick() { _dispatcher.tick(); }

void EspControl::begin(const uint8_t* manifestData, uint16_t manifestLen) {
  _state.auth.setPin(_pin);
  logManifestSummary(manifestData, manifestLen);
  _transport.begin(_deviceName, &_state.auth, manifestData, manifestLen);

  _state.manifest = ecb::ManifestStore(manifestData, manifestLen);
  _transport.setProtocolCallbacks(&EspControl::onDisconnect, &EspControl::onSubscribe, this);
  _transport.setDataTransport(&_dataTransport);
}

} // namespace ecb
