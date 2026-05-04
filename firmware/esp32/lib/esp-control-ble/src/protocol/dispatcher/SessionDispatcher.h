#pragma once

#include <stddef.h>
#include <stdint.h>
#include "../core/Protocol.h"
#include "../resources/ResourceTable.h"
#include "../subscriptions/SubscriptionState.h"
#include "../actions/ActionRegistry.h"
#include "../manifest/ManifestStore.h"
#include "../../transport/ble/DataBleTransport.h"

#ifdef UNIT_TEST
using SemaphoreHandle_t = void*;
constexpr int portMAX_DELAY = 0;
inline SemaphoreHandle_t xSemaphoreCreateMutex() { return nullptr; }
inline void xSemaphoreTake(SemaphoreHandle_t, int) {}
inline void xSemaphoreGive(SemaphoreHandle_t) {}
#else
#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>
#endif

namespace ecb {

class SessionDispatcher {
public:
  SessionDispatcher(ResourceTable<>& resources,
                    SubscriptionState& subscriptions,
                    const ActionRegistry& actions,
                    const ManifestStore& manifest,
                    FrameSender sender,
                    void* senderContext);

  void onFrame(FrameKind kind, const uint8_t* body, size_t len);
  void tick();
  void publishDelta(uint32_t resourceId);
  void reset();
  void sendManifest();

private:
  ResourceTable<>& _resources;
  SubscriptionState& _subscriptions;
  const ActionRegistry& _actions;
  const ManifestStore& _manifest;
  FrameSender _sender;
  void* _senderContext;
  uint64_t _deltaPendingMask;
  uint16_t _manifestOffset;
  bool _snapshotPending;
  bool _manifestPending;
  SemaphoreHandle_t _mutex;
  
  void sendDeltaInternal(uint32_t resourceId);
  void sendSnapshot();
};

}  // namespace ecb