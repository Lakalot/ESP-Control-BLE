#include "SnapshotEncoder.h"
#include <string.h>
#include <pb_encode.h>
#include "../nanopb/manifest_v5.pb.h"

namespace ecb { namespace v5 {

static bool fillCommonValue(esp_control_v5_CommonValue& dst, const ResourceValue& src) {
  memset(&dst, 0, sizeof(dst));
  switch (src.kind) {
    case ResourceValueKind::Bool:
      dst.which_kind = esp_control_v5_CommonValue_bool_value_tag;
      dst.kind.bool_value = src.boolValue;
      return true;
    case ResourceValueKind::Int:
      dst.which_kind = esp_control_v5_CommonValue_int_value_tag;
      dst.kind.int_value = src.intValue;
      return true;
    case ResourceValueKind::Uint:
      dst.which_kind = esp_control_v5_CommonValue_uint_value_tag;
      dst.kind.uint_value = src.uintValue;
      return true;
    case ResourceValueKind::Float:
      dst.which_kind = esp_control_v5_CommonValue_float_value_tag;
      dst.kind.float_value = src.floatValue;
      return true;
    default:
      return false;
  }
}

struct SnapshotCallbackCtx {
  const ResourceTable* table;
};

static bool encodeValuesCallback(pb_ostream_t* stream, const pb_field_t* field, void* const* arg) {
  const SnapshotCallbackCtx* ctx = static_cast<const SnapshotCallbackCtx*>(*arg);
  const size_t n = ctx->table->size() > 64 ? 64 : ctx->table->size();
  for (size_t i = 0; i < n; ++i) {
    ResourceValue rv{};
    if (!ctx->table->at(i, rv)) break;
    esp_control_v5_ResourceValue proto = esp_control_v5_ResourceValue_init_zero;
    proto.resource_id = rv.resourceId;
    if (fillCommonValue(proto.value, rv)) proto.has_value = true;
    if (!pb_encode_tag_for_field(stream, field)) return false;
    if (!pb_encode_submessage(stream, esp_control_v5_ResourceValue_fields, &proto)) return false;
  }
  return true;
}

bool SnapshotEncoder::encode(const ResourceTable& table, uint8_t* out, size_t cap, size_t& written) {
  esp_control_v5_ResourceSnapshot msg = esp_control_v5_ResourceSnapshot_init_zero;
  SnapshotCallbackCtx ctx{&table};
  msg.values.funcs.encode = encodeValuesCallback;
  msg.values.arg = &ctx;
  msg.generation = table.generation();
  pb_ostream_t os = pb_ostream_from_buffer(out, cap);
  bool ok = pb_encode(&os, esp_control_v5_ResourceSnapshot_fields, &msg);
  written = ok ? os.bytes_written : 0;
  return ok;
}

struct DeltaCallbackCtx {
  const esp_control_v5_CommonValue* value;
};

bool SnapshotEncoder::encodeDelta(const ResourceValue& value, uint32_t generation,
                                  uint8_t* out, size_t cap, size_t& written) {
  esp_control_v5_ResourceDelta msg = esp_control_v5_ResourceDelta_init_zero;
  msg.resource_id = value.resourceId;
  msg.generation = generation;
  if (fillCommonValue(msg.value, value)) msg.has_value = true;
  pb_ostream_t os = pb_ostream_from_buffer(out, cap);
  bool ok = pb_encode(&os, esp_control_v5_ResourceDelta_fields, &msg);
  written = ok ? os.bytes_written : 0;
  return ok;
}

}} // namespace
