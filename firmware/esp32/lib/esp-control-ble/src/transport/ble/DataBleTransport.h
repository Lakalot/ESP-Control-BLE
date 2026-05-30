#pragma once
#include <stddef.h>
#include <stdint.h>
#include "../../protocol/core/Protocol.h"
#include "../frame/DataFrameCodec.h"
#include "../../protocol/auth/AuthHandler.h"
#include "../../support/FreeRtosShim.h"

namespace ecb {

class ManifestStore;
class ResourceTable;
class SubscriptionState;
class ActionRegistry;

struct FrameSender {
  using SendFn = void (*)(void* context, const uint8_t* data, size_t len);

  void*  context = nullptr;
  SendFn send = nullptr;

  constexpr FrameSender() = default;
  constexpr FrameSender(void* contextIn, SendFn sendIn) : context(contextIn), send(sendIn) {}

  explicit operator bool() const { return send != nullptr; }

  void operator()(const uint8_t* data, size_t len) const {
    if (send != nullptr) send(context, data, len);
  }
};

class ProtocolEngine {
public:
  static constexpr size_t kFrameBufferSize = DataFrameCodec::kHeaderSize + kMaxFrameBody;
  static constexpr size_t kInvokeResultBufferSize = DataFrameCodec::kHeaderSize + 256u;
  static constexpr size_t kDeltaFrameBufferSize = DataFrameCodec::kHeaderSize + 128u;

  enum class Session : uint8_t { None = 0, Ble = 1, Spp = 2 };

  ProtocolEngine(const ManifestStore& store,
                 ResourceTable& table,
                 SubscriptionState& subs,
                 const ActionRegistry& registry,
                 AuthHandler& auth,
                 FrameSender sender);

  void handleFrame(FrameKind kind, const uint8_t* body, size_t len);

  // Route subsequent outbound frames to this sender (the active transport).
  void setSender(FrameSender sender);

  void sendManifest();
  void sendSnapshot();
  void sendDelta(uint32_t resourceId);
  void reset();
  void tick();

  // Session exclusivity. Returns false if another session is already active.
  bool beginSession(Session who);
  void endSession(Session who);

private:
  const ManifestStore&    _store;
  ResourceTable&          _table;
  SubscriptionState&      _subs;
  const ActionRegistry&   _registry;
  AuthHandler&            _auth;
  FrameSender             _sender;
  Session                 _activeSession = Session::None;
  volatile bool           _snapshotPending = false;
  uint64_t                _deltaPendingMask = 0;
  bool                    _manifestPending = false;
  size_t                  _manifestOffset = 0;
  SemaphoreHandle_t       _mutex;
  bool sendEncodedFrame(FrameKind kind, uint8_t flags, uint8_t* frame, size_t cap, size_t bodyLen);
  void sendFrame(FrameKind kind, uint8_t flags, const uint8_t* body, size_t len);
  void sendDeltaInternal(uint32_t resourceId);
  void handleAuthRequest();
  void handleAuthResponse(const uint8_t* body, size_t len);
};

} // namespace
