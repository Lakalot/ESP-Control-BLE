#pragma once
#include <stddef.h>
#include <stdint.h>

#define ECB_SERVICE_UUID       "feccc3c2-7a95-4c26-91e6-f86158095207"
#define ECB_MANIFEST_CHAR_UUID "f99e14e3-b299-4545-8caa-6bc5adf3fe95"

// The transport exposes two characteristics on the service UUID: a read-only
// manifest characteristic (discovery) and a write/notify data characteristic
// that carries the auth handshake and all protocol frames.
#define ECB_DATA_SERVICE_UUID ECB_SERVICE_UUID
#define ECB_DATA_DATA_CHAR_UUID "fac1a3ac-23e4-4dc0-b78a-0722bea726e5"

// Manifest chunking: the manifest characteristic streams in fixed-size chunks.
#define ECB_MANIFEST_CHUNK_SIZE 180

// Auth handshake sizes: nonce challenge + truncated SHA-256 response.
#define ECB_NONCE_SIZE      16
#define ECB_HASH_SIZE       16

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
  AuthRequest   = 0x40,
  AuthChallenge = 0x41,
  AuthResponse  = 0x42,
  AuthResult    = 0x43,
};

struct FrameHeader {
  FrameKind kind;
  uint8_t flags;
  uint16_t length;
};

} // namespace ecb
