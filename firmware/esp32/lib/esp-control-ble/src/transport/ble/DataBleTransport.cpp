#include "DataBleTransport.h"

#ifdef UNIT_TEST

#include <string.h>
#include <pb_decode.h>

#else

#include <Arduino.h>
#include <string.h>

#endif

#include "../../protocol/core/Protocol.h"
#include "../frame/DataFrameCodec.h"
#include "../../protocol/manifest/ManifestStore.h"
#include <pb_decode.h>
#include "../../nanopb/manifest.pb.h"
#include "../../protocol/resources/ResourceTable.h"
#include "../../protocol/subscriptions/SubscriptionState.h"
#include "../../protocol/actions/ActionRegistry.h"
#include "../../protocol/actions/ActionDecoder.h"
#include "../../protocol/snapshot/SnapshotEncoder.h"
#include "../../support/EcbLogging.h"

namespace ecb {

DataBleTransport::DataBleTransport(const ManifestStore& s, ResourceTable& t,
                               SubscriptionState& su, const ActionRegistry& r,
                               FrameSender sender)
  : _store(s), _table(t), _subs(su), _registry(r), _sender(sender) {
    _mutex = xSemaphoreCreateMutex();
    if (_mutex == nullptr) {
      // Allocation only fails on heap exhaustion at boot. Without the mutex
      // every take/give silently no-ops and cross-task access is unprotected,
      // so surface it loudly rather than running races undiagnosed.
      ECB_LOGF("[ECB DATA] FATAL: mutex allocation failed\n");
    }
}

bool DataBleTransport::sendEncodedFrame(FrameKind kind, uint8_t flags,
                                      uint8_t* frame, size_t cap, size_t bodyLen) {
  if (!_sender || bodyLen > kMaxFrameBody) return false;
  if (cap < DataFrameCodec::kHeaderSize + bodyLen) return false;

  FrameHeader header{kind, flags, static_cast<uint16_t>(bodyLen)};
  const size_t headerLen = DataFrameCodec::encodeHeader(header, frame, DataFrameCodec::kHeaderSize);
  if (headerLen != DataFrameCodec::kHeaderSize) return false;

  _sender(frame, headerLen + bodyLen);
  return true;
}

void DataBleTransport::sendFrame(FrameKind kind, uint8_t flags, const uint8_t* body, size_t len) {
  if (!_sender) return;
  uint8_t buf[kFrameBufferSize];
  if (len > kMaxFrameBody) return;
  if (body && len) memcpy(buf + DataFrameCodec::kHeaderSize, body, len);
  sendEncodedFrame(kind, flags, buf, sizeof(buf), len);
}

struct SubDecodeCtx { SubscriptionState* subs; bool add; };
static bool decodeResourceIds(pb_istream_t* stream, const pb_field_t* /*field*/, void** arg) {
  SubDecodeCtx* ctx = static_cast<SubDecodeCtx*>(*arg);
  uint64_t id = 0;
  if (!pb_decode_varint(stream, &id)) return false;
  if (ctx->add) ctx->subs->add(static_cast<uint32_t>(id));
  else          ctx->subs->remove(static_cast<uint32_t>(id));
  return true;
}

void DataBleTransport::handleFrame(FrameKind kind, const uint8_t* body, size_t len) {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  switch (kind) {
    case FrameKind::Ping:
      sendFrame(FrameKind::Pong, 0, nullptr, 0);
      break;
    case FrameKind::Subscribe: {
      esp_control_Subscribe sub = esp_control_Subscribe_init_zero;
      SubDecodeCtx ctx{&_subs, true};
      sub.resource_ids.funcs.decode = decodeResourceIds;
      sub.resource_ids.arg = &ctx;
      pb_istream_t is = pb_istream_from_buffer(body, len);
      pb_decode(&is, esp_control_Subscribe_fields, &sub);
      _snapshotPending = true;
      break;
    }
    case FrameKind::Unsubscribe: {
      esp_control_Unsubscribe uns = esp_control_Unsubscribe_init_zero;
      SubDecodeCtx ctx{&_subs, false};
      uns.resource_ids.funcs.decode = decodeResourceIds;
      uns.resource_ids.arg = &ctx;
      pb_istream_t is = pb_istream_from_buffer(body, len);
      pb_decode(&is, esp_control_Unsubscribe_fields, &uns);
      _deltaPendingMask = 0;
      break;
    }
    case FrameKind::InvokeAction: {
      // Release the mutex before dispatching the action handler.
      // The handler may call publishDelta() -> sendDelta() which needs the mutex.
      // Holding it here would cause a deadlock since FreeRTOS mutexes are not recursive.
      xSemaphoreGive(_mutex);
      uint8_t reply[kInvokeResultBufferSize] = {0};
      size_t replyLen = 0;
      if (ActionDecoder::dispatch(_registry, body, len,
                                  reply + DataFrameCodec::kHeaderSize,
                                  sizeof(reply) - DataFrameCodec::kHeaderSize,
                                  replyLen)) {
        sendEncodedFrame(FrameKind::InvokeResult, 0, reply, sizeof(reply), replyLen);
      }
      xSemaphoreTake(_mutex, portMAX_DELAY);
      break;
    }
    default: break;
  }
  xSemaphoreGive(_mutex);
}

void DataBleTransport::sendManifest() {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  _manifestOffset = 0;
  _manifestPending = true;
  xSemaphoreGive(_mutex);
}

void DataBleTransport::sendSnapshot() {
  uint8_t buf[kFrameBufferSize];
  size_t written = 0;
  if (SnapshotEncoder::encode(_table,
                              buf + DataFrameCodec::kHeaderSize,
                              sizeof(buf) - DataFrameCodec::kHeaderSize,
                              written)) {
    sendEncodedFrame(FrameKind::Snapshot, 0, buf, sizeof(buf), written);
  }
}

void DataBleTransport::sendDelta(uint32_t resourceId) {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  const int watchingIndex = _subs.indexOf(resourceId);
  ECB_DATA_DEBUGF("[DATA] sendDelta id=%u watching=%d subsCount=%u\n",
                resourceId, watchingIndex >= 0, (unsigned)_subs.size());

  if (watchingIndex >= 0) {
    _deltaPendingMask |= (1ULL << static_cast<uint32_t>(watchingIndex));
  }
  xSemaphoreGive(_mutex);
}

void DataBleTransport::sendDeltaInternal(uint32_t resourceId) {
  ResourceValue v{};
  if (!_table.get(resourceId, v)) {
    ECB_DATA_DEBUGF("[DATA] sendDeltaInternal id=%u: not found in table\n", resourceId);
    return;
  }
  uint8_t buf[kDeltaFrameBufferSize];
  size_t written = 0;
  if (SnapshotEncoder::encodeDelta(v, _table.generation(),
                                   buf + DataFrameCodec::kHeaderSize,
                                   sizeof(buf) - DataFrameCodec::kHeaderSize,
                                   written)) {
    ECB_DATA_DEBUGF("[DATA] sendDeltaInternal id=%u kind=%u written=%u\n",
                  resourceId, (uint8_t)v.kind, (unsigned)written);
    sendEncodedFrame(FrameKind::Delta, 0, buf, sizeof(buf), written);
  } else {
    ECB_DATA_DEBUGF("[DATA] sendDeltaInternal id=%u: encode failed\n", resourceId);
  }
}

void DataBleTransport::reset() {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  _subs.clear();
  _snapshotPending = false;
  _deltaPendingMask = 0;
  _manifestPending = false;
  _manifestOffset = 0;
  xSemaphoreGive(_mutex);
}

void DataBleTransport::tick() {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  if (_manifestPending) {
    const uint8_t* data = _store.bytes();
    const size_t total = _store.length();
    if (_manifestOffset < total) {
      const size_t remaining = total - _manifestOffset;
      const size_t n = remaining > kManifestChunkSize ? kManifestChunkSize : remaining;
      const size_t offset = _manifestOffset;
      _manifestOffset += n;
      xSemaphoreGive(_mutex);
      sendFrame(FrameKind::ManifestChunk, 0, data + offset, n);
      xSemaphoreTake(_mutex, portMAX_DELAY);
    } else {
      _manifestPending = false;
      const uint32_t crc = _store.crc32();
      uint8_t eof[8];
      eof[0] = (total >> 24) & 0xFF; eof[1] = (total >> 16) & 0xFF;
      eof[2] = (total >> 8) & 0xFF;  eof[3] = total & 0xFF;
      eof[4] = (crc >> 24) & 0xFF;   eof[5] = (crc >> 16) & 0xFF;
      eof[6] = (crc >> 8) & 0xFF;    eof[7] = crc & 0xFF;
      xSemaphoreGive(_mutex);
      sendFrame(FrameKind::ManifestEof, 0, eof, 8);
      xSemaphoreTake(_mutex, portMAX_DELAY);
    }
  }
  if (_snapshotPending) {
    _snapshotPending = false;
    xSemaphoreGive(_mutex); // release while sending to avoid long hold
    sendSnapshot();
    xSemaphoreTake(_mutex, portMAX_DELAY);
  }
  for (size_t i = 0; i < _subs.size(); ++i) {
    if (_deltaPendingMask & (1ULL << i)) {
      const uint32_t resourceId = _subs.idAt(i);
      _deltaPendingMask &= ~(1ULL << i);
      xSemaphoreGive(_mutex);
      sendDeltaInternal(resourceId);
      xSemaphoreTake(_mutex, portMAX_DELAY);
    }
  }
  xSemaphoreGive(_mutex);
}

} // namespace
