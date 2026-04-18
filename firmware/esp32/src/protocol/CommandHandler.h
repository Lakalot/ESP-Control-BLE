#pragma once
#include <stdint.h>
#include <functional>

using NotifyCallback = std::function<void(const uint8_t* data, uint16_t len)>;
using CommandCallback = std::function<void(const uint8_t* payload, uint8_t len, NotifyCallback notify)>;

class CommandHandler {
public:
  void registerCommand(uint8_t cmdId, CommandCallback callback);
  void dispatch(uint8_t cmdId, const uint8_t* payload, uint8_t len, NotifyCallback notify);

private:
  struct CommandEntry {
    uint8_t id;
    CommandCallback callback;
  };
  CommandEntry _entries[32];
  uint8_t _count = 0;
};

extern CommandHandler commandHandler;

void sendOkResponse(uint8_t cmdId, const uint8_t* payload, uint8_t len, NotifyCallback notify);
void sendErrorResponse(uint8_t cmdId, uint8_t status, NotifyCallback notify);
