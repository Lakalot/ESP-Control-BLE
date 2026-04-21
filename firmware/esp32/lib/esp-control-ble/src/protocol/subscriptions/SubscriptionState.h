#pragma once
#include <stddef.h>
#include <stdint.h>

namespace ecb {

class SubscriptionState {
public:
  static constexpr size_t kMaxIds = 64;
  SubscriptionState();
  bool add(uint32_t resourceId);
  bool remove(uint32_t resourceId);
  bool isWatching(uint32_t resourceId) const;
  int indexOf(uint32_t resourceId) const;
  uint32_t idAt(size_t index) const;
  void clear();
  size_t size() const { return _count; }
private:
  uint32_t _ids[kMaxIds];
  size_t _count;
};

} // namespace
