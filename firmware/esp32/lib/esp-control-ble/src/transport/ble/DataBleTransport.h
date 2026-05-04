#pragma once
#include <stddef.h>
#include <stdint.h>
#include "../../protocol/core/Protocol.h"
#include "../../protocol/subscriptions/SubscriptionState.h"
#include "../../protocol/resources/ResourceTable.h"
#include "../frame/DataFrameCodec.h"

#ifdef UNIT_TEST

using SemaphoreHandle_t = void*;
constexpr int portMAX_DELAY = 0;
inline SemaphoreHandle_t xSemaphoreCreateMutex() { return nullptr; }
inline void xSemaphoreTake(SemaphoreHandle_t, int) {}
inline void xSemaphoreGive(SemaphoreHandle_t) {}

#else

#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>

#endif

namespace ecb {

class ManifestStore;
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

class DataBleTransport {
public:
  static constexpr size_t kFrameBufferSize = DataFrameCodec::kHeaderSize + kMaxFrameBody;
  static constexpr size_t kInvokeResultBufferSize = DataFrameCodec::kHeaderSize + kInvokeReplyFramedMax;
  static constexpr size_t kDeltaFrameBufferSize = DataFrameCodec::kHeaderSize + 128u;

  DataBleTransport(const ManifestStore& store,
                 ResourceTable<>& table,
                 SubscriptionState& subs,
                 const ActionRegistry& registry,
                 FrameSender sender);
  void handleFrame(FrameKind kind, const uint8_t* body, size_t len);
  void sendManifest();
  void sendSnapshot();
  void sendDelta(uint32_t resourceId);
  void reset();
  void tick();
private:
  const ManifestStore&    _store;
  ResourceTable<>&        _table;
  SubscriptionState&      _subs;
  const ActionRegistry&   _registry;
  FrameSender             _sender;
  volatile bool           _snapshotPending = false;
  static constexpr size_t kDeltaPendingBits = sizeof(uint64_t) * 8;
  static_assert(ecb::SubscriptionState::kMaxIds <= kDeltaPendingBits, "_deltaPendingMask must be widened if SubscriptionState::kMaxIds exceeds mask bits");
  uint64_t                _deltaPendingMask = 0;
  bool                    _manifestPending = false;
  size_t                  _manifestOffset = 0;
  SemaphoreHandle_t       _mutex;
  void sendDeltaInternal(uint32_t resourceId);
};

} // namespace
