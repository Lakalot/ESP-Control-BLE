#pragma once
#include <stddef.h>
#include <stdint.h>
#include <functional>
#include "FrameCodecV5.h"
#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>

namespace ecb { namespace v5 {

class ManifestStore;
class ResourceTable;
class SubscriptionState;
class ActionRegistry;

using FrameSender = std::function<void(const uint8_t*, size_t)>;

class BleTransportV5 {
public:
  BleTransportV5(const ManifestStore& store,
                 ResourceTable& table,
                 SubscriptionState& subs,
                 const ActionRegistry& registry,
                 FrameSender sender);
  void handleFrame(FrameKind kind, const uint8_t* body, size_t len);
  void sendManifest();
  void sendSnapshot();
  void sendDelta(uint32_t resourceId);
  void reset();
  void tick();
private:
  const ManifestStore&    _store;
  ResourceTable&          _table;
  SubscriptionState&      _subs;
  const ActionRegistry&   _registry;
  FrameSender             _sender;
  volatile bool           _snapshotPending = false;
  uint64_t                _deltaPendingMask = 0;
  SemaphoreHandle_t       _mutex;
  void sendFrame(FrameKind kind, uint8_t flags, const uint8_t* body, size_t len);
  void sendDeltaInternal(uint32_t resourceId);
};

}} // namespace
