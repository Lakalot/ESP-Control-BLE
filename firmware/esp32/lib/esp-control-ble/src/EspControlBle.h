#pragma once

#include "protocol/actions/ActionRegistry.h"
#include "protocol/resources/ResourceTable.h"
#include "protocol/subscriptions/SubscriptionState.h"
#include "transport/ble/BleTransport.h"
#include "transport/ble/DataBleTransport.h"

class EspControl {
public:
  EspControl(const char* deviceName, const char* pin);

  // Data API â€” additive alongside v4.
  void registerAction(uint32_t actionId, ecb::ActionFn fn, void* context);
  ecb::ResourceTable<>& resources() { return _resources; }
  void publishDelta(uint32_t resourceId);
  void tick();

  void begin(const uint8_t* manifestData, uint16_t manifestLen);

private:
  static void sendDataFrame(void* context, const uint8_t* data, size_t len);

  const char*                 _deviceName;
  const char*                 _pin;
  AuthHandler                 _auth;
  BleTransport                _transport;

  ecb::ActionRegistry     _actionRegistry;
  ecb::ResourceTable<>    _resources;
  ecb::SubscriptionState  _subs;
  ecb::DataBleTransport*  _dataTransport;
};
