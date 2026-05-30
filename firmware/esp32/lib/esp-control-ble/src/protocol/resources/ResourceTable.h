#pragma once
#include <stddef.h>
#include <stdint.h>
#include "../../support/FreeRtosShim.h"

namespace ecb {

enum class ResourceValueKind : uint8_t { None=0, Bool=1, Int=2, Uint=3, Float=4, String=5, Bytes=6 };

struct ResourceValue {
  uint32_t resourceId;
  ResourceValueKind kind;
  bool     boolValue;
  int32_t  intValue;
  uint32_t uintValue;
  float    floatValue;
  char     stringValue[65];
  uint8_t  bytesValue[64];
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

class ResourceTable {
public:
  static constexpr size_t kMaxEntries = 64;
  static constexpr size_t kMaxStringLen = 64;
  static constexpr size_t kMaxBytesLen = 64;
  static constexpr size_t kMaxBlobSlots = kMaxEntries;
  ResourceTable();
  bool get(uint32_t resourceId, ResourceValue& out) const;
  void setBool(uint32_t resourceId, bool v);
  void setInt(uint32_t resourceId, int32_t v);
  void setUint(uint32_t resourceId, uint32_t v);
  void setFloat(uint32_t resourceId, float v);
  void setString(uint32_t resourceId, const char* s);
  void setBytes(uint32_t resourceId, const uint8_t* data, size_t len);
  uint32_t generation() const;
  size_t size() const;
  bool at(size_t index, ResourceValue& out) const;
private:
  struct BlobSlot {
    bool inUse;
    uint8_t data[kMaxStringLen + 1];
  };

  ResourceEntry _entries[kMaxEntries];
  BlobSlot _blobSlots[kMaxBlobSlots];
  size_t _count;
  uint32_t _generation;
  // Dedicated to this table, independent of the engine mutex. The engine
  // deliberately releases its own lock before reading the table (a write
  // handler re-enters the engine mutex via publishDelta), so only this lock
  // can serialize loop-task reads against BLE-host-task writes. mutable so the
  // const read paths (get/at/size/generation) can still take it.
  mutable SemaphoreHandle_t _mutex;
  size_t findIndex(uint32_t resourceId) const;
  ResourceEntry* upsert(uint32_t resourceId);
  bool fillValue(const ResourceEntry& entry, ResourceValue& out) const;
  void releaseBlobSlot(ResourceEntry& entry);
  uint8_t ensureBlobSlot(ResourceEntry& entry);
};

} // namespace
