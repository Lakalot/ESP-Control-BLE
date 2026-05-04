#include "ActionRegistry.h"
#include <string.h>

namespace ecb {

ActionContext::ActionContext(uint32_t correlationId, ActionReplySink sink)
  : correlationId(correlationId), valueKind(ActionValueKind::None), boolValue(false),
    intValue(0), uintValue(0), floatValue(0.0f), stringValue{0}, sink(sink) {}

void ActionContext::replyOk(const uint8_t* data, size_t len) {
  *sink.replied = true;
  *sink.status = ActionStatus::Ok;
  if (len > 0 && data && sink.replyBuf && sink.replyCap >= len) {
    memcpy(sink.replyBuf, data, len);
    *sink.replyLen = len;
  } else {
    *sink.replyLen = 0;
  }
}

void ActionContext::replyError(ActionStatus s, const char* /*msg*/) {
  *sink.replied = true;
  *sink.status = s;
  *sink.replyLen = 0;
}

ActionRegistry::ActionRegistry() : _entries{} {}

RegisterResult ActionRegistry::tryRegisterAction(uint32_t actionId, ActionFn fn, void* context) {
  if (!fn) return RegisterResult::NullHandler;
  if (find(actionId)) return RegisterResult::Duplicate;
  for (auto& e : _entries) {
    if (!e.used) {
      e.used = true; e.actionId = actionId; e.handler = {fn, context}; return RegisterResult::Ok;
    }
  }
  return RegisterResult::TableFull;
}

const ActionHandler* ActionRegistry::find(uint32_t actionId) const {
  for (const auto& e : _entries) if (e.used && e.actionId == actionId) return &e.handler;
  return nullptr;
}

} // namespace
