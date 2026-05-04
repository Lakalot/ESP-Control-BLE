#include "SubscriptionState.h"

namespace ecb {

SubscriptionState::SubscriptionState() : _ids{}, _count(0) {}

SubResult SubscriptionState::tryAdd(uint32_t id) {
  if (isWatching(id)) return SubResult::AlreadyPresent;
  if (_count >= kMaxIds) return SubResult::Full;
  _ids[_count++] = id;
  return SubResult::Ok;
}

SubResult SubscriptionState::tryRemove(uint32_t id) {
  for (size_t i = 0; i < _count; ++i) {
    if (_ids[i] == id) {
      for (size_t j = i + 1; j < _count; ++j) {
        _ids[j - 1] = _ids[j];
      }
      --_count;
      return SubResult::Ok;
    }
  }
  return SubResult::NotPresent;
}

bool SubscriptionState::isWatching(uint32_t id) const {
  for (size_t i = 0; i < _count; ++i) if (_ids[i] == id) return true;
  return false;
}

int SubscriptionState::indexOf(uint32_t id) const {
  for (size_t i = 0; i < _count; ++i) {
    if (_ids[i] == id) return static_cast<int>(i);
  }
  return -1;
}

uint32_t SubscriptionState::idAt(size_t index) const {
  return index < _count ? _ids[index] : 0;
}

void SubscriptionState::clear() { _count = 0; }

} // namespace
