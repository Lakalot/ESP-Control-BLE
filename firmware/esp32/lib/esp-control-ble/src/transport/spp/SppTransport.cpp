#include "SppTransport.h"
#include "../ble/DataBleTransport.h"   // ProtocolEngine
#include "../frame/DataFrameCodec.h"

namespace ecb {

SppTransport::SppTransport() : _acc(&SppTransport::onFrame, this) {}

void SppTransport::attach(ProtocolEngine* engine) { _engine = engine; }

void SppTransport::onFrame(FrameKind kind, uint8_t flags, const uint8_t* body, size_t len, void* ctx) {
  (void)flags;
  SppTransport* self = static_cast<SppTransport*>(ctx);
  if (!self->_engine) return;
  if (!self->_engine->beginSession(ProtocolEngine::Session::Spp)) return;  // BLE active
  self->_engine->setSender(FrameSender{self, [](void* c, const uint8_t* d, size_t n) {
    static_cast<SppTransport*>(c)->send(d, n);
  }});
  self->_engine->handleFrame(kind, body, len);
}

#ifdef UNIT_TEST

void SppTransport::begin(const char*) {}
void SppTransport::send(const uint8_t*, size_t) {}
void SppTransport::poll() {}

#else

#include <Arduino.h>
#include "../../support/EcbLogging.h"

void SppTransport::begin(const char* deviceName) {
  _bt.begin(deviceName);
  ECB_LOGF("[ECB] SPP started: %s\n", deviceName);
}

void SppTransport::send(const uint8_t* data, size_t len) {
  if (_connected) _bt.write(data, len);
}

void SppTransport::poll() {
  if (!_bt.hasClient()) {
    if (_connected) {
      _connected = false;
      _acc.reset();
      if (_engine) _engine->endSession(ProtocolEngine::Session::Spp);
    }
    return;
  }
  _connected = true;
  uint8_t buf[64];
  while (_bt.available() > 0) {
    int n = _bt.readBytes(buf, sizeof(buf));
    if (n > 0) _acc.feed(buf, (size_t)n);
  }
}

#endif

} // namespace ecb
