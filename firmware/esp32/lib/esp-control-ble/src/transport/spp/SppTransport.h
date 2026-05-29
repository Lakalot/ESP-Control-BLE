#pragma once
#include <stddef.h>
#include <stdint.h>
#include "../ITransport.h"
#include "../frame/FrameAccumulator.h"

#ifndef UNIT_TEST
#include <BluetoothSerial.h>
#endif

namespace ecb {

class ProtocolEngine;

class SppTransport : public ITransport {
public:
  SppTransport();
  void attach(ProtocolEngine* engine);
  void begin(const char* deviceName) override;
  void send(const uint8_t* data, size_t len) override;

  // Pump the SPP RX stream into the accumulator; call from tick().
  void poll();

private:
  static void onFrame(FrameKind kind, uint8_t flags, const uint8_t* body, size_t len, void* ctx);
  ProtocolEngine*  _engine = nullptr;
  FrameAccumulator _acc;
  bool             _connected = false;

#ifndef UNIT_TEST
  BluetoothSerial  _bt;
#endif
};

} // namespace ecb
