#pragma once
#include "../../protocol/core/Protocol.h"
#include "../ITransport.h"
#include "DataBleTransport.h"   // ProtocolEngine

#ifndef UNIT_TEST
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#endif

namespace ecb { class ProtocolEngine; }

class BleTransport : public ecb::ITransport {
public:
  void attach(ecb::ProtocolEngine* engine, const uint8_t* manifest, uint16_t manifestLen);
  void begin(const char* deviceName) override;
  void send(const uint8_t* data, size_t len) override;

  // Called by BLE callbacks.
  void onData(const uint8_t* data, size_t len);
  void onConnect();
  void onDisconnect();

private:
  ecb::ProtocolEngine* _engine = nullptr;
  const uint8_t* _manifest = nullptr;
  uint16_t _manifestLen = 0;

#ifndef UNIT_TEST
  BLECharacteristic* _dataChar = nullptr;
#endif
};
