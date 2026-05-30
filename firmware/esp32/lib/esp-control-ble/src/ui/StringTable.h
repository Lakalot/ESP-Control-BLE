#pragma once
#include <cstdint>
#include <string>
#include <unordered_map>
#include <vector>

namespace ecb { namespace ui {

/** Mirrors tools/manifest stringTable.ts: index 0 is "", intern in first-use
 *  order, dedup. internOptional("")/nullptr -> 0. The intern order MUST match
 *  the TS normalize traversal for byte-identical protobuf output. */
class StringTable {
public:
  StringTable() { intern(""); }
  uint32_t intern(const std::string& value) {
    auto it = index_.find(value);
    if (it != index_.end()) return it->second;
    const uint32_t next = static_cast<uint32_t>(list_.size());
    list_.push_back(value);
    index_.emplace(value, next);
    return next;
  }
  uint32_t internOptional(const char* value) {
    if (value == nullptr || value[0] == '\0') return 0;
    return intern(value);
  }
  uint32_t size() const { return static_cast<uint32_t>(list_.size()); }
  const char* at(uint32_t i) const { return list_[i].c_str(); }
  const std::vector<std::string>& items() const { return list_; }
private:
  std::unordered_map<std::string, uint32_t> index_;
  std::vector<std::string> list_;
};

}} // namespace ecb::ui
