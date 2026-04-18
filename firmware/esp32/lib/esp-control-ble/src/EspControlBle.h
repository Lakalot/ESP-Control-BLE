#pragma once

#include "protocol/CommandRegistry.h"
#include "ManifestBuilder.h"
#include "protocol/Protocol.h"

class AuthHandler;
class BleTransport;

class EspControl {
public:
  EspControl(const char* deviceName, const char* pin);

  /// Returns the root UI builder.
  /// Define containers and place commands from this root.
  UiNodeBuilder ui();

  /// Register or replace the callback for cmdId directly.
  void registerCallback(uint8_t cmdId, EcbCommandFn callback);

  /// Initialize BLE and start advertising. Call once after all declarations.
  void begin();

private:
  const char*      _deviceName;
  const char*      _pin;
  ManifestBuilder* _manifest;
  AuthHandler*     _auth;
  CommandRegistry* _registry;
  BleTransport*    _transport;
};
