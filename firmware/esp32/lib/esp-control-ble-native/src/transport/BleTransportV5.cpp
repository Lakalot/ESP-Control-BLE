#include "BleTransportV5.h"
#include <string.h>
#include <pb_decode.h>
#include "../protocol/ManifestStore.h"
#include "../protocol/ResourceTable.h"
#include "../protocol/SubscriptionState.h"
#include "../protocol/ActionRegistryV5.h"
#include "../protocol/ActionDecoder.h"
#include "../protocol/SnapshotEncoder.h"
#include "../protocol/ProtocolV5.h"
#include "../nanopb/manifest_v5.pb.h"

namespace ecb { namespace v5 {

BleTransportV5::BleTransportV5(const ManifestStore& s, ResourceTable& t,
                               SubscriptionState& su, const ActionRegistry& r,
                               FrameSender sender)
  : _store(s), _table(t), _subs(su), _registry(r), _sender(sender) {}

void BleTransportV5::sendFrame(FrameKind kind, uint8_t flags, const uint8_t* body, size_t len) {
  if (!_sender) return;
  uint8_t buf[kMaxFrameBody + 4];
  if (len > kMaxFrameBody) return;
  FrameHeader h{kind, flags, static_cast<uint16_t>(len)};
  size_t hlen = FrameCodec::encodeHeader(h, buf, sizeof(buf));
  if (body && len) memcpy(buf + hlen, body, len);
  _sender(buf, hlen + len);
}

// Callback decoder for Subscribe.resource_ids (pb_callback_t repeated uint32)
struct SubDecodeCtx { SubscriptionState* subs; bool add; };

static bool decodeResourceIds(pb_istream_t* stream, const pb_field_t* /*field*/, void** arg) {
  SubDecodeCtx* ctx = static_cast<SubDecodeCtx*>(*arg);
  uint64_t id = 0;
  if (!pb_decode_varint(stream, &id)) return false;
  if (ctx->add) ctx->subs->add(static_cast<uint32_t>(id));
  else          ctx->subs->remove(static_cast<uint32_t>(id));
  return true;
}

void BleTransportV5::handleFrame(FrameKind kind, const uint8_t* body, size_t len) {
  switch (kind) {
    case FrameKind::Ping:
      sendFrame(FrameKind::Pong, 0, nullptr, 0);
      return;
    case FrameKind::Subscribe: {
      esp_control_v5_Subscribe sub = esp_control_v5_Subscribe_init_zero;
      SubDecodeCtx ctx{&_subs, true};
      sub.resource_ids.funcs.decode = decodeResourceIds;
      sub.resource_ids.arg = &ctx;
      pb_istream_t is = pb_istream_from_buffer(body, len);
      pb_decode(&is, esp_control_v5_Subscribe_fields, &sub);
      return;
    }
    case FrameKind::Unsubscribe: {
      esp_control_v5_Unsubscribe uns = esp_control_v5_Unsubscribe_init_zero;
      SubDecodeCtx ctx{&_subs, false};
      uns.resource_ids.funcs.decode = decodeResourceIds;
      uns.resource_ids.arg = &ctx;
      pb_istream_t is = pb_istream_from_buffer(body, len);
      pb_decode(&is, esp_control_v5_Unsubscribe_fields, &uns);
      return;
    }
    case FrameKind::InvokeAction: {
      uint8_t reply[256] = {0};
      size_t replyLen = 0;
      if (ActionDecoder::dispatch(_registry, body, len, reply, sizeof(reply), replyLen)) {
        sendFrame(FrameKind::InvokeResult, 0, reply, replyLen);
      }
      return;
    }
    default: return;
  }
}

void BleTransportV5::sendManifest() {
  const uint8_t* data = _store.bytes();
  size_t total = _store.length();
  size_t offset = 0;
  while (offset < total) {
    size_t n = (total - offset) > kManifestChunkSize ? kManifestChunkSize : (total - offset);
    sendFrame(FrameKind::ManifestChunk, 0, data + offset, n);
    offset += n;
  }
  uint8_t eof[8];
  uint32_t crc = _store.crc32();
  eof[0] = (total >> 24) & 0xFF; eof[1] = (total >> 16) & 0xFF;
  eof[2] = (total >> 8) & 0xFF;  eof[3] = total & 0xFF;
  eof[4] = (crc >> 24) & 0xFF;   eof[5] = (crc >> 16) & 0xFF;
  eof[6] = (crc >> 8) & 0xFF;    eof[7] = crc & 0xFF;
  sendFrame(FrameKind::ManifestEof, 0, eof, 8);
}

void BleTransportV5::sendSnapshot() {
  uint8_t buf[512];
  size_t written = 0;
  if (SnapshotEncoder::encode(_table, buf, sizeof(buf), written)) {
    sendFrame(FrameKind::Snapshot, 0, buf, written);
  }
}

void BleTransportV5::sendDelta(uint32_t resourceId) {
  if (!_subs.isWatching(resourceId)) return;
  ResourceValue v{};
  if (!_table.get(resourceId, v)) return;
  uint8_t buf[128];
  size_t written = 0;
  if (SnapshotEncoder::encodeDelta(v, _table.generation(), buf, sizeof(buf), written)) {
    sendFrame(FrameKind::Delta, 0, buf, written);
  }
}

}} // namespace
