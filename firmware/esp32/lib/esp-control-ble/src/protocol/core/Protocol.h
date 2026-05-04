#pragma once
#include <stddef.h>
#include <stdint.h>

#define ECB_SERVICE_UUID       "feccc3c2-7a95-4c26-91e6-f86158095207"
#define ECB_MANIFEST_CHAR_UUID "f99e14e3-b299-4545-8caa-6bc5adf3fe95"
#define ECB_CMD_CHAR_UUID      "8bf0baf5-fdba-4b82-99c6-6ae9e9c83952"

#define ECB_DATA_DATA_CHAR_UUID "fac1a3ac-23e4-4dc0-b78a-0722bea726e5"

#define ECB_AUTH_CHALLENGE  0xF0
#define ECB_AUTH_OK         0xF1
#define ECB_AUTH_FAIL       0xF2

#define ECB_MANIFEST_VERSION_4  0x04
#define ECB_MANIFEST_FLAG_CHUNKED 0x01
#define ECB_MANIFEST_CHUNK_SIZE 180

#define ECB_NONCE_SIZE       4
#define ECB_HASH_SIZE        4

#define ECB_MAX_RESOURCE_VALUE_LEN  64
#define ECB_INVOKE_REPLY_INNER_MAX  128
#define ECB_INVOKE_REPLY_FRAMED_MAX 256
#define ECB_SHA256_DIGEST_SIZE      32
#define ECB_SHA256_BLOCK_SIZE       64
#define ECB_SHA256_ROUND_COUNT      64
#define ECB_UUID_STRING_LEN         37

namespace ecb {

static constexpr size_t kManifestChunkSize = ECB_MANIFEST_CHUNK_SIZE;
static constexpr size_t kMaxFrameBody = 512;
static constexpr size_t kFrameHeaderSize = 4;
constexpr size_t kMaxResources         = 64;
constexpr size_t kMaxActions           = 32;
constexpr size_t kMaxResourceValueLen  = ECB_MAX_RESOURCE_VALUE_LEN;
constexpr size_t kInvokeReplyInnerMax  = ECB_INVOKE_REPLY_INNER_MAX;
constexpr size_t kInvokeReplyFramedMax = ECB_INVOKE_REPLY_FRAMED_MAX;

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
