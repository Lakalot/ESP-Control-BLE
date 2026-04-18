#include "CommandRegistry.h"

void CommandRegistry::registerCommand(uint8_t cmdId, EcbCommandFn callback) {
  if (!_entries.contains(cmdId) && _entries.full()) {
    return;
  }
  _entries[cmdId] = callback;
}

bool CommandRegistry::dispatch(uint8_t cmdId, const uint8_t* payload, uint8_t len, EcbNotifyFn notify) {
  auto it = _entries.find(cmdId);
  if (it == _entries.end()) {
    return false;
  }

  CmdContext ctx;
  ctx.cmdId   = cmdId;
  ctx.payload = payload;
  ctx.length  = len;
  ctx._notify = notify;
  it->second(ctx);
  return true;
}
