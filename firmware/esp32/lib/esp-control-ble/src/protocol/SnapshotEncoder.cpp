#include "SnapshotEncoder.h"
#include <string.h>
#include <pb_encode.h>
#include "../nanopb/manifest_v5.pb.h"

namespace ecb { namespace v5 {

static void fillProtoValue(manifest_v5_ResourceValue& dst, const ResourceValue& src) {
  memset(&dst, 0, sizeof(dst));
  dst.resource_id = src.resourceId;
  switch (src.kind) {
    case ResourceValueKind::Bool:
      dst.which_value = manifest_v5_ResourceValue_bool_value_tag;
      dst.value.bool_value = src.boolValue; break;
    case ResourceValueKind::Int:
      dst.which_value = manifest_v5_ResourceValue_int_value_tag;
      dst.value.int_value = src.intValue; break;
    case ResourceValueKind::Uint:
      dst.which_value = manifest_v5_ResourceValue_uint_value_tag;
      dst.value.uint_value = src.uintValue; break;
    case ResourceValueKind::String:
      dst.which_value = manifest_v5_ResourceValue_string_value_tag;
      strncpy(dst.value.string_value, src.stringValue, sizeof(dst.value.string_value) - 1);
      break;
    case ResourceValueKind::Bytes: {
      dst.which_value = manifest_v5_ResourceValue_bytes_value_tag;
      size_t n = src.bytesLength > sizeof(dst.value.bytes_value.bytes)
               ? sizeof(dst.value.bytes_value.bytes) : src.bytesLength;
      memcpy(dst.value.bytes_value.bytes, src.bytesValue, n);
      dst.value.bytes_value.size = n;
    } break;
    default: break;
  }
}

bool SnapshotEncoder::encode(const ResourceTable& table, uint8_t* out, size_t cap, size_t& written) {
  manifest_v5_ResourceSnapshot msg = manifest_v5_ResourceSnapshot_init_zero;
  size_t n = table.size() > 64 ? 64 : table.size();
  for (size_t i = 0; i < n; ++i) {
    ResourceValue rv{};
    if (!table.at(i, rv)) break;
    fillProtoValue(msg.values[i], rv);
  }
  msg.values_count = n;
  msg.generation = table.generation();
  pb_ostream_t os = pb_ostream_from_buffer(out, cap);
  bool ok = pb_encode(&os, manifest_v5_ResourceSnapshot_fields, &msg);
  written = ok ? os.bytes_written : 0;
  return ok;
}

bool SnapshotEncoder::encodeDelta(const ResourceValue& value, uint32_t generation,
                                  uint8_t* out, size_t cap, size_t& written) {
  manifest_v5_ResourceDelta msg = manifest_v5_ResourceDelta_init_zero;
  manifest_v5_ResourceValue rv{};
  fillProtoValue(rv, value);
  msg.resource_id = rv.resource_id;
  msg.which_value = rv.which_value;
  msg.value = rv.value;
  msg.generation = generation;
  pb_ostream_t os = pb_ostream_from_buffer(out, cap);
  bool ok = pb_encode(&os, manifest_v5_ResourceDelta_fields, &msg);
  written = ok ? os.bytes_written : 0;
  return ok;
}

}} // namespace
