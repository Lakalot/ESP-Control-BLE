#include "CommandRegistry.h"

void CommandRegistry::registerCommand(uint8_t cmdId, EcbCommandFn callback) {
  for (auto& entry : _entries) {
    if (entry.used && entry.cmdId == cmdId) {
      entry.callback = callback;
      return;
    }
  }

  for (auto& entry : _entries) {
    if (!entry.used) {
      entry.used = true;
      entry.cmdId = cmdId;
      entry.callback = callback;
      return;
    }
  }
}

bool CommandRegistry::dispatch(uint8_t cmdId, const uint8_t* payload, uint8_t len, EcbNotifyFn notify) {
  for (const auto& entry : _entries) {
    if (!entry.used || entry.cmdId != cmdId) {
      continue;
    }

    CmdContext ctx;
    ctx.cmdId   = cmdId;
    ctx.payload = payload;
    ctx.length  = len;
    ctx._notify = notify;
    entry.callback(ctx);
    return true;
  }

  return false;
}
