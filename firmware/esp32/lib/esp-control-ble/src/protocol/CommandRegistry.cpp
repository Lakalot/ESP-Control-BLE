#include "CommandRegistry.h"

void CommandRegistry::registerCommand(uint8_t cmdId, EcbCommandFn callback) {
  for (uint8_t i = 0; i < _count; i++) {
    if (_entries[i].id == cmdId) {
      _entries[i].callback = callback;
      return;
    }
  }

  if (_count >= ECB_MAX_COMMANDS) return;
  _entries[_count++] = { cmdId, callback };
}

bool CommandRegistry::dispatch(uint8_t cmdId, const uint8_t* payload, uint8_t len, EcbNotifyFn notify) {
  for (uint8_t i = 0; i < _count; i++) {
    if (_entries[i].id == cmdId) {
      CmdContext ctx;
      ctx.cmdId   = cmdId;
      ctx.payload = payload;
      ctx.length  = len;
      ctx._notify = notify;
      _entries[i].callback(ctx);
      return true;
    }
  }
  return false;
}
