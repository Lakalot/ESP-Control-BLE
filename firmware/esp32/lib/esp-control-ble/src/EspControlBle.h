#pragma once

#include "protocol/AuthHandler.h"
#include "protocol/CommandRegistry.h"
#include "protocol/Protocol.h"
#include "transport/BleTransport.h"

class EspControl {
public:
  EspControl(const char* deviceName, const char* pin);

  /// Register or replace the callback for cmdId directly.
  void registerCallback(uint8_t cmdId, EcbCommandFn callback);

  /// Initialize BLE and start advertising.
  /// manifestData must point to PROGMEM bytes generated in manifest_data.h.
  void begin(const uint8_t* manifestData, uint16_t manifestLen);

private:
  const char*     _deviceName;
  const char*     _pin;
  AuthHandler     _auth;
  CommandRegistry _registry;
  BleTransport    _transport;
};
