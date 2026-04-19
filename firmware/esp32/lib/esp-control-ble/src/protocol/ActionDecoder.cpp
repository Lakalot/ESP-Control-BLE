#include "ActionDecoder.h"
#include <string.h>
#include <pb_decode.h>
#include <pb_encode.h>
#include "../nanopb/manifest_v5.pb.h"

namespace ecb { namespace v5 {

static bool encodeReply(uint32_t correlationId, ActionStatus status,
                        const uint8_t* payload, size_t payloadLen,
                        uint8_t* out, size_t cap, size_t& written) {
  manifest_v5_InvokeResult msg = manifest_v5_InvokeResult_init_zero;
  msg.correlation_id = correlationId;
  msg.status = static_cast<manifest_v5_Status>(status);
  if (payloadLen > 0 && payload) {
    size_t n = payloadLen > sizeof(msg.payload.bytes) ? sizeof(msg.payload.bytes) : payloadLen;
    memcpy(msg.payload.bytes, payload, n);
    msg.payload.size = n;
  }
  pb_ostream_t os = pb_ostream_from_buffer(out, cap);
  if (!pb_encode(&os, manifest_v5_InvokeResult_fields, &msg)) { written = 0; return false; }
  written = os.bytes_written; return true;
}

bool ActionDecoder::dispatch(const ActionRegistry& reg,
                             const uint8_t* in, size_t inLen,
                             uint8_t* out, size_t outCap, size_t& outLen) {
  manifest_v5_InvokeAction req = manifest_v5_InvokeAction_init_zero;
  pb_istream_t is = pb_istream_from_buffer(in, inLen);
  if (!pb_decode(&is, manifest_v5_InvokeAction_fields, &req)) {
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
  ActionContext ctx{req.correlation_id, req.payload.bytes, req.payload.size,
                    &replied, &status, innerReply, sizeof(innerReply), &innerLen};
  (*h)(ctx);
  if (!replied) status = ActionStatus::Internal;
  return encodeReply(req.correlation_id, status, innerReply, innerLen, out, outCap, outLen);
}

}} // namespace
