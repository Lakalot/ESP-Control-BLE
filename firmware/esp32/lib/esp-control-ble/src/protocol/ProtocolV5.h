#pragma once
#include <stdint.h>

#define ECB_V5_SERVICE_UUID "12345678-1234-1234-1234-123456789abc"
#define ECB_V5_CMD_CHAR_UUID "12345678-1234-1234-1234-123456789abe"
#define ECB_V5_NOTIFY_CHAR_UUID "12345678-1234-1234-1234-123456789abd"
#define ECB_V5_DATA_CHAR_UUID "12345678-1234-1234-1234-123456789abf"

namespace ecb { namespace v5 {
static constexpr uint16_t kManifestChunkSize = 180;
static constexpr uint16_t kMaxFrameBody = 512;
}} // namespace
