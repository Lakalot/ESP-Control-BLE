#pragma once
#include <stddef.h>
#include <stdint.h>
#include "../core/Protocol.h"

namespace ecb {

enum class SubResult : uint8_t { Ok, AlreadyPresent, NotPresent, Full, Empty };

class SubscriptionState {
public:
  static constexpr size_t kMaxIds = kMaxResources;
  SubscriptionState();
  SubResult tryAdd(uint32_t resourceId);
  bool add(uint32_t resourceId) { return tryAdd(resourceId) == SubResult::Ok; }
  SubResult tryRemove(uint32_t resourceId);
  bool remove(uint32_t resourceId) { return tryRemove(resourceId) == SubResult::Ok; }
  bool isWatching(uint32_t resourceId) const;
  int indexOf(uint32_t resourceId) const;
  uint32_t idAt(size_t index) const;
  void clear();
  size_t size() const { return _count; }
private:
  uint32_t _ids[kMaxIds];
  size_t _count;
};

static_assert(SubscriptionState::kMaxIds == kMaxResources,
              "SubscriptionState capacity must match protocol max resources");

} // namespace
