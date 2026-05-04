#include "SnapshotEncoder.h"
#include <string.h>
#include <pb_encode.h>
#include "../../nanopb/manifest.pb.h"

namespace ecb {

struct BlobEncodeCtx {
  const uint8_t* data;
  size_t length;
};

static bool encodeBlobValue(pb_ostream_t* stream, const pb_field_t* field, void* const* arg) {
  const BlobEncodeCtx* ctx = static_cast<const BlobEncodeCtx*>(*arg);
  if (!pb_encode_tag_for_field(stream, field)) return false;
  return pb_encode_string(stream, ctx->data, ctx->length);
}

static bool fillCommonValue(esp_control_CommonValue& dst, const ResourceValue& src,
                            BlobEncodeCtx* blobCtx) {
  memset(&dst, 0, sizeof(dst));
  switch (src.kind) {
    case ResourceValueKind::Bool:
      dst.which_kind = esp_control_CommonValue_bool_value_tag;
      dst.kind.bool_value = src.boolValue;
      return true;
    case ResourceValueKind::Int:
      dst.which_kind = esp_control_CommonValue_int_value_tag;
      dst.kind.int_value = src.intValue;
      return true;
    case ResourceValueKind::Uint:
      dst.which_kind = esp_control_CommonValue_uint_value_tag;
      dst.kind.uint_value = src.uintValue;
      return true;
    case ResourceValueKind::Float:
      dst.which_kind = esp_control_CommonValue_float_value_tag;
      dst.kind.float_value = src.floatValue;
      return true;
    case ResourceValueKind::String:
      dst.which_kind = esp_control_CommonValue_string_value_tag;
      blobCtx->data = reinterpret_cast<const uint8_t*>(src.stringValue);
      blobCtx->length = strnlen(src.stringValue, ResourceTable<>::kMaxStringLen);
      dst.kind.string_value.funcs.encode = encodeBlobValue;
      dst.kind.string_value.arg = blobCtx;
      return true;
    case ResourceValueKind::Bytes:
      dst.which_kind = esp_control_CommonValue_string_value_tag;
      blobCtx->data = src.bytesValue;
      blobCtx->length = src.bytesLength <= ResourceTable<>::kMaxBytesLen
          ? src.bytesLength
          : ResourceTable<>::kMaxBytesLen;
      dst.kind.string_value.funcs.encode = encodeBlobValue;
      dst.kind.string_value.arg = blobCtx;
      return true;
    default:
      return false;
  }
}

struct SnapshotCallbackCtx {
  const ResourceTable<>* table;
};

static bool encodeValuesCallback(pb_ostream_t* stream, const pb_field_t* field, void* const* arg) {
  const SnapshotCallbackCtx* ctx = static_cast<const SnapshotCallbackCtx*>(*arg);
  const size_t n = ctx->table->size() > kMaxResources ? kMaxResources : ctx->table->size();
  for (size_t i = 0; i < n; ++i) {
    ResourceValue rv{};
    if (!ctx->table->at(i, rv)) break;
    esp_control_ResourceValue proto = esp_control_ResourceValue_init_zero;
    BlobEncodeCtx blobCtx{};
    proto.resource_id = rv.resourceId;
    if (fillCommonValue(proto.value, rv, &blobCtx)) proto.has_value = true;
    if (!pb_encode_tag_for_field(stream, field)) return false;
    if (!pb_encode_submessage(stream, esp_control_ResourceValue_fields, &proto)) return false;
  }
  return true;
}

bool SnapshotEncoder::encode(const ResourceTable<>& table, uint8_t* out, size_t cap, size_t& written) {
  esp_control_ResourceSnapshot msg = esp_control_ResourceSnapshot_init_zero;
  SnapshotCallbackCtx ctx{&table};
  msg.values.funcs.encode = encodeValuesCallback;
  msg.values.arg = &ctx;
  msg.generation = table.generation();
  pb_ostream_t os = pb_ostream_from_buffer(out, cap);
  bool ok = pb_encode(&os, esp_control_ResourceSnapshot_fields, &msg);
  written = ok ? os.bytes_written : 0;
  return ok;
}

bool SnapshotEncoder::encodeDelta(const ResourceValue& value, uint32_t generation,
                                  uint8_t* out, size_t cap, size_t& written) {
  esp_control_ResourceDelta msg = esp_control_ResourceDelta_init_zero;
  BlobEncodeCtx blobCtx{};
  msg.resource_id = value.resourceId;
  msg.generation = generation;
  if (fillCommonValue(msg.value, value, &blobCtx)) msg.has_value = true;
  pb_ostream_t os = pb_ostream_from_buffer(out, cap);
  bool ok = pb_encode(&os, esp_control_ResourceDelta_fields, &msg);
  written = ok ? os.bytes_written : 0;
  return ok;
}

} // namespace
