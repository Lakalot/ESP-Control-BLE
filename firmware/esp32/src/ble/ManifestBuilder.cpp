#include "ManifestBuilder.h"
#include <string.h>

ManifestBuilder manifestBuilder;

void ManifestBuilder::addCommand(uint8_t id, uint8_t type, const char* name,
                                  int16_t rangeMin, int16_t rangeMax) {
  _commands.push_back({ id, type, name, rangeMin, rangeMax });
}

std::vector<uint8_t> ManifestBuilder::build() const {
  std::vector<uint8_t> buf;
  buf.push_back(MANIFEST_VERSION);
  buf.push_back((uint8_t)_commands.size());

  for (const auto& cmd : _commands) {
    buf.push_back(cmd.id);
    buf.push_back(cmd.type);
    uint8_t nameLen = (uint8_t)strlen(cmd.name);
    buf.push_back(nameLen);
    for (uint8_t i = 0; i < nameLen; i++) {
      buf.push_back((uint8_t)cmd.name[i]);
    }
    if (cmd.type == CMD_TYPE_RANGE) {
      buf.push_back((uint8_t)((cmd.rangeMin >> 8) & 0xFF));
      buf.push_back((uint8_t)(cmd.rangeMin & 0xFF));
      buf.push_back((uint8_t)((cmd.rangeMax >> 8) & 0xFF));
      buf.push_back((uint8_t)(cmd.rangeMax & 0xFF));
    }
  }
  return buf;
}
