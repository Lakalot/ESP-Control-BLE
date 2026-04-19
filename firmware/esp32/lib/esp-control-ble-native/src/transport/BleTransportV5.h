#pragma once
#include <stddef.h>
#include <stdint.h>
#include <functional>
#include "FrameCodecV5.h"

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
private:
  const ManifestStore&    _store;
  ResourceTable&          _table;
  SubscriptionState&      _subs;
  const ActionRegistry&   _registry;
  FrameSender             _sender;
  void sendFrame(FrameKind kind, uint8_t flags, const uint8_t* body, size_t len);
};

}} // namespace
