#include "ActionDecoder.h"
#include <string.h>
#include <pb_decode.h>
#include <pb_encode.h>
#include "../../nanopb/manifest.pb.h"

namespace ecb {

// nanopb does NOT set CommonValue.which_kind for oneof members that are
// CALLBACK fields (string_value / enum_value): the decoded data is delivered
// to this callback instead of being stored in the union, so the discriminator
// stays at its zero-init value. We therefore record here that a string/enum
// value actually arrived, and dispatch() relies on this flag rather than on
// which_kind for those two cases.
struct StringDecodeCtx {
  char* out;
  bool  received;
};

static bool decodeStringValue(pb_istream_t* stream, const pb_field_t* /*field*/, void** arg) {
  StringDecodeCtx* ctx = static_cast<StringDecodeCtx*>(*arg);
  if (!ctx || !ctx->out) return false;
  char* out = ctx->out;
  const size_t n = stream->bytes_left < 64 ? stream->bytes_left : 64;
  if (!pb_read(stream, reinterpret_cast<pb_byte_t*>(out), n)) return false;
  out[n] = '\0';
  if (stream->bytes_left > 0) {
    uint8_t scratch[16];
    while (stream->bytes_left > 0) {
      const size_t chunk = stream->bytes_left < sizeof(scratch) ? stream->bytes_left : sizeof(scratch);
      if (!pb_read(stream, scratch, chunk)) return false;
    }
  }
  ctx->received = true;
  return true;
}

static bool encodeReply(uint32_t correlationId, ActionStatus status,
                        const uint8_t* payload, size_t payloadLen,
                        uint8_t* out, size_t cap, size_t& written) {
  esp_control_InvokeResult msg = esp_control_InvokeResult_init_zero;
  msg.correlation_id = correlationId;
  msg.status = static_cast<esp_control_Status>(status);
  pb_ostream_t os = pb_ostream_from_buffer(out, cap);
  if (!pb_encode(&os, esp_control_InvokeResult_fields, &msg)) { written = 0; return false; }
  written = os.bytes_written; return true;
}

bool ActionDecoder::dispatch(const ActionRegistry& reg,
                             const uint8_t* in, size_t inLen,
                             uint8_t* out, size_t outCap, size_t& outLen) {
  esp_control_InvokeAction req = esp_control_InvokeAction_init_zero;
  char decodedString[65] = {0};
  StringDecodeCtx strCtx{decodedString, false};
  // string_value and enum_value share the same oneof union; the callback/arg
  // assignment targets the same memory, so a single context covers both.
  req.payload.kind.string_value.funcs.decode = decodeStringValue;
  req.payload.kind.string_value.arg = &strCtx;
  req.payload.kind.enum_value.funcs.decode = decodeStringValue;
  req.payload.kind.enum_value.arg = &strCtx;
  pb_istream_t is = pb_istream_from_buffer(in, inLen);
  if (!pb_decode(&is, esp_control_InvokeAction_fields, &req)) {
    return encodeReply(0, ActionStatus::BadPayload, nullptr, 0, out, outCap, outLen);
  }
  const ActionHandler* h = reg.find(req.action_id);
  if (!h) {
    return encodeReply(req.correlation_id, ActionStatus::UnknownAction, nullptr, 0, out, outCap, outLen);
  }
  uint8_t innerReply[128] = {0};
  size_t  innerLen = 0;
  bool replied = false;
  ActionStatus status = ActionStatus::Unspecified;

  // Extract typed value from the CommonValue payload.
  ActionValueKind valueKind = ActionValueKind::None;
  bool     boolVal   = false;
  int32_t  intVal    = 0;
  uint32_t uintVal   = 0;
  float    floatVal  = 0.0f;
  char     strVal[65] = {0};

  if (req.has_payload) {
    // String/enum oneof members are CALLBACK fields: nanopb leaves which_kind
    // unset for them, so detect them via the callback's received flag first.
    if (strCtx.received) {
      valueKind = ActionValueKind::String;
      strncpy(strVal, decodedString, sizeof(strVal) - 1);
      strVal[sizeof(strVal) - 1] = '\0';
    } else {
      switch (req.payload.which_kind) {
        case esp_control_CommonValue_bool_value_tag:
          valueKind = ActionValueKind::Bool;
          boolVal   = req.payload.kind.bool_value;
          break;
        case esp_control_CommonValue_int_value_tag:
          valueKind = ActionValueKind::Int;
          intVal    = req.payload.kind.int_value;
          break;
        case esp_control_CommonValue_uint_value_tag:
          valueKind = ActionValueKind::Uint;
          uintVal   = req.payload.kind.uint_value;
          break;
        case esp_control_CommonValue_float_value_tag:
          valueKind = ActionValueKind::Float;
          floatVal  = req.payload.kind.float_value;
          break;
        default: break;
      }
    }
  }

  ActionContext ctx{
    req.correlation_id,
    valueKind, boolVal, intVal, uintVal, floatVal, {},
    nullptr, 0,
    &replied, &status, innerReply, sizeof(innerReply), &innerLen
  };
  if (valueKind == ActionValueKind::String) {
    strncpy(ctx.stringValue, strVal, sizeof(ctx.stringValue) - 1);
    ctx.stringValue[sizeof(ctx.stringValue) - 1] = '\0';
  }
  (*h)(ctx);
  if (!replied) status = ActionStatus::Internal;
  return encodeReply(req.correlation_id, status, innerReply, innerLen, out, outCap, outLen);
}

} // namespace
