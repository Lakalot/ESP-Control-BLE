#include "SessionDispatcher.h"

#ifdef UNIT_TEST
#include <string.h>
#include <pb_decode.h>
#else
#include <Arduino.h>
#include <string.h>
#include <pb_decode.h>
#endif

#include "../../transport/frame/DataFrameCodec.h"
#include "../actions/ActionDecoder.h"
#include "../snapshot/SnapshotEncoder.h"
#include "../../support/EcbLogging.h"
#include "../../nanopb/manifest.pb.h"

namespace ecb {

SessionDispatcher::SessionDispatcher(ResourceTable<>& resources,
                                     SubscriptionState& subscriptions,
                                     const ActionRegistry& actions,
                                     const ManifestStore& manifest,
                                     FrameSender sender,
                                     void* senderContext)
  : _resources(resources),
    _subscriptions(subscriptions),
    _actions(actions),
    _manifest(manifest),
    _sender(sender),
    _senderContext(senderContext),
    _deltaPendingMask(0),
    _manifestOffset(0),
    _snapshotPending(false),
    _manifestPending(false) {
#ifndef UNIT_TEST
    _mutex = xSemaphoreCreateMutex();
#else
    _mutex = nullptr;
#endif
}

static bool sendFrame(FrameSender sender, void* senderContext, FrameKind kind,
                      const uint8_t* body, size_t bodyLen,
                      uint8_t* frame, size_t frameCap) {
  if (!sender || bodyLen > kMaxFrameBody) return false;
  if (frameCap < DataFrameCodec::kHeaderSize + bodyLen) return false;

  FrameHeader header{kind, 0, static_cast<uint16_t>(bodyLen)};
  const size_t headerLen = DataFrameCodec::encodeHeader(header, frame, DataFrameCodec::kHeaderSize);
  if (headerLen != DataFrameCodec::kHeaderSize) return false;

  if (body && bodyLen > 0 && body != frame + headerLen) memcpy(frame + headerLen, body, bodyLen);
  sender(senderContext, frame, headerLen + bodyLen);
  return true;
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

void SessionDispatcher::onFrame(FrameKind kind, const uint8_t* body, size_t len) {
#ifndef UNIT_TEST
  xSemaphoreTake(_mutex, portMAX_DELAY);
#endif
  switch (kind) {
    case FrameKind::Ping:
      {
        uint8_t frame[DataFrameCodec::kHeaderSize + kMaxFrameBody] = {0};
        sendFrame(_sender, _senderContext, FrameKind::Pong, nullptr, 0, frame, sizeof(frame));
      }
      break;
    case FrameKind::Subscribe: {
      esp_control_Subscribe sub = esp_control_Subscribe_init_zero;
      SubDecodeCtx ctx{&_subscriptions, true};
      sub.resource_ids.funcs.decode = decodeResourceIds;
      sub.resource_ids.arg = &ctx;
      pb_istream_t is = pb_istream_from_buffer(body, len);
      pb_decode(&is, esp_control_Subscribe_fields, &sub);
      _snapshotPending = true;
      break;
    }
    case FrameKind::Unsubscribe: {
      esp_control_Unsubscribe uns = esp_control_Unsubscribe_init_zero;
      SubDecodeCtx ctx{&_subscriptions, false};
      uns.resource_ids.funcs.decode = decodeResourceIds;
      uns.resource_ids.arg = &ctx;
      pb_istream_t is = pb_istream_from_buffer(body, len);
      pb_decode(&is, esp_control_Unsubscribe_fields, &uns);
      _deltaPendingMask = 0;
      break;
    }
    case FrameKind::InvokeAction: {
#ifndef UNIT_TEST
      xSemaphoreGive(_mutex);
#endif
      uint8_t frame[DataFrameCodec::kHeaderSize + kInvokeReplyFramedMax] = {0};
      size_t replyLen = 0;
      if (ActionDecoder::dispatch(_actions, body, len,
                                  frame + DataFrameCodec::kHeaderSize,
                                  sizeof(frame) - DataFrameCodec::kHeaderSize,
                                  replyLen)) {
        sendFrame(_sender, _senderContext, FrameKind::InvokeResult,
                  frame + DataFrameCodec::kHeaderSize, replyLen,
                  frame, sizeof(frame));
      }
#ifndef UNIT_TEST
      xSemaphoreTake(_mutex, portMAX_DELAY);
#endif
      break;
    }
    default: break;
  }
#ifndef UNIT_TEST
  xSemaphoreGive(_mutex);
#endif
}

void SessionDispatcher::sendSnapshot() {
  uint8_t frame[DataFrameCodec::kHeaderSize + kMaxFrameBody];
  size_t written = 0;
  if (SnapshotEncoder::encode(_resources,
                              frame + DataFrameCodec::kHeaderSize,
                              sizeof(frame) - DataFrameCodec::kHeaderSize,
                              written)) {
    sendFrame(_sender, _senderContext, FrameKind::Snapshot,
              frame + DataFrameCodec::kHeaderSize, written,
              frame, sizeof(frame));
  }
}

void SessionDispatcher::publishDelta(uint32_t resourceId) {
#ifndef UNIT_TEST
  xSemaphoreTake(_mutex, portMAX_DELAY);
#endif
  const int watchingIndex = _subscriptions.indexOf(resourceId);
  ECB_DATA_DEBUGF("[DATA] sendDelta id=%u watching=%d subsCount=%u\n",
                resourceId, watchingIndex >= 0, (unsigned)_subscriptions.size());

  if (watchingIndex >= 0) {
    _deltaPendingMask |= (1ULL << static_cast<uint32_t>(watchingIndex));
  }
#ifndef UNIT_TEST
  xSemaphoreGive(_mutex);
#endif
}

void SessionDispatcher::sendDeltaInternal(uint32_t resourceId) {
  ResourceValue v{};
  if (!_resources.get(resourceId, v)) {
    ECB_DATA_DEBUGF("[DATA] sendDeltaInternal id=%u: not found in table\n", resourceId);
    return;
  }
  uint8_t frame[DataFrameCodec::kHeaderSize + 128u];
  size_t written = 0;
  if (SnapshotEncoder::encodeDelta(v, _resources.generation(),
                                   frame + DataFrameCodec::kHeaderSize,
                                   sizeof(frame) - DataFrameCodec::kHeaderSize,
                                   written)) {
    ECB_DATA_DEBUGF("[DATA] sendDeltaInternal id=%u kind=%u written=%u\n",
                  resourceId, (uint8_t)v.kind, (unsigned)written);
    sendFrame(_sender, _senderContext, FrameKind::Delta,
              frame + DataFrameCodec::kHeaderSize, written,
              frame, sizeof(frame));
  } else {
    ECB_DATA_DEBUGF("[DATA] sendDeltaInternal id=%u: encode failed\n", resourceId);
  }
}

void SessionDispatcher::reset() {
#ifndef UNIT_TEST
  xSemaphoreTake(_mutex, portMAX_DELAY);
#endif
  _subscriptions.clear();
  _snapshotPending = false;
  _deltaPendingMask = 0;
  _manifestOffset = 0;
  _manifestPending = false;
#ifndef UNIT_TEST
  xSemaphoreGive(_mutex);
#endif
}

void SessionDispatcher::sendManifest() {
#ifndef UNIT_TEST
  xSemaphoreTake(_mutex, portMAX_DELAY);
#endif
  _manifestOffset = 0;
  _manifestPending = true;
#ifndef UNIT_TEST
  xSemaphoreGive(_mutex);
#endif
}

void SessionDispatcher::tick() {
#ifndef UNIT_TEST
  xSemaphoreTake(_mutex, portMAX_DELAY);
#endif
  if (_manifestPending) {
    const uint8_t* data = _manifest.bytes();
    const size_t total = _manifest.length();
    if (_manifestOffset < total) {
      const size_t remaining = total - _manifestOffset;
      const size_t n = remaining > kManifestChunkSize ? kManifestChunkSize : remaining;
      const size_t offset = _manifestOffset;
      _manifestOffset += n;
#ifndef UNIT_TEST
      xSemaphoreGive(_mutex);
#endif
      {
        uint8_t frame[DataFrameCodec::kHeaderSize + kMaxFrameBody] = {0};
        sendFrame(_sender, _senderContext, FrameKind::ManifestChunk, data + offset, n, frame, sizeof(frame));
      }
#ifndef UNIT_TEST
      xSemaphoreTake(_mutex, portMAX_DELAY);
#endif
    } else {
      _manifestPending = false;
      const uint32_t crc = _manifest.crc32();
      uint8_t eof[8];
      eof[0] = (total >> 24) & 0xFF; eof[1] = (total >> 16) & 0xFF;
      eof[2] = (total >> 8) & 0xFF;  eof[3] = total & 0xFF;
      eof[4] = (crc >> 24) & 0xFF;   eof[5] = (crc >> 16) & 0xFF;
      eof[6] = (crc >> 8) & 0xFF;    eof[7] = crc & 0xFF;
#ifndef UNIT_TEST
      xSemaphoreGive(_mutex);
#endif
      {
        uint8_t frame[DataFrameCodec::kHeaderSize + kMaxFrameBody] = {0};
        sendFrame(_sender, _senderContext, FrameKind::ManifestEof, eof, 8, frame, sizeof(frame));
      }
#ifndef UNIT_TEST
      xSemaphoreTake(_mutex, portMAX_DELAY);
#endif
    }
  }
  if (_snapshotPending) {
    _snapshotPending = false;
#ifndef UNIT_TEST
    xSemaphoreGive(_mutex); // release while sending to avoid long hold
#endif
    sendSnapshot();
#ifndef UNIT_TEST
    xSemaphoreTake(_mutex, portMAX_DELAY);
#endif
  }
  for (size_t i = 0; i < _subscriptions.size(); ++i) {
    if (_deltaPendingMask & (1ULL << i)) {
      const uint32_t resourceId = _subscriptions.idAt(i);
      _deltaPendingMask &= ~(1ULL << i);
#ifndef UNIT_TEST
      xSemaphoreGive(_mutex);
#endif
      sendDeltaInternal(resourceId);
#ifndef UNIT_TEST
      xSemaphoreTake(_mutex, portMAX_DELAY);
#endif
    }
  }
#ifndef UNIT_TEST
  xSemaphoreGive(_mutex);
#endif
}

}  // namespace ecb