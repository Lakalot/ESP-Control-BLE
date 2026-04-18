#include "ManifestBuilder.h"

#include <string.h>

static uint8_t clampManifestStrLen(const char* str) {
  if (!str) return 0;

  size_t len = strlen(str);
  return len > 255 ? 255 : (uint8_t)len;
}

static bool isU16CommandOption(uint8_t optType) {
  return optType == ECB_OPT_REFRESH_MS ||
         optType == ECB_OPT_STEP ||
         optType == ECB_OPT_SCALE;
}

static bool isU8NodeOption(uint8_t optType) {
  return optType == ECB_NODE_OPT_COLUMNS ||
         optType == ECB_NODE_OPT_SPAN ||
         optType == ECB_NODE_OPT_VARIANT ||
         optType == ECB_NODE_OPT_STYLE ||
         optType == ECB_NODE_OPT_GAP;
}

CommandDef* ManifestBuilder::commandAt(uint8_t idx) {
  if (idx >= _commandCount) return nullptr;
  return &_commands[idx];
}

const CommandDef* ManifestBuilder::commandAt(uint8_t idx) const {
  if (idx >= _commandCount) return nullptr;
  return &_commands[idx];
}

UiNodeDef* ManifestBuilder::nodeAtId(uint8_t nodeId) {
  if (nodeId == 0 || nodeId == ECB_NODE_PARENT_NONE || nodeId > _nodeCount) return nullptr;
  return &_nodes[nodeId - 1];
}

const UiNodeDef* ManifestBuilder::nodeAtId(uint8_t nodeId) const {
  if (nodeId == 0 || nodeId == ECB_NODE_PARENT_NONE || nodeId > _nodeCount) return nullptr;
  return &_nodes[nodeId - 1];
}

uint8_t ManifestBuilder::indexOfCommand(uint8_t cmdId) const {
  for (uint8_t i = 0; i < _commandCount; i++) {
    if (_commands[i].id == cmdId) return i;
  }

  return 0xFF;
}

bool ManifestBuilder::isValidNodeKind(uint8_t kind) const {
  return kind == ECB_NODE_KIND_SECTION ||
         kind == ECB_NODE_KIND_STACK ||
         kind == ECB_NODE_KIND_ROW ||
         kind == ECB_NODE_KIND_GRID ||
         kind == ECB_NODE_KIND_COMMAND ||
         kind == ECB_NODE_KIND_TEXT ||
         kind == ECB_NODE_KIND_DIVIDER;
}

uint8_t ManifestBuilder::parentOf(uint8_t nodeId) const {
  if (nodeId == 0 || nodeId == ECB_NODE_PARENT_NONE) return ECB_NODE_PARENT_NONE;

  const UiNodeDef* node = nodeAtId(nodeId);
  return node ? node->parentId : ECB_NODE_PARENT_NONE;
}

uint8_t ManifestBuilder::ensureCommand(
  uint8_t id, uint8_t type, const char* name, int16_t rangeMin, int16_t rangeMax, EcbCommandFn cb) {
  uint8_t existingIdx = indexOfCommand(id);
  if (existingIdx != 0xFF) {
    CommandDef* existing = commandAt(existingIdx);
    if (!existing) return 0xFF;
    if (existing->type != type) return 0xFF;
    if (existing->type == ECB_CMD_TYPE_RANGE &&
        (existing->rangeMin != rangeMin || existing->rangeMax != rangeMax)) {
      return 0xFF;
    }
    if (name && existing->name && strcmp(existing->name, name) != 0) return 0xFF;
    if (_registerFn && cb) _registerFn(id, cb);
    return existingIdx;
  }

  if (_commandCount >= ECB_MAX_COMMANDS) return 0xFF;

  uint8_t idx = _commandCount++;
  CommandDef& cmd = _commands[idx];
  cmd.id = id;
  cmd.type = type;
  cmd.name = name ? name : "";
  cmd.rangeMin = rangeMin;
  cmd.rangeMax = rangeMax;
  cmd.optCount = 0;

  if (_registerFn && cb) _registerFn(id, cb);
  return idx;
}

uint8_t ManifestBuilder::appendNode(uint8_t parentId, uint8_t kind, uint8_t refId) {
  if (!isValidNodeKind(kind) || _nodeCount >= ECB_MAX_NODES) return 0;
  if (parentId != ECB_NODE_PARENT_NONE && !nodeAtId(parentId)) return 0;

  if (kind == ECB_NODE_KIND_COMMAND) {
    if (refId == ECB_NODE_REF_NONE || indexOfCommand(refId) == 0xFF) return 0;
  } else if (refId != ECB_NODE_REF_NONE) {
    return 0;
  }

  uint8_t nodeId = (uint8_t)(_nodeCount + 1);
  UiNodeDef& node = _nodes[_nodeCount++];
  node.id = nodeId;
  node.parentId = parentId;
  node.kind = kind;
  node.refId = refId;
  node.optCount = 0;
  return nodeId;
}

UiNodeBuilder ManifestBuilder::ui() {
  return UiNodeBuilder(this, ECB_NODE_PARENT_NONE, ECB_NODE_PARENT_NONE);
}

uint8_t UiNodeBuilder::currentParentId() const {
  if (!_builder) return ECB_NODE_PARENT_NONE;
  return isRoot() ? ECB_NODE_PARENT_NONE : _nodeId;
}

bool UiNodeBuilder::valid() const {
  return _builder != nullptr && (_nodeId == ECB_NODE_PARENT_NONE || _nodeId > 0);
}

void UiNodeBuilder::addStrOption(uint8_t optType, const char* str) {
  if (!valid() || isRoot() || !str) return;

  UiNodeDef* node = _builder->nodeAtId(_nodeId);
  if (!node || node->optCount >= ECB_MAX_NODE_OPTIONS) return;

  NodeOption& opt = node->options[node->optCount++];
  opt.type = optType;
  opt.len = clampManifestStrLen(str);
  opt.data.str = str;
}

void UiNodeBuilder::addU8Option(uint8_t optType, uint8_t value) {
  if (!valid() || isRoot()) return;

  UiNodeDef* node = _builder->nodeAtId(_nodeId);
  if (!node || node->optCount >= ECB_MAX_NODE_OPTIONS) return;

  NodeOption& opt = node->options[node->optCount++];
  opt.type = optType;
  opt.len = 1;
  opt.data.u8 = value;
}

void UiNodeBuilder::addFlagOption(uint8_t optType) {
  if (!valid() || isRoot()) return;

  UiNodeDef* node = _builder->nodeAtId(_nodeId);
  if (!node || node->optCount >= ECB_MAX_NODE_OPTIONS) return;

  NodeOption& opt = node->options[node->optCount++];
  opt.type = optType;
  opt.len = 0;
}

UiNodeBuilder UiNodeBuilder::section(const char* title) const {
  uint8_t parentId = currentParentId();
  uint8_t nodeId = _builder ? _builder->appendNode(parentId, ECB_NODE_KIND_SECTION) : 0;
  UiNodeBuilder node(_builder, nodeId, parentId);
  node.withTitle(title);
  return node;
}

UiNodeBuilder UiNodeBuilder::stack() const {
  uint8_t parentId = currentParentId();
  return UiNodeBuilder(_builder,
                       _builder ? _builder->appendNode(parentId, ECB_NODE_KIND_STACK) : 0,
                       parentId);
}

UiNodeBuilder UiNodeBuilder::row() const {
  uint8_t parentId = currentParentId();
  return UiNodeBuilder(_builder,
                       _builder ? _builder->appendNode(parentId, ECB_NODE_KIND_ROW) : 0,
                       parentId);
}

UiNodeBuilder UiNodeBuilder::grid(uint8_t columns) const {
  uint8_t parentId = currentParentId();
  UiNodeBuilder node(_builder,
                     _builder ? _builder->appendNode(parentId, ECB_NODE_KIND_GRID) : 0,
                     parentId);
  node.withColumns(columns);
  return node;
}

UiNodeBuilder UiNodeBuilder::text(const char* value) const {
  uint8_t parentId = currentParentId();
  UiNodeBuilder node(_builder,
                     _builder ? _builder->appendNode(parentId, ECB_NODE_KIND_TEXT) : 0,
                     parentId);
  node.withText(value);
  return node;
}

UiNodeBuilder UiNodeBuilder::divider() const {
  uint8_t parentId = currentParentId();
  return UiNodeBuilder(_builder,
                       _builder ? _builder->appendNode(parentId, ECB_NODE_KIND_DIVIDER) : 0,
                       parentId);
}

CommandBuilder UiNodeBuilder::action(uint8_t cmdId, const char* name, EcbCommandFn cb) const {
  uint8_t parentId = currentParentId();
  uint8_t cmdIdx = _builder ? _builder->ensureCommand(cmdId, ECB_CMD_TYPE_ACTION, name, 0, 0, cb) : 0xFF;
  if (!_builder || cmdIdx == 0xFF) return CommandBuilder(_builder, 0xFF, 0, parentId);
  uint8_t nodeId = _builder->appendNode(parentId, ECB_NODE_KIND_COMMAND, cmdId);
  return CommandBuilder(_builder, cmdIdx, nodeId, parentId);
}

CommandBuilder UiNodeBuilder::toggle(uint8_t cmdId, const char* name, EcbCommandFn cb) const {
  uint8_t parentId = currentParentId();
  uint8_t cmdIdx = _builder ? _builder->ensureCommand(cmdId, ECB_CMD_TYPE_TOGGLE, name, 0, 0, cb) : 0xFF;
  if (!_builder || cmdIdx == 0xFF) return CommandBuilder(_builder, 0xFF, 0, parentId);
  uint8_t nodeId = _builder->appendNode(parentId, ECB_NODE_KIND_COMMAND, cmdId);
  return CommandBuilder(_builder, cmdIdx, nodeId, parentId);
}

CommandBuilder UiNodeBuilder::range(
  uint8_t cmdId, const char* name, int16_t min, int16_t max, EcbCommandFn cb) const {
  uint8_t parentId = currentParentId();
  uint8_t cmdIdx = _builder ? _builder->ensureCommand(cmdId, ECB_CMD_TYPE_RANGE, name, min, max, cb) : 0xFF;
  if (!_builder || cmdIdx == 0xFF) return CommandBuilder(_builder, 0xFF, 0, parentId);
  uint8_t nodeId = _builder->appendNode(parentId, ECB_NODE_KIND_COMMAND, cmdId);
  return CommandBuilder(_builder, cmdIdx, nodeId, parentId);
}

CommandBuilder UiNodeBuilder::readOnly(uint8_t cmdId, const char* name, EcbCommandFn cb) const {
  uint8_t parentId = currentParentId();
  uint8_t cmdIdx = _builder ? _builder->ensureCommand(cmdId, ECB_CMD_TYPE_READ_ONLY, name, 0, 0, cb) : 0xFF;
  if (!_builder || cmdIdx == 0xFF) return CommandBuilder(_builder, 0xFF, 0, parentId);
  uint8_t nodeId = _builder->appendNode(parentId, ECB_NODE_KIND_COMMAND, cmdId);
  return CommandBuilder(_builder, cmdIdx, nodeId, parentId);
}

CommandBuilder UiNodeBuilder::textInput(uint8_t cmdId, const char* name, EcbCommandFn cb) const {
  uint8_t parentId = currentParentId();
  uint8_t cmdIdx = _builder ? _builder->ensureCommand(cmdId, ECB_CMD_TYPE_TEXT_INPUT, name, 0, 0, cb) : 0xFF;
  if (!_builder || cmdIdx == 0xFF) return CommandBuilder(_builder, 0xFF, 0, parentId);
  uint8_t nodeId = _builder->appendNode(parentId, ECB_NODE_KIND_COMMAND, cmdId);
  return CommandBuilder(_builder, cmdIdx, nodeId, parentId);
}

CommandBuilder UiNodeBuilder::colorPicker(
  uint8_t cmdId, const char* name, EcbCommandFn cb) const {
  uint8_t parentId = currentParentId();
  uint8_t cmdIdx = _builder ? _builder->ensureCommand(cmdId, ECB_CMD_TYPE_COLOR_PICKER, name, 0, 0, cb) : 0xFF;
  if (!_builder || cmdIdx == 0xFF) return CommandBuilder(_builder, 0xFF, 0, parentId);
  uint8_t nodeId = _builder->appendNode(parentId, ECB_NODE_KIND_COMMAND, cmdId);
  return CommandBuilder(_builder, cmdIdx, nodeId, parentId);
}

CommandBuilder UiNodeBuilder::xyPad(uint8_t cmdId, const char* name, EcbCommandFn cb) const {
  uint8_t parentId = currentParentId();
  uint8_t cmdIdx = _builder ? _builder->ensureCommand(cmdId, ECB_CMD_TYPE_XY_PAD, name, 0, 0, cb) : 0xFF;
  if (!_builder || cmdIdx == 0xFF) return CommandBuilder(_builder, 0xFF, 0, parentId);
  uint8_t nodeId = _builder->appendNode(parentId, ECB_NODE_KIND_COMMAND, cmdId);
  return CommandBuilder(_builder, cmdIdx, nodeId, parentId);
}

CommandBuilder UiNodeBuilder::multiSelect(
  uint8_t cmdId, const char* name, EcbCommandFn cb) const {
  uint8_t parentId = currentParentId();
  uint8_t cmdIdx = _builder ? _builder->ensureCommand(cmdId, ECB_CMD_TYPE_MULTI_SELECT, name, 0, 0, cb) : 0xFF;
  if (!_builder || cmdIdx == 0xFF) return CommandBuilder(_builder, 0xFF, 0, parentId);
  uint8_t nodeId = _builder->appendNode(parentId, ECB_NODE_KIND_COMMAND, cmdId);
  return CommandBuilder(_builder, cmdIdx, nodeId, parentId);
}

CommandBuilder UiNodeBuilder::progress(uint8_t cmdId, const char* name, EcbCommandFn cb) const {
  uint8_t parentId = currentParentId();
  uint8_t cmdIdx = _builder ? _builder->ensureCommand(cmdId, ECB_CMD_TYPE_PROGRESS, name, 0, 0, cb) : 0xFF;
  if (!_builder || cmdIdx == 0xFF) return CommandBuilder(_builder, 0xFF, 0, parentId);
  uint8_t nodeId = _builder->appendNode(parentId, ECB_NODE_KIND_COMMAND, cmdId);
  return CommandBuilder(_builder, cmdIdx, nodeId, parentId);
}

CommandBuilder UiNodeBuilder::command(uint8_t cmdId) const {
  uint8_t parentId = currentParentId();
  uint8_t cmdIdx = _builder ? _builder->indexOfCommand(cmdId) : 0xFF;
  if (!_builder || cmdIdx == 0xFF) return CommandBuilder(_builder, 0xFF, 0, parentId);
  uint8_t nodeId = _builder->appendNode(parentId, ECB_NODE_KIND_COMMAND, cmdId);
  return CommandBuilder(_builder, cmdIdx, nodeId, parentId);
}

UiNodeBuilder& UiNodeBuilder::withTitle(const char* title) {
  addStrOption(ECB_NODE_OPT_TITLE, title);
  return *this;
}

UiNodeBuilder& UiNodeBuilder::withSubtitle(const char* subtitle) {
  addStrOption(ECB_NODE_OPT_SUBTITLE, subtitle);
  return *this;
}

UiNodeBuilder& UiNodeBuilder::withColumns(uint8_t columns) {
  addU8Option(ECB_NODE_OPT_COLUMNS, columns == 0 ? 1 : columns);
  return *this;
}

UiNodeBuilder& UiNodeBuilder::withSpan(uint8_t span) {
  addU8Option(ECB_NODE_OPT_SPAN, span == 0 ? 1 : span);
  return *this;
}

UiNodeBuilder& UiNodeBuilder::withVariant(uint8_t variant) {
  addU8Option(ECB_NODE_OPT_VARIANT, variant);
  return *this;
}

UiNodeBuilder& UiNodeBuilder::withStyle(uint8_t style) {
  addU8Option(ECB_NODE_OPT_STYLE, style);
  return *this;
}

UiNodeBuilder& UiNodeBuilder::withCollapsed() {
  addFlagOption(ECB_NODE_OPT_COLLAPSED);
  return *this;
}

UiNodeBuilder& UiNodeBuilder::withGap(uint8_t gap) {
  addU8Option(ECB_NODE_OPT_GAP, gap);
  return *this;
}

UiNodeBuilder& UiNodeBuilder::withText(const char* text) {
  addStrOption(ECB_NODE_OPT_TEXT, text);
  return *this;
}

UiNodeBuilder UiNodeBuilder::done() const {
  if (!_builder) return UiNodeBuilder();
  if (_parentId == ECB_NODE_PARENT_NONE) {
    return UiNodeBuilder(_builder, ECB_NODE_PARENT_NONE, ECB_NODE_PARENT_NONE);
  }

  return UiNodeBuilder(_builder, _parentId, _builder->parentOf(_parentId));
}

bool CommandBuilder::valid() const {
  return _builder != nullptr && _commandIdx != 0xFF && _nodeId > 0;
}

void CommandBuilder::addStrOption(uint8_t optType, const char* str) {
  if (!valid() || !str) return;

  CommandDef* cmd = _builder->commandAt(_commandIdx);
  if (!cmd || cmd->optCount >= ECB_MAX_OPTIONS) return;

  CmdOption& opt = cmd->options[cmd->optCount++];
  opt.type = optType;
  opt.len = clampManifestStrLen(str);
  opt.data.str = str;
}

void CommandBuilder::addU16Option(uint8_t optType, uint16_t val) {
  if (!valid()) return;

  CommandDef* cmd = _builder->commandAt(_commandIdx);
  if (!cmd || cmd->optCount >= ECB_MAX_OPTIONS) return;

  CmdOption& opt = cmd->options[cmd->optCount++];
  opt.type = optType;
  opt.len = 2;
  opt.data.u16 = val;
}

void CommandBuilder::addFlagOption(uint8_t optType) {
  if (!valid()) return;

  CommandDef* cmd = _builder->commandAt(_commandIdx);
  if (!cmd || cmd->optCount >= ECB_MAX_OPTIONS) return;

  CmdOption& opt = cmd->options[cmd->optCount++];
  opt.type = optType;
  opt.len = 0;
}

void CommandBuilder::addNodeStrOption(uint8_t optType, const char* str) {
  if (!valid() || !str) return;

  UiNodeDef* node = _builder->nodeAtId(_nodeId);
  if (!node || node->optCount >= ECB_MAX_NODE_OPTIONS) return;

  NodeOption& opt = node->options[node->optCount++];
  opt.type = optType;
  opt.len = clampManifestStrLen(str);
  opt.data.str = str;
}

void CommandBuilder::addNodeU8Option(uint8_t optType, uint8_t value) {
  if (!valid()) return;

  UiNodeDef* node = _builder->nodeAtId(_nodeId);
  if (!node || node->optCount >= ECB_MAX_NODE_OPTIONS) return;

  NodeOption& opt = node->options[node->optCount++];
  opt.type = optType;
  opt.len = 1;
  opt.data.u8 = value;
}

CommandBuilder& CommandBuilder::withUnit(const char* unit) {
  addStrOption(ECB_OPT_UNIT, unit);
  return *this;
}

CommandBuilder& CommandBuilder::withIcon(const char* icon) {
  addStrOption(ECB_OPT_ICON, icon);
  return *this;
}

CommandBuilder& CommandBuilder::withColor(const char* hex) {
  addStrOption(ECB_OPT_COLOR, hex);
  return *this;
}

CommandBuilder& CommandBuilder::withConfirm(const char* message) {
  addStrOption(ECB_OPT_CONFIRM, message);
  return *this;
}

CommandBuilder& CommandBuilder::withRefreshMs(uint16_t ms) {
  addU16Option(ECB_OPT_REFRESH_MS, ms);
  return *this;
}

CommandBuilder& CommandBuilder::withStep(uint16_t step) {
  addU16Option(ECB_OPT_STEP, step);
  return *this;
}

CommandBuilder& CommandBuilder::withFormat(const char* fmt) {
  addStrOption(ECB_OPT_FORMAT, fmt);
  return *this;
}

CommandBuilder& CommandBuilder::withScale(uint16_t scale) {
  addU16Option(ECB_OPT_SCALE, scale);
  return *this;
}

CommandBuilder& CommandBuilder::withMinLabel(const char* label) {
  addStrOption(ECB_OPT_MIN_LABEL, label);
  return *this;
}

CommandBuilder& CommandBuilder::withMaxLabel(const char* label) {
  addStrOption(ECB_OPT_MAX_LABEL, label);
  return *this;
}

CommandBuilder& CommandBuilder::withDangerous() {
  addFlagOption(ECB_OPT_DANGEROUS);
  return *this;
}

CommandBuilder& CommandBuilder::withDisabled() {
  addFlagOption(ECB_OPT_DISABLED);
  return *this;
}

CommandBuilder& CommandBuilder::withBadge(const char* text) {
  addStrOption(ECB_OPT_BADGE, text);
  return *this;
}

CommandBuilder& CommandBuilder::withChoices(const char* pipeSeparated) {
  addStrOption(ECB_OPT_CHOICES, pipeSeparated);
  return *this;
}

CommandBuilder& CommandBuilder::withHint(const char* text) {
  addStrOption(ECB_OPT_HINT, text);
  return *this;
}

CommandBuilder& CommandBuilder::withSpan(uint8_t span) {
  addNodeU8Option(ECB_NODE_OPT_SPAN, span == 0 ? 1 : span);
  return *this;
}

CommandBuilder& CommandBuilder::withVariant(uint8_t variant) {
  addNodeU8Option(ECB_NODE_OPT_VARIANT, variant);
  return *this;
}

CommandBuilder& CommandBuilder::withStyle(uint8_t style) {
  addNodeU8Option(ECB_NODE_OPT_STYLE, style);
  return *this;
}

CommandBuilder& CommandBuilder::withTitle(const char* title) {
  addNodeStrOption(ECB_NODE_OPT_TITLE, title);
  return *this;
}

CommandBuilder& CommandBuilder::withSubtitle(const char* subtitle) {
  addNodeStrOption(ECB_NODE_OPT_SUBTITLE, subtitle);
  return *this;
}

UiNodeBuilder CommandBuilder::done() const {
  if (!_builder) return UiNodeBuilder();
  if (_parentId == ECB_NODE_PARENT_NONE) {
    return UiNodeBuilder(_builder, ECB_NODE_PARENT_NONE, ECB_NODE_PARENT_NONE);
  }

  return UiNodeBuilder(_builder, _parentId, _builder->parentOf(_parentId));
}

uint16_t ManifestBuilder::measure() const {
  uint16_t totalSize = 4;

  for (uint8_t c = 0; c < _commandCount; c++) {
    const CommandDef& cmd = _commands[c];
    totalSize += 4 + clampManifestStrLen(cmd.name);
    if (cmd.type == ECB_CMD_TYPE_RANGE) totalSize += 4;

    for (uint8_t o = 0; o < cmd.optCount; o++) {
      totalSize += 2 + cmd.options[o].len;
    }
  }

  for (uint8_t n = 0; n < _nodeCount; n++) {
    const UiNodeDef& node = _nodes[n];
    totalSize += 5;

    for (uint8_t o = 0; o < node.optCount; o++) {
      totalSize += 2 + node.options[o].len;
    }
  }

  return totalSize;
}

uint16_t ManifestBuilder::build(uint8_t* outBuf, uint16_t bufSize) const {
  uint16_t totalSize = measure();
  if (!outBuf) return totalSize;
  if (totalSize > bufSize) return 0;

  uint16_t pos = 0;
  outBuf[pos++] = ECB_MANIFEST_VERSION_4;
  outBuf[pos++] = 0x00;
  outBuf[pos++] = _commandCount;

  for (uint8_t c = 0; c < _commandCount; c++) {
    const CommandDef& cmd = _commands[c];
    uint8_t nameLen = clampManifestStrLen(cmd.name);

    outBuf[pos++] = cmd.id;
    outBuf[pos++] = cmd.type;
    outBuf[pos++] = nameLen;
    if (nameLen > 0) memcpy(outBuf + pos, cmd.name, nameLen);
    pos += nameLen;

    if (cmd.type == ECB_CMD_TYPE_RANGE) {
      outBuf[pos++] = (uint8_t)((cmd.rangeMin >> 8) & 0xFF);
      outBuf[pos++] = (uint8_t)(cmd.rangeMin & 0xFF);
      outBuf[pos++] = (uint8_t)((cmd.rangeMax >> 8) & 0xFF);
      outBuf[pos++] = (uint8_t)(cmd.rangeMax & 0xFF);
    }

    outBuf[pos++] = cmd.optCount;
    for (uint8_t o = 0; o < cmd.optCount; o++) {
      const CmdOption& opt = cmd.options[o];
      outBuf[pos++] = opt.type;
      outBuf[pos++] = opt.len;
      if (opt.len == 0) continue;

      if (isU16CommandOption(opt.type)) {
        outBuf[pos++] = (uint8_t)((opt.data.u16 >> 8) & 0xFF);
        outBuf[pos++] = (uint8_t)(opt.data.u16 & 0xFF);
      } else {
        memcpy(outBuf + pos, opt.data.str, opt.len);
        pos += opt.len;
      }
    }
  }

  outBuf[pos++] = _nodeCount;

  for (uint8_t n = 0; n < _nodeCount; n++) {
    const UiNodeDef& node = _nodes[n];

    outBuf[pos++] = node.id;
    outBuf[pos++] = node.parentId;
    outBuf[pos++] = node.kind;
    outBuf[pos++] = node.refId;
    outBuf[pos++] = node.optCount;

    for (uint8_t o = 0; o < node.optCount; o++) {
      const NodeOption& opt = node.options[o];
      outBuf[pos++] = opt.type;
      outBuf[pos++] = opt.len;
      if (opt.len == 0) continue;

      if (isU8NodeOption(opt.type)) {
        outBuf[pos++] = opt.data.u8;
      } else {
        memcpy(outBuf + pos, opt.data.str, opt.len);
        pos += opt.len;
      }
    }
  }

  return pos;
}
