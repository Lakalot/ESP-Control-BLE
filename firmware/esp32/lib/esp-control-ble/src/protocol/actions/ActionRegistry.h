#pragma once
#include <stdint.h>
#include <stddef.h>
#include <functional>
#include "../core/Protocol.h"

namespace ecb {

enum class ActionStatus : uint8_t {
  Unspecified = 0, Ok = 1, BadPayload = 2, UnknownAction = 3, Unauthorized = 4, Internal = 5,
};

// Which kind of value is present in ActionContext.value
enum class ActionValueKind : uint8_t {
  None = 0, Bool = 1, Int = 2, Uint = 3, Float = 4, String = 5,
};

struct ActionContext {
  uint32_t correlationId;

  // Typed value extracted from the InvokeAction.payload CommonValue.
  ActionValueKind valueKind;
  bool     boolValue;
  int32_t  intValue;
  uint32_t uintValue;
  float    floatValue;
  char     stringValue[kMaxResourceValueLen + 1];

  // Legacy raw bytes kept for backward compatibility (always nullptr now).
  const uint8_t* payload;
  size_t payloadLen;

  // reply sinks (set by ActionDecoder)
  bool*         replied;
  ActionStatus* status;
  uint8_t*      replyBuf;
  size_t        replyCap;
  size_t*       replyLen;

  bool hasValue() const { return valueKind != ActionValueKind::None; }
  void replyOk(const uint8_t* data, size_t len);
  void replyError(ActionStatus s, const char* msg);
};

using ActionHandler = std::function<void(ActionContext&)>;

class ActionRegistry {
public:
  static constexpr size_t kMaxHandlers = kMaxActions;
  ActionRegistry();
  bool registerAction(uint32_t actionId, ActionHandler handler);
  const ActionHandler* find(uint32_t actionId) const;
private:
  struct Entry { uint32_t actionId; ActionHandler handler; bool used; };
  Entry _entries[kMaxHandlers];
};

static_assert(ActionRegistry::kMaxHandlers == kMaxActions,
              "ActionRegistry capacity must match protocol max actions");

} // namespace
