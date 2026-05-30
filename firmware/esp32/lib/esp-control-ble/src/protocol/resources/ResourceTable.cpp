#include "ResourceTable.h"
#include <string.h>
#include "../../support/EcbLogging.h"

namespace ecb {

namespace {

constexpr uint8_t kNoBlobSlot = 0xFF;

static bool usesBlobStorage(ResourceValueKind kind) {
  return kind == ResourceValueKind::String || kind == ResourceValueKind::Bytes;
}

} // namespace

static_assert(sizeof(ResourceEntry) <= 24, "ResourceEntry must stay compact");

ResourceTable::ResourceTable() : _entries{}, _blobSlots{}, _count(0), _generation(0) {
  for (size_t i = 0; i < kMaxEntries; ++i) {
    _entries[i].blobSlot = kNoBlobSlot;
  }
  _mutex = xSemaphoreCreateMutex();
  if (_mutex == nullptr) {
    // Allocation only fails on heap exhaustion at boot. Without the mutex
    // every take/give silently no-ops and cross-task access is unprotected,
    // so surface it loudly rather than running races undiagnosed.
    ECB_LOGF("[ECB DATA] FATAL: ResourceTable mutex allocation failed\n");
  }
}

size_t ResourceTable::findIndex(uint32_t resourceId) const {
  for (size_t i = 0; i < _count; ++i) if (_entries[i].resourceId == resourceId) return i;
  return kMaxEntries;
}

ResourceEntry* ResourceTable::upsert(uint32_t resourceId) {
  size_t idx = findIndex(resourceId);
  if (idx == kMaxEntries) {
    if (_count >= kMaxEntries) return nullptr;
    // Initialize the new entry BEFORE publishing it via _count. A reader that
    // walks [0, _count) (size()/at()) must never observe a slot that _count
    // covers but whose fields are still half-written. Publishing _count last
    // guarantees the entry is fully formed by the time it becomes visible.
    idx = _count;
    _entries[idx] = ResourceEntry{};
    _entries[idx].resourceId = resourceId;
    _entries[idx].blobSlot = kNoBlobSlot;
    _count = idx + 1;
  }
  return &_entries[idx];
}

void ResourceTable::releaseBlobSlot(ResourceEntry& entry) {
  if (entry.blobSlot < kMaxBlobSlots) {
    _blobSlots[entry.blobSlot] = BlobSlot{};
  }
  entry.blobSlot = kNoBlobSlot;
  entry.blobLength = 0;
}

uint8_t ResourceTable::ensureBlobSlot(ResourceEntry& entry) {
  if (entry.blobSlot < kMaxBlobSlots) return entry.blobSlot;
  for (uint8_t i = 0; i < kMaxBlobSlots; ++i) {
    if (_blobSlots[i].inUse) continue;
    _blobSlots[i].inUse = true;
    entry.blobSlot = i;
    return i;
  }
  return kNoBlobSlot;
}

bool ResourceTable::fillValue(const ResourceEntry& entry, ResourceValue& out) const {
  out = ResourceValue{};
  out.resourceId = entry.resourceId;
  out.kind = entry.kind;

  switch (entry.kind) {
    case ResourceValueKind::Bool:
      out.boolValue = entry.value.boolValue;
      return true;
    case ResourceValueKind::Int:
      out.intValue = entry.value.intValue;
      return true;
    case ResourceValueKind::Uint:
      out.uintValue = entry.value.uintValue;
      return true;
    case ResourceValueKind::Float:
      out.floatValue = entry.value.floatValue;
      return true;
    case ResourceValueKind::String: {
      if (entry.blobSlot >= kMaxBlobSlots || !_blobSlots[entry.blobSlot].inUse) return true;
      const size_t len = entry.blobLength <= kMaxStringLen ? entry.blobLength : kMaxStringLen;
      memcpy(out.stringValue, _blobSlots[entry.blobSlot].data, len);
      out.stringValue[len] = '\0';
      return true;
    }
    case ResourceValueKind::Bytes: {
      if (entry.blobSlot >= kMaxBlobSlots || !_blobSlots[entry.blobSlot].inUse) return true;
      const size_t len = entry.blobLength <= kMaxBytesLen ? entry.blobLength : kMaxBytesLen;
      memcpy(out.bytesValue, _blobSlots[entry.blobSlot].data, len);
      out.bytesLength = len;
      return true;
    }
    case ResourceValueKind::None:
    default:
      return true;
  }
}

bool ResourceTable::get(uint32_t resourceId, ResourceValue& out) const {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  size_t idx = findIndex(resourceId);
  const bool ok = (idx != kMaxEntries) && fillValue(_entries[idx], out);
  xSemaphoreGive(_mutex);
  return ok;
}

void ResourceTable::setBool(uint32_t id, bool v) {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  auto* e = upsert(id);
  if (e) {
    if (usesBlobStorage(e->kind)) releaseBlobSlot(*e);
    e->kind = ResourceValueKind::Bool;
    e->value.boolValue = v;
    _generation += 1;
  }
  xSemaphoreGive(_mutex);
}

void ResourceTable::setInt(uint32_t id, int32_t v) {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  auto* e = upsert(id);
  if (e) {
    if (usesBlobStorage(e->kind)) releaseBlobSlot(*e);
    e->kind = ResourceValueKind::Int;
    e->value.intValue = v;
    _generation += 1;
  }
  xSemaphoreGive(_mutex);
}

void ResourceTable::setUint(uint32_t id, uint32_t v) {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  auto* e = upsert(id);
  if (e) {
    if (usesBlobStorage(e->kind)) releaseBlobSlot(*e);
    e->kind = ResourceValueKind::Uint;
    e->value.uintValue = v;
    _generation += 1;
  }
  xSemaphoreGive(_mutex);
}

void ResourceTable::setFloat(uint32_t id, float v) {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  auto* e = upsert(id);
  if (e) {
    if (usesBlobStorage(e->kind)) releaseBlobSlot(*e);
    e->kind = ResourceValueKind::Float;
    e->value.floatValue = v;
    _generation += 1;
  }
  xSemaphoreGive(_mutex);
}

void ResourceTable::setString(uint32_t id, const char* s) {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  auto* e = upsert(id);
  if (e) {
    const uint8_t slot = ensureBlobSlot(*e);
    if (slot != kNoBlobSlot) {
      const char* value = s ? s : "";
      const size_t n = strnlen(value, kMaxStringLen);
      memcpy(_blobSlots[slot].data, value, n);
      _blobSlots[slot].data[n] = '\0';
      e->kind = ResourceValueKind::String;
      e->blobLength = static_cast<uint8_t>(n);
      _generation += 1;
    }
  }
  xSemaphoreGive(_mutex);
}

void ResourceTable::setBytes(uint32_t id, const uint8_t* data, size_t len) {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  auto* e = upsert(id);
  if (e) {
    const uint8_t slot = ensureBlobSlot(*e);
    if (slot != kNoBlobSlot) {
      const size_t n = len > kMaxBytesLen ? kMaxBytesLen : len;
      if (n > 0 && data) memcpy(_blobSlots[slot].data, data, n);
      e->kind = ResourceValueKind::Bytes;
      e->blobLength = static_cast<uint8_t>(n);
      _generation += 1;
    }
  }
  xSemaphoreGive(_mutex);
}

bool ResourceTable::at(size_t index, ResourceValue& out) const {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  const bool ok = (index < _count) && fillValue(_entries[index], out);
  xSemaphoreGive(_mutex);
  return ok;
}

uint32_t ResourceTable::generation() const {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  const uint32_t g = _generation;
  xSemaphoreGive(_mutex);
  return g;
}

size_t ResourceTable::size() const {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  const size_t n = _count;
  xSemaphoreGive(_mutex);
  return n;
}

} // namespace
