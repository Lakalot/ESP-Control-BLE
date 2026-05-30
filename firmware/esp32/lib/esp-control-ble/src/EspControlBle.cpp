#include "EspControlBle.h"
#include "ui/Ui.h"
#include "ui/RuntimeUi.h"
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
  : _deviceName(deviceName), _pin(pin) {}

void EspControl::sendBle(void* context, const uint8_t* data, size_t len) {
  static_cast<EspControl*>(context)->_bleTransport.send(data, len);
}

bool EspControl::registerAction(uint32_t actionId, ecb::ActionHandler h) {
  return _actionRegistry.registerAction(actionId, h);
}

void EspControl::publishDelta(uint32_t resourceId) {
  if (_engine) _engine->sendDelta(resourceId);
}

void EspControl::tick() {
  _sppTransport.poll();
  if (_engine) _engine->tick();
}

void EspControl::beginUi(void (*buildFn)(ecb::ui::Ui&), const uint8_t* manifestData, uint16_t manifestLen) {
  ecb::ui::RuntimeUi rt(*this);
  buildFn(rt);
  rt.commit();
  begin(manifestData, manifestLen);
}

void EspControl::begin(const uint8_t* manifestData, uint16_t manifestLen) {
  _auth.setPin(_pin);
  logManifestSummary(manifestData, manifestLen);

  static ecb::ManifestStore store(manifestData, manifestLen);

  _engine = new ecb::ProtocolEngine(
      store, _resources, _subs, _actionRegistry, _auth,
      ecb::FrameSender{this, &EspControl::sendBle});

  _bleTransport.attach(_engine, manifestData, manifestLen);
  _bleTransport.begin(_deviceName);

  _sppTransport.attach(_engine);
  _sppTransport.begin(_deviceName);

  ECB_LOGF("[ECB] started (BLE+SPP) %s\n", _deviceName);
}
