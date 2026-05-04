#include "SessionDispatcher.h"

namespace ecb {

SessionDispatcher::SessionDispatcher(ResourceTable<>& resources,
                                     SubscriptionState& subscriptions,
                                     const ActionRegistry& actions,
                                     const ManifestStore& manifest,
                                     SessionFrameSender sender,
                                     void* senderContext)
  : _resources(resources),
    _subscriptions(subscriptions),
    _actions(actions),
    _manifest(manifest),
    _sender(sender),
    _senderContext(senderContext),
    _deltaPendingMask(0),
    _manifestOffset(0),
    _snapshotPending(false) {}

void SessionDispatcher::onFrame(FrameKind, const uint8_t*, size_t) {}
void SessionDispatcher::tick() {}
void SessionDispatcher::publishDelta(uint32_t) {}
void SessionDispatcher::reset() {
  _deltaPendingMask = 0;
  _manifestOffset = 0;
  _snapshotPending = false;
}

}  // namespace ecb