#pragma once

#include "protocol/CommandRegistry.h"
#include "protocol/Protocol.h"
#include <stdint.h>

struct CmdOption {
  uint8_t type;
  uint8_t len;
  union {
    const char* str;
    uint16_t    u16;
  } data;
};

struct CommandDef {
  uint8_t    id;
  uint8_t    type;
  const char* name;
  int16_t    rangeMin;
  int16_t    rangeMax;
  CmdOption  options[ECB_MAX_OPTIONS];
  uint8_t    optCount;
};

struct NodeOption {
  uint8_t type;
  uint8_t len;
  union {
    const char* str;
    uint8_t     u8;
  } data;
};

struct UiNodeDef {
  uint8_t   id;
  uint8_t   parentId;
  uint8_t   kind;
  uint8_t   refId;
  NodeOption options[ECB_MAX_NODE_OPTIONS];
  uint8_t   optCount;
};

typedef void (*EcbRegisterFn)(uint8_t cmdId, EcbCommandFn callback);

class ManifestBuilder;
class CommandBuilder;

class UiNodeBuilder {
public:
  UiNodeBuilder(ManifestBuilder* builder = nullptr,
                uint8_t nodeId = ECB_NODE_PARENT_NONE,
                uint8_t parentId = ECB_NODE_PARENT_NONE)
    : _builder(builder), _nodeId(nodeId), _parentId(parentId) {}

  UiNodeBuilder section(const char* title) const;
  UiNodeBuilder stack() const;
  UiNodeBuilder row() const;
  UiNodeBuilder grid(uint8_t columns = 2) const;
  UiNodeBuilder text(const char* value) const;
  UiNodeBuilder divider() const;

  CommandBuilder action(uint8_t cmdId, const char* name, EcbCommandFn cb = nullptr) const;
  CommandBuilder toggle(uint8_t cmdId, const char* name, EcbCommandFn cb = nullptr) const;
  CommandBuilder range(
    uint8_t cmdId, const char* name, int16_t min, int16_t max, EcbCommandFn cb = nullptr) const;
  CommandBuilder readOnly(uint8_t cmdId, const char* name, EcbCommandFn cb = nullptr) const;
  CommandBuilder textInput(uint8_t cmdId, const char* name, EcbCommandFn cb = nullptr) const;
  CommandBuilder colorPicker(uint8_t cmdId, const char* name, EcbCommandFn cb = nullptr) const;
  CommandBuilder xyPad(uint8_t cmdId, const char* name, EcbCommandFn cb = nullptr) const;
  CommandBuilder multiSelect(uint8_t cmdId, const char* name, EcbCommandFn cb = nullptr) const;
  CommandBuilder progress(uint8_t cmdId, const char* name, EcbCommandFn cb = nullptr) const;
  CommandBuilder command(uint8_t cmdId) const;

  UiNodeBuilder& withTitle(const char* title);
  UiNodeBuilder& withSubtitle(const char* subtitle);
  UiNodeBuilder& withColumns(uint8_t columns);
  UiNodeBuilder& withSpan(uint8_t span);
  UiNodeBuilder& withVariant(uint8_t variant);
  UiNodeBuilder& withStyle(uint8_t style);
  UiNodeBuilder& withCollapsed();
  UiNodeBuilder& withGap(uint8_t gap);
  UiNodeBuilder& withText(const char* text);

  UiNodeBuilder done() const;
  bool valid() const;
  bool isRoot() const { return _nodeId == ECB_NODE_PARENT_NONE; }
  uint8_t nodeId() const { return _nodeId; }

private:
  ManifestBuilder* _builder;
  uint8_t          _nodeId;
  uint8_t          _parentId;

  uint8_t currentParentId() const;
  void addStrOption(uint8_t optType, const char* str);
  void addU8Option(uint8_t optType, uint8_t value);
  void addFlagOption(uint8_t optType);
};

class CommandBuilder {
public:
  CommandBuilder(ManifestBuilder* builder = nullptr,
                 uint8_t commandIdx = 0xFF,
                 uint8_t nodeId = 0,
                 uint8_t parentId = ECB_NODE_PARENT_NONE)
    : _builder(builder), _commandIdx(commandIdx), _nodeId(nodeId), _parentId(parentId) {}

  CommandBuilder& withUnit(const char* unit);
  CommandBuilder& withIcon(const char* icon);
  CommandBuilder& withColor(const char* hex);
  CommandBuilder& withConfirm(const char* message);
  CommandBuilder& withRefreshMs(uint16_t ms);
  CommandBuilder& withStep(uint16_t step);
  CommandBuilder& withFormat(const char* fmt);
  CommandBuilder& withScale(uint16_t scale);
  CommandBuilder& withMinLabel(const char* label);
  CommandBuilder& withMaxLabel(const char* label);
  CommandBuilder& withDangerous();
  CommandBuilder& withDisabled();
  CommandBuilder& withBadge(const char* text);
  CommandBuilder& withChoices(const char* pipeSeparated);
  CommandBuilder& withHint(const char* text);

  CommandBuilder& withSpan(uint8_t span);
  CommandBuilder& withVariant(uint8_t variant);
  CommandBuilder& withStyle(uint8_t style);
  CommandBuilder& withTitle(const char* title);
  CommandBuilder& withSubtitle(const char* subtitle);

  UiNodeBuilder done() const;
  bool valid() const;

private:
  ManifestBuilder* _builder;
  uint8_t          _commandIdx;
  uint8_t          _nodeId;
  uint8_t          _parentId;

  void addStrOption(uint8_t optType, const char* str);
  void addU16Option(uint8_t optType, uint16_t val);
  void addFlagOption(uint8_t optType);
  void addNodeStrOption(uint8_t optType, const char* str);
  void addNodeU8Option(uint8_t optType, uint8_t value);
};

class ManifestBuilder {
public:
  explicit ManifestBuilder(EcbRegisterFn registerFn = nullptr)
    : _registerFn(registerFn) {}

  UiNodeBuilder ui();

  uint16_t build(uint8_t* outBuf, uint16_t bufSize) const;
  uint16_t measure() const;
  uint8_t  count() const { return _commandCount; }
  uint8_t  nodeCount() const { return _nodeCount; }

private:
  friend class UiNodeBuilder;
  friend class CommandBuilder;

  CommandDef* commandAt(uint8_t idx);
  UiNodeDef* nodeAtId(uint8_t nodeId);
  const CommandDef* commandAt(uint8_t idx) const;
  const UiNodeDef* nodeAtId(uint8_t nodeId) const;

  uint8_t indexOfCommand(uint8_t cmdId) const;
  uint8_t ensureCommand(uint8_t id, uint8_t type, const char* name,
                        int16_t rangeMin, int16_t rangeMax, EcbCommandFn cb);
  uint8_t appendNode(uint8_t parentId, uint8_t kind, uint8_t refId = ECB_NODE_REF_NONE);
  uint8_t parentOf(uint8_t nodeId) const;
  bool    isValidNodeKind(uint8_t kind) const;

  CommandDef _commands[ECB_MAX_COMMANDS] = {};
  UiNodeDef  _nodes[ECB_MAX_NODES] = {};
  uint8_t    _commandCount = 0;
  uint8_t    _nodeCount = 0;
  EcbRegisterFn _registerFn = nullptr;
};
