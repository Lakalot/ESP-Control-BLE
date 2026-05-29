#pragma once
#include <stddef.h>
#include <stdint.h>

namespace ecb {

// Minimal contract a transport implements. The transport owns the link to the
// remote client and forwards received bytes to the ProtocolEngine; the engine
// sends bytes back via the FrameSender the transport provides.
class ITransport {
public:
  virtual ~ITransport() = default;
  virtual void begin(const char* deviceName) = 0;
  // Push outbound, already-framed bytes to the connected client.
  virtual void send(const uint8_t* data, size_t len) = 0;
};

} // namespace ecb
