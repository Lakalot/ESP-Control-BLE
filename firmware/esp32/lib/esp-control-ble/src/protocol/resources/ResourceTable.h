#pragma once
#include <stddef.h>
#include <stdint.h>
#include <string.h>
#include "../core/Protocol.h"

namespace ecb {

enum class ResourceValueKind : uint8_t { None=0, Bool=1, Int=2, Uint=3, Float=4, String=5, Bytes=6 };
enum class SetResult : uint8_t { Ok, TableFull, NoBlobSlot };

struct ResourceValue {
  uint32_t resourceId;
  ResourceValueKind kind;
  bool     boolValue;
  int32_t  intValue;
  uint32_t uintValue;
  float    floatValue;
  char     stringValue[kMaxResourceValueLen + 1];
  uint8_t  bytesValue[kMaxResourceValueLen];
  size_t   bytesLength;
};

struct ResourceEntry {
  uint32_t resourceId;
  ResourceValueKind kind;
  uint8_t blobSlot;
  uint8_t blobLength;
  uint8_t reserved;
  union {
    bool boolValue;
    int32_t intValue;
    uint32_t uintValue;
    float floatValue;
  } value;
};

static_assert(sizeof(ResourceEntry) <= 24, "ResourceEntry must stay compact");

template <size_t MaxBlobSlots = 4>
class ResourceTable {
public:
  static constexpr size_t kMaxEntries = kMaxResources;
  static constexpr size_t kMaxStringLen = kMaxResourceValueLen;
  static constexpr size_t kMaxBytesLen = kMaxResourceValueLen;
  static constexpr size_t kMaxBlobSlots = MaxBlobSlots;
  static_assert(MaxBlobSlots <= kMaxEntries, "Blob slot count cannot exceed resource entries");
  
  ResourceTable() : _entries{}, _blobSlots{}, _count(0), _generation(0) {
    for (size_t i = 0; i < kMaxEntries; ++i) {
      _entries[i].blobSlot = 0xFF;
    }
  }
  
  bool get(uint32_t resourceId, ResourceValue& out) const {
    size_t idx = findIndex(resourceId);
    if (idx == kMaxEntries) return false;
    return fillValue(_entries[idx], out);
  }
  
  SetResult trySetBool(uint32_t id, bool v) {
    auto* e = upsert(id);
    if (!e) return SetResult::TableFull;
    if (usesBlobStorage(e->kind)) releaseBlobSlot(*e);
    e->kind = ResourceValueKind::Bool;
    e->value.boolValue = v;
    _generation += 1;
    return SetResult::Ok;
  }
  
  SetResult trySetInt(uint32_t id, int32_t v) {
    auto* e = upsert(id);
    if (!e) return SetResult::TableFull;
    if (usesBlobStorage(e->kind)) releaseBlobSlot(*e);
    e->kind = ResourceValueKind::Int;
    e->value.intValue = v;
    _generation += 1;
    return SetResult::Ok;
  }
  
  SetResult trySetUint(uint32_t id, uint32_t v) {
    auto* e = upsert(id);
    if (!e) return SetResult::TableFull;
    if (usesBlobStorage(e->kind)) releaseBlobSlot(*e);
    e->kind = ResourceValueKind::Uint;
    e->value.uintValue = v;
    _generation += 1;
    return SetResult::Ok;
  }
  
  SetResult trySetFloat(uint32_t id, float v) {
    auto* e = upsert(id);
    if (!e) return SetResult::TableFull;
    if (usesBlobStorage(e->kind)) releaseBlobSlot(*e);
    e->kind = ResourceValueKind::Float;
    e->value.floatValue = v;
    _generation += 1;
    return SetResult::Ok;
  }
  
  SetResult trySetString(uint32_t id, const char* s) {
    auto* e = upsert(id);
    if (!e) return SetResult::TableFull;
    const uint8_t slot = ensureBlobSlot(*e);
    if (slot == 0xFF) return SetResult::NoBlobSlot;
    const char* value = s ? s : "";
    const size_t n = strnlen(value, kMaxStringLen);
    memcpy(_blobSlots[slot].data, value, n);
    _blobSlots[slot].data[n] = '\0';
    e->kind = ResourceValueKind::String;
    e->blobLength = static_cast<uint8_t>(n);
    _generation += 1;
    return SetResult::Ok;
  }
  
  SetResult trySetBytes(uint32_t id, const uint8_t* data, size_t len) {
    auto* e = upsert(id);
    if (!e) return SetResult::TableFull;
    const uint8_t slot = ensureBlobSlot(*e);
    if (slot == 0xFF) return SetResult::NoBlobSlot;
    const size_t n = len > kMaxBytesLen ? kMaxBytesLen : len;
    if (n > 0 && data) memcpy(_blobSlots[slot].data, data, n);
    e->kind = ResourceValueKind::Bytes;
    e->blobLength = static_cast<uint8_t>(n);
    _generation += 1;
    return SetResult::Ok;
  }
  
  uint32_t generation() const { return _generation; }
  size_t size() const { return _count; }
  
  bool at(size_t index, ResourceValue& out) const {
    if (index >= _count) return false;
    return fillValue(_entries[index], out);
  }
  
private:
  struct BlobSlot {
    bool inUse;
    uint8_t data[kMaxStringLen + 1];
  };

  ResourceEntry _entries[kMaxEntries];
  BlobSlot _blobSlots[kMaxBlobSlots];
  size_t _count;
  uint32_t _generation;
  
  static bool usesBlobStorage(ResourceValueKind kind) {
    return kind == ResourceValueKind::String || kind == ResourceValueKind::Bytes;
  }
  
  size_t findIndex(uint32_t resourceId) const {
    for (size_t i = 0; i < _count; ++i) if (_entries[i].resourceId == resourceId) return i;
    return kMaxEntries;
  }
  
  ResourceEntry* upsert(uint32_t resourceId) {
    size_t idx = findIndex(resourceId);
    if (idx == kMaxEntries) {
      if (_count >= kMaxEntries) return nullptr;
      idx = _count++;
      _entries[idx] = ResourceEntry{};
      _entries[idx].resourceId = resourceId;
      _entries[idx].blobSlot = 0xFF;
    }
    return &_entries[idx];
  }
  
  bool fillValue(const ResourceEntry& entry, ResourceValue& out) const {
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
  
  void releaseBlobSlot(ResourceEntry& entry) {
    if (entry.blobSlot < kMaxBlobSlots) {
      _blobSlots[entry.blobSlot] = BlobSlot{};
    }
    entry.blobSlot = 0xFF;
    entry.blobLength = 0;
  }
  
  uint8_t ensureBlobSlot(ResourceEntry& entry) {
    if (entry.blobSlot < kMaxBlobSlots) return entry.blobSlot;
    for (uint8_t i = 0; i < kMaxBlobSlots; ++i) {
      if (_blobSlots[i].inUse) continue;
      _blobSlots[i].inUse = true;
      entry.blobSlot = i;
      return i;
    }
    return 0xFF;
  }
};

} // namespace