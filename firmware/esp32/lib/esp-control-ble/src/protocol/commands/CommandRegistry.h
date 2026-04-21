#pragma once

#include "../core/Protocol.h"
#include <stddef.h>
#include <stdint.h>
#include <string.h>

typedef void (*EcbNotifyFn)(const uint8_t* data, uint16_t len);

struct CmdContext {
  uint8_t        cmdId;
  const uint8_t* payload;
  uint8_t        length;
  EcbNotifyFn    _notify;

  int16_t readInt16(uint8_t offset = 0) const {
    if (offset + 2 > length) return 0;
    return (int16_t)((payload[offset] << 8) | payload[offset + 1]);
  }

  bool readRgb(uint8_t& r, uint8_t& g, uint8_t& b) const {
    if (length < 3) return false;
    r = payload[0];
    g = payload[1];
    b = payload[2];
    return true;
  }

  bool readXY(int16_t& x, int16_t& y) const {
    if (length < 4) return false;
    x = (int16_t)((payload[0] << 8) | payload[1]);
    y = (int16_t)((payload[2] << 8) | payload[3]);
    return true;
  }

  uint8_t readTextInput(char* buf, uint8_t maxLen) const {
    if (maxLen == 0) return 0;
    uint8_t n = length < (uint8_t)(maxLen - 1) ? length : (uint8_t)(maxLen - 1);
    for (uint8_t i = 0; i < n; i++) buf[i] = (char)payload[i];
    buf[n] = '\0';
    return n;
  }

  uint8_t readMultiSelect() const {
    if (length < 1) return 0;
    return payload[0];
  }

  void replyOk(const uint8_t* data = nullptr, uint8_t len = 0) const {
    static uint8_t buf[3 + ECB_MAX_PAYLOAD];
    buf[0] = cmdId;
    buf[1] = ECB_STATUS_OK;
    buf[2] = len;
    if (len > 0 && data) {
      memcpy(buf + 3, data, len);
    }
    _notify(buf, 3 + len);
  }

  void replyError(uint8_t status = ECB_STATUS_BAD_FRAME) const {
    uint8_t buf[3] = { cmdId, status, 0x00 };
    _notify(buf, 3);
  }

  void replyProgress(uint16_t pct) const {
    if (pct > 100) pct = 100;
    uint8_t buf[5];
    buf[0] = cmdId;
    buf[1] = ECB_STATUS_OK;
    buf[2] = 2;
    buf[3] = (uint8_t)((pct >> 8) & 0xFF);
    buf[4] = (uint8_t)(pct & 0xFF);
    _notify(buf, 5);
  }
};

typedef void (*EcbCommandFn)(CmdContext& ctx);

class CommandRegistry {
public:
  void registerCommand(uint8_t cmdId, EcbCommandFn callback);
  bool dispatch(uint8_t cmdId, const uint8_t* payload, uint8_t len, EcbNotifyFn notify);

private:
  struct Entry {
    uint8_t cmdId = 0;
    EcbCommandFn callback = nullptr;
    bool used = false;
  };

  Entry _entries[ECB_MAX_COMMANDS] = {};
};
