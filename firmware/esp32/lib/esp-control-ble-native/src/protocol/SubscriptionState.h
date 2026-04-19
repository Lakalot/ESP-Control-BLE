#pragma once
#include <stddef.h>
#include <stdint.h>

namespace ecb { namespace v5 {

class SubscriptionState {
public:
  static constexpr size_t kMaxIds = 64;
  SubscriptionState();
  bool add(uint32_t resourceId);
  bool remove(uint32_t resourceId);
  bool isWatching(uint32_t resourceId) const;
  void clear();
  size_t size() const { return _count; }
private:
  uint32_t _ids[kMaxIds];
  size_t _count;
};

}} // namespace
