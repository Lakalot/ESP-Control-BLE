#pragma once
#include <stdint.h>
#include <stddef.h>
#include <functional>

namespace ecb { namespace v5 {

enum class ActionStatus : uint8_t {
  Unspecified = 0, Ok = 1, BadPayload = 2, UnknownAction = 3, Unauthorized = 4, Internal = 5,
};

struct ActionContext {
  uint32_t correlationId;
  const uint8_t* payload;
  size_t payloadLen;
  // reply sinks (set by ActionDecoder)
  bool*         replied;
  ActionStatus* status;
  uint8_t*      replyBuf;
  size_t        replyCap;
  size_t*       replyLen;
  void replyOk(const uint8_t* data, size_t len);
  void replyError(ActionStatus s, const char* msg);
};

using ActionHandler = std::function<void(ActionContext&)>;

class ActionRegistry {
public:
  static constexpr size_t kMaxHandlers = 32;
  ActionRegistry();
  bool registerAction(uint32_t actionId, ActionHandler handler);
  const ActionHandler* find(uint32_t actionId) const;
private:
  struct Entry { uint32_t actionId; ActionHandler handler; bool used; };
  Entry _entries[kMaxHandlers];
};

}} // namespace
