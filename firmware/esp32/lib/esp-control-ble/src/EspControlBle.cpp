#include "EspControlBle.h"
#include <Arduino.h>
#include <pgmspace.h>

namespace {
uint8_t readManifestByte(const uint8_t* manifestData, uint16_t offset) {
  return pgm_read_byte(manifestData + offset);
}

void logManifestSummary(const uint8_t* manifestData, uint16_t manifestLen) {
  if (manifestData == nullptr || manifestLen < 4) {
    Serial.printf("[ECB] Manifest invalid len=%u\n", manifestLen);
    return;
  }

  const uint8_t version = readManifestByte(manifestData, 0);
  const uint8_t commandCount = readManifestByte(manifestData, 2);
  uint16_t offset = 3;

  for (uint8_t commandIndex = 0; commandIndex < commandCount && offset < manifestLen; ++commandIndex) {
    if ((offset + 3) > manifestLen) {
      break;
    }

    const uint8_t type = readManifestByte(manifestData, offset + 1);
    const uint8_t nameLen = readManifestByte(manifestData, offset + 2);
    offset = (uint16_t)(offset + 3 + nameLen);

    if (type == ECB_CMD_TYPE_RANGE) {
      offset = (uint16_t)(offset + 4);
    }

    if (offset >= manifestLen) {
      break;
    }

    const uint8_t optCount = readManifestByte(manifestData, offset++);
    for (uint8_t optionIndex = 0; optionIndex < optCount && offset < manifestLen; ++optionIndex) {
      if ((offset + 2) > manifestLen) {
        offset = manifestLen;
        break;
      }

      const uint8_t optLen = readManifestByte(manifestData, offset + 1);
      offset = (uint16_t)(offset + 2 + optLen);
    }
  }

  const uint8_t nodeCount = offset < manifestLen ? readManifestByte(manifestData, offset) : 0;
  Serial.printf("[ECB] Manifest v%u: %u bytes, %u commands, %u nodes\n",
                version,
                manifestLen,
                commandCount,
                nodeCount);
}
} // namespace

EspControl::EspControl(const char* deviceName, const char* pin)
  : _deviceName(deviceName), _pin(pin) {}

void EspControl::registerCallback(uint8_t cmdId, EcbCommandFn callback) {
  _registry.registerCommand(cmdId, callback);
}

void EspControl::begin(const uint8_t* manifestData, uint16_t manifestLen) {
  _auth.setPin(_pin);
  logManifestSummary(manifestData, manifestLen);
  _transport.begin(_deviceName, &_auth, &_registry, manifestData, manifestLen);
}
