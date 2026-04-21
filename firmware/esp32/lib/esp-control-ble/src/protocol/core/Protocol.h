#pragma once
#include <stddef.h>
#include <stdint.h>

#define ECB_SERVICE_UUID       "12345678-1234-1234-1234-123456789abc"
#define ECB_MANIFEST_CHAR_UUID "12345678-1234-1234-1234-123456789abd"
#define ECB_CMD_CHAR_UUID      "12345678-1234-1234-1234-123456789abe"

// Data transport still uses distinct command and data characteristics on the
// shared service UUID, but the protocol constants now live in one header.
#define ECB_DATA_SERVICE_UUID ECB_SERVICE_UUID
#define ECB_DATA_CMD_CHAR_UUID ECB_CMD_CHAR_UUID
#define ECB_DATA_NOTIFY_CHAR_UUID ECB_MANIFEST_CHAR_UUID
#define ECB_DATA_DATA_CHAR_UUID "12345678-1234-1234-1234-123456789abf"

#define ECB_AUTH_CHALLENGE  0xF0
#define ECB_AUTH_OK         0xF1
#define ECB_AUTH_FAIL       0xF2

#define ECB_CMD_TYPE_ACTION       0x01
#define ECB_CMD_TYPE_RANGE        0x02
#define ECB_CMD_TYPE_TOGGLE       0x03
#define ECB_CMD_TYPE_READ_ONLY    0x04
#define ECB_CMD_TYPE_TEXT_INPUT   0x05
#define ECB_CMD_TYPE_COLOR_PICKER 0x06
#define ECB_CMD_TYPE_XY_PAD       0x07
#define ECB_CMD_TYPE_MULTI_SELECT 0x08
#define ECB_CMD_TYPE_PROGRESS     0x09

#define ECB_STATUS_OK           0x00
#define ECB_STATUS_NOT_AUTH     0x01
#define ECB_STATUS_UNKNOWN_CMD  0x02
#define ECB_STATUS_BAD_FRAME    0x03

#define ECB_MANIFEST_VERSION_4  0x04
#define ECB_MANIFEST_FLAG_CHUNKED 0x01

#define ECB_SYSTEM_CMD_MANIFEST_CHUNK 0xFE
#define ECB_MANIFEST_CHUNK_SIZE 180

#define ECB_NODE_KIND_SECTION   0x01
#define ECB_NODE_KIND_STACK     0x02
#define ECB_NODE_KIND_ROW       0x03
#define ECB_NODE_KIND_GRID      0x04
#define ECB_NODE_KIND_COMMAND   0x05
#define ECB_NODE_KIND_TEXT      0x06
#define ECB_NODE_KIND_DIVIDER   0x07

#define ECB_NODE_VARIANT_DEFAULT 0x00
#define ECB_NODE_VARIANT_CARD    0x01
#define ECB_NODE_VARIANT_COMPACT 0x02
#define ECB_NODE_VARIANT_HERO    0x03
#define ECB_NODE_VARIANT_INLINE  0x04

#define ECB_NODE_STYLE_DEFAULT  0x00
#define ECB_NODE_STYLE_SURFACE  0x01
#define ECB_NODE_STYLE_INSET    0x02
#define ECB_NODE_STYLE_TOOLBAR  0x03

#define ECB_NODE_PARENT_NONE    0xFF
#define ECB_NODE_REF_NONE       0xFF

#define ECB_OPT_UNIT       0x01
#define ECB_OPT_ICON       0x02
#define ECB_OPT_COLOR      0x03
#define ECB_OPT_CONFIRM    0x04
#define ECB_OPT_REFRESH_MS 0x05
#define ECB_OPT_STEP       0x06
#define ECB_OPT_FORMAT     0x07
#define ECB_OPT_SCALE      0x08
#define ECB_OPT_MIN_LABEL  0x09
#define ECB_OPT_MAX_LABEL  0x0A
#define ECB_OPT_DANGEROUS  0x0B
#define ECB_OPT_DISABLED   0x0C
#define ECB_OPT_BADGE      0x0D
#define ECB_OPT_CHOICES    0x0E
#define ECB_OPT_HINT       0x0F

#define ECB_NODE_OPT_TITLE      0x20
#define ECB_NODE_OPT_SUBTITLE   0x21
#define ECB_NODE_OPT_COLUMNS    0x22
#define ECB_NODE_OPT_SPAN       0x23
#define ECB_NODE_OPT_VARIANT    0x24
#define ECB_NODE_OPT_STYLE      0x25
#define ECB_NODE_OPT_COLLAPSED  0x26
#define ECB_NODE_OPT_GAP        0x27
#define ECB_NODE_OPT_TEXT       0x28

#define ECB_MAX_COMMANDS    32
#define ECB_MAX_NODES       64
#define ECB_MAX_OPTIONS     16
#define ECB_MAX_NODE_OPTIONS 8
#define ECB_MAX_PAYLOAD     64
#define ECB_NONCE_SIZE       4
#define ECB_HASH_SIZE        4

namespace ecb {

static constexpr size_t kManifestChunkSize = ECB_MANIFEST_CHUNK_SIZE;
static constexpr size_t kMaxFrameBody = 512;
static constexpr size_t kFrameHeaderSize = 4;

enum class FrameKind : uint8_t {
  ManifestChunk = 0x01,
  ManifestEof   = 0x02,
  Snapshot      = 0x10,
  Delta         = 0x11,
  InvokeAction  = 0x20,
  InvokeResult  = 0x21,
  Subscribe     = 0x30,
  Unsubscribe   = 0x31,
  Ping          = 0x32,
  Pong          = 0x33,
};

struct FrameHeader {
  FrameKind kind;
  uint8_t flags;
  uint16_t length;
};

} // namespace ecb
