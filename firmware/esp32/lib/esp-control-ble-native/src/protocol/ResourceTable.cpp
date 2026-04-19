#include "ResourceTable.h"
#include <string.h>

namespace ecb { namespace v5 {

ResourceTable::ResourceTable() : _entries{}, _count(0), _generation(0) {}

size_t ResourceTable::findIndex(uint32_t resourceId) const {
  for (size_t i = 0; i < _count; ++i) if (_entries[i].resourceId == resourceId) return i;
  return kMaxEntries;
}

ResourceValue* ResourceTable::upsert(uint32_t resourceId, ResourceValueKind kind) {
  size_t idx = findIndex(resourceId);
  if (idx == kMaxEntries) {
    if (_count >= kMaxEntries) return nullptr;
    idx = _count++;
    _entries[idx] = ResourceValue{};
    _entries[idx].resourceId = resourceId;
  }
  _entries[idx].kind = kind;
  _generation += 1;
  return &_entries[idx];
}

bool ResourceTable::get(uint32_t resourceId, ResourceValue& out) const {
  size_t idx = findIndex(resourceId);
  if (idx == kMaxEntries) return false;
  out = _entries[idx];
  return true;
}

void ResourceTable::setBool(uint32_t id, bool v) {
  auto* e = upsert(id, ResourceValueKind::Bool);
  if (e) e->boolValue = v;
}
void ResourceTable::setInt(uint32_t id, int32_t v) {
  auto* e = upsert(id, ResourceValueKind::Int);
  if (e) e->intValue = v;
}
void ResourceTable::setUint(uint32_t id, uint32_t v) {
  auto* e = upsert(id, ResourceValueKind::Uint);
  if (e) e->uintValue = v;
}
void ResourceTable::setString(uint32_t id, const char* s) {
  auto* e = upsert(id, ResourceValueKind::String);
  if (!e) return;
  size_t n = strnlen(s, kMaxStringLen);
  memcpy(e->stringValue, s, n);
  e->stringValue[n] = '\0';
}
void ResourceTable::setBytes(uint32_t id, const uint8_t* data, size_t len) {
  auto* e = upsert(id, ResourceValueKind::Bytes);
  if (!e) return;
  size_t n = len > 64 ? 64 : len;
  memcpy(e->bytesValue, data, n);
  e->bytesLength = n;
}
bool ResourceTable::at(size_t index, ResourceValue& out) const {
  if (index >= _count) return false;
  out = _entries[index];
  return true;
}

}} // namespace
