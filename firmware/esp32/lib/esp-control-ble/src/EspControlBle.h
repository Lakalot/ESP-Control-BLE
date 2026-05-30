#pragma once

#include "protocol/actions/ActionRegistry.h"
#include "protocol/resources/ResourceTable.h"
#include "protocol/subscriptions/SubscriptionState.h"
#include "protocol/auth/AuthHandler.h"
#include "protocol/manifest/ManifestStore.h"
#include "transport/ble/DataBleTransport.h"   // ProtocolEngine
#include "transport/ble/BleTransport.h"
#include "transport/spp/SppTransport.h"
// RuntimeUi is held BY VALUE as a member (see _runtimeUi below), so its complete
// type is required here. It is lightweight: it forward-declares EspControl and
// pulls in only ui/Ui.h + ui/Res.h + ui/IdAssignment.h + ui/HwHal.h (no transport
// headers), so there is no include cycle. ecb::ui::Ui is complete via this include.
#include "ui/RuntimeUi.h"

class EspControl {
public:
  EspControl(const char* deviceName, const char* pin);

  bool registerAction(uint32_t actionId, ecb::ActionHandler handler);
  ecb::ResourceTable& resources() { return _resources; }
  // Read-only access to the action registry (symmetric with resources()). Used
  // by RuntimeUi tests to invoke a registered handler directly.
  const ecb::ActionRegistry& actions() const { return _actionRegistry; }
  void publishDelta(uint32_t resourceId);
  void tick();

  void begin(const uint8_t* manifestData, uint16_t manifestLen);

  // One-call setup: build the UI description with RuntimeUi, commit (registers
  // resources + handlers), then begin() with the embedded manifest.
  void beginUi(void (*buildFn)(ecb::ui::Ui&), const uint8_t* manifestData, uint16_t manifestLen);

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

  // Long-lived UI runtime. beginUi() builds + commits through THIS member (not a
  // stack local), so every Res<T> handle the build function stores keeps a pointer
  // into a member of this forever-lived EspControl -- no use-after-free once
  // beginUi() returns. Constructed with *this in the ctor init list, which only
  // stores the address (RuntimeUi's ctor touches nothing of EspControl).
  ecb::ui::RuntimeUi      _runtimeUi;
};
