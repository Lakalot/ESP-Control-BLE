#pragma once

#include <stddef.h>
#include <stdint.h>
#include "../core/Protocol.h"
#include "../resources/ResourceTable.h"
#include "../subscriptions/SubscriptionState.h"
#include "../actions/ActionRegistry.h"
#include "../manifest/ManifestStore.h"

namespace ecb {

using SessionFrameSender = void (*)(void* context, const uint8_t* data, size_t len);

class SessionDispatcher {
public:
  SessionDispatcher(ResourceTable<>& resources,
                    SubscriptionState& subscriptions,
                    const ActionRegistry& actions,
                    const ManifestStore& manifest,
                    SessionFrameSender sender,
                    void* senderContext);

  void onFrame(FrameKind kind, const uint8_t* body, size_t len);
  void tick();
  void publishDelta(uint32_t resourceId);
  void reset();

private:
  ResourceTable<>& _resources;
  SubscriptionState& _subscriptions;
  const ActionRegistry& _actions;
  const ManifestStore& _manifest;
  SessionFrameSender _sender;
  void* _senderContext;
  uint64_t _deltaPendingMask;
  uint16_t _manifestOffset;
  bool _snapshotPending;
};

}  // namespace ecb