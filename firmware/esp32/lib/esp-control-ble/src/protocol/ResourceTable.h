#pragma once
#include <stddef.h>
#include <stdint.h>

namespace ecb { namespace v5 {

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

class ResourceTable {
public:
  static constexpr size_t kMaxEntries = 64;
  static constexpr size_t kMaxStringLen = 64;
  ResourceTable();
  bool get(uint32_t resourceId, ResourceValue& out) const;
  void setBool(uint32_t resourceId, bool v);
  void setInt(uint32_t resourceId, int32_t v);
  void setUint(uint32_t resourceId, uint32_t v);
  void setFloat(uint32_t resourceId, float v);
  void setString(uint32_t resourceId, const char* s);
  void setBytes(uint32_t resourceId, const uint8_t* data, size_t len);
  uint32_t generation() const { return _generation; }
  size_t size() const { return _count; }
  bool at(size_t index, ResourceValue& out) const;
private:
  ResourceValue _entries[kMaxEntries];
  size_t _count;
  uint32_t _generation;
  size_t findIndex(uint32_t resourceId) const;
  ResourceValue* upsert(uint32_t resourceId, ResourceValueKind kind);
};

}} // namespace
