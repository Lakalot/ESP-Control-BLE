#pragma once
#include <stddef.h>
#include <stdint.h>
#include "../../protocol/core/Protocol.h"

namespace ecb {

using FrameSender = void (*)(void* context, const uint8_t* data, size_t len);
using FrameCallback = void (*)(FrameKind kind, const uint8_t* body, size_t len, void* context);

class DataBleTransport {
public:
  DataBleTransport(FrameSender sender, void* senderContext,
                   FrameCallback callback, void* callbackContext);
  void onRawFrame(const uint8_t* data, size_t len);

private:
  FrameSender _sender;
  void* _senderContext;
  FrameCallback _callback;
  void* _callbackContext;
};

} // namespace