#pragma once

#include "protocol/actions/ActionRegistry.h"
#include "protocol/resources/ResourceTable.h"
#include "protocol/subscriptions/SubscriptionState.h"
#include "protocol/auth/AuthHandler.h"
#include "protocol/manifest/ManifestStore.h"
#include "transport/ble/DataBleTransport.h"   // ProtocolEngine
#include "transport/ble/BleTransport.h"
#include "transport/spp/SppTransport.h"

class EspControl {
public:
  EspControl(const char* deviceName, const char* pin);

  void registerAction(uint32_t actionId, ecb::ActionHandler handler);
  ecb::ResourceTable& resources() { return _resources; }
  // Read-only access to the action registry (symmetric with resources()). Used
  // by RuntimeUi tests to invoke a registered handler directly.
  const ecb::ActionRegistry& actions() const { return _actionRegistry; }
  void publishDelta(uint32_t resourceId);
  void tick();

  void begin(const uint8_t* manifestData, uint16_t manifestLen);

private:
  static void sendBle(void* context, const uint8_t* data, size_t len);

  const char*             _deviceName;
  const char*             _pin;
  AuthHandler             _auth;

  ecb::ActionRegistry     _actionRegistry;
  ecb::ResourceTable      _resources;
  ecb::SubscriptionState  _subs;
  ecb::ProtocolEngine*    _engine = nullptr;
  BleTransport            _bleTransport;
  ecb::SppTransport       _sppTransport;
};
