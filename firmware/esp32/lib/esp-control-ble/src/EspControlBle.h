#pragma once

#include "protocol/ActionRegistryV5.h"
#include "protocol/ResourceTable.h"
#include "protocol/SubscriptionState.h"
#include "transport/BleTransport.h"
#include "transport/BleTransportV5.h"

class EspControl {
public:
  EspControl(const char* deviceName, const char* pin);

  void registerCallback(uint8_t cmdId, EcbCommandFn callback);

  // V5 API — additive alongside v4.
  void registerActionV5(uint32_t actionId, ecb::v5::ActionHandler handler);
  ecb::v5::ResourceTable& resources() { return _resourcesV5; }
  void publishDelta(uint32_t resourceId);
  void tick();

  void begin(const uint8_t* manifestData, uint16_t manifestLen);

private:
  const char*                 _deviceName;
  const char*                 _pin;
  AuthHandler                 _auth;
  CommandRegistry             _registry;
  BleTransport                _transport;

  ecb::v5::ActionRegistry     _registryV5;
  ecb::v5::ResourceTable      _resourcesV5;
  ecb::v5::SubscriptionState  _subsV5;
  ecb::v5::BleTransportV5*    _transportV5;
  const uint8_t*              _manifestDataV5;
  uint16_t                    _manifestLenV5;
};

