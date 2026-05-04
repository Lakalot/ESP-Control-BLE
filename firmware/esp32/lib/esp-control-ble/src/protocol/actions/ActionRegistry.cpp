#include "ActionRegistry.h"
#include <string.h>

namespace ecb {

void ActionContext::replyOk(const uint8_t* data, size_t len) {
  *replied = true;
  *status = ActionStatus::Ok;
  if (len > 0 && data && replyBuf && replyCap >= len) {
    memcpy(replyBuf, data, len);
    *replyLen = len;
  } else {
    *replyLen = 0;
  }
}

void ActionContext::replyError(ActionStatus s, const char* /*msg*/) {
  *replied = true;
  *status = s;
  *replyLen = 0;
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
