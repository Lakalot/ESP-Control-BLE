#pragma once

#include "protocol/actions/ActionRegistry.h"
#include "protocol/resources/ResourceTable.h"
#include "protocol/subscriptions/SubscriptionState.h"
#include "protocol/dispatcher/SessionDispatcher.h"
#include "transport/ble/BleTransport.h"
#include "transport/ble/DataBleTransport.h"

namespace ecb {

struct ProtocolState {
  AuthHandler auth;
  ActionRegistry actions;
  ResourceTable<> resources;
  SubscriptionState subscriptions;
  ManifestStore manifest;
};

class EspControl {
public:
  EspControl(const char* deviceName, const char* pin);

  // Data API â€” additive alongside v4.
  void registerAction(uint32_t actionId, ecb::ActionFn fn, void* context);
  ecb::ResourceTable<>& resources() { return _state.resources; }
  void publishDelta(uint32_t resourceId);
  void tick();

  void begin(const uint8_t* manifestData, uint16_t manifestLen);

private:
  static void sendDataFrame(void* context, const uint8_t* data, size_t len);
  static void onDataFrame(ecb::FrameKind kind, const uint8_t* body, size_t len, void* context);
  static void onDisconnect(void* context);
  static void onSubscribe(void* context);

  const char*                 _deviceName;
  const char*                 _pin;
  BleTransport                _transport;

  ProtocolState           _state;
  ecb::SessionDispatcher  _dispatcher;
  ecb::DataBleTransport   _dataTransport;
};

} // namespace ecb
