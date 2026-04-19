#include "SubscriptionState.h"

namespace ecb { namespace v5 {

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
      _ids[i] = _ids[_count - 1];
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

void SubscriptionState::clear() { _count = 0; }

}} // namespace
