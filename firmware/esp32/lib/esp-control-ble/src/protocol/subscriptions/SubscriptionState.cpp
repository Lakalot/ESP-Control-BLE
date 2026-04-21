#include "SubscriptionState.h"

namespace ecb {

SubscriptionState::SubscriptionState() : _ids{}, _count(0) {}

bool SubscriptionState::add(uint32_t id) {
  if (isWatching(id)) return false;
  if (_count >= kMaxIds) return false;
  _ids[_count++] = id;
  return true;
}

bool SubscriptionState::remove(uint32_t id) {
  for (size_t i = 0; i < _count; ++i) {
    if (_ids[i] == id) {
      for (size_t j = i + 1; j < _count; ++j) {
        _ids[j - 1] = _ids[j];
      }
      --_count;
      return true;
    }
  }
  return false;
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
