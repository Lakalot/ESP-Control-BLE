#pragma once
#include <cstdint>
#include <string>
#include <vector>
#include <algorithm>

namespace ecb { namespace ui {

// Shared 1-based, sort-by-id assignment (ported from assignIds.ts). The id of a
// slug is its 1-based position in the ASCENDING-sorted slug list. This is
// order-independent: a pure function of the SET of slugs. EmitterUi (host) and
// RuntimeUi (ESP) both build the same IdMap over the same per-kind slug set, so
// the ids they compute match exactly -- the critical invariant that the tablet's
// manifest ids equal the ESP's handler/resource ids.
//
// GCC 5.1 native-toolchain safe: only std::vector / std::string / std::sort /
// std::lower_bound (no optional/variant/structured-bindings/if-constexpr).
class IdMap {
public:
  // Build the sorted slug list. Duplicates (if any) are kept; lower_bound finds
  // the first occurrence, matching the TS behavior for a de-duplicated set.
  void build(const std::vector<std::string>& slugs) {
    sorted_ = slugs;
    std::sort(sorted_.begin(), sorted_.end());
  }

  // 1-based index of slug in the sorted list; 0 if absent.
  uint32_t idOf(const std::string& slug) const {
    std::vector<std::string>::const_iterator it =
        std::lower_bound(sorted_.begin(), sorted_.end(), slug);
    if (it == sorted_.end() || *it != slug) return 0u;
    return static_cast<uint32_t>((it - sorted_.begin()) + 1);
  }

private:
  std::vector<std::string> sorted_;
};

}} // namespace ecb::ui
