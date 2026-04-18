#pragma once
#include <stdint.h>
#include <vector>

#define CMD_TYPE_ACTION    0x01
#define CMD_TYPE_RANGE     0x02
#define CMD_TYPE_TOGGLE    0x03
#define CMD_TYPE_READ_ONLY 0x04
#define MANIFEST_VERSION   0x01

struct CommandDef {
  uint8_t     id;
  uint8_t     type;
  const char* name;
  int16_t     rangeMin;
  int16_t     rangeMax;
};

class ManifestBuilder {
public:
  void addCommand(uint8_t id, uint8_t type, const char* name,
                  int16_t rangeMin = 0, int16_t rangeMax = 0);
  std::vector<uint8_t> build() const;

private:
  std::vector<CommandDef> _commands;
};

extern ManifestBuilder manifestBuilder;
