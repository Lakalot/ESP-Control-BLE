#include "ActionDecoder.h"
#include <string.h>
#include <pb_decode.h>
#include <pb_encode.h>
#include "../nanopb/manifest_v5.pb.h"

namespace ecb { namespace v5 {

static bool encodeReply(uint32_t correlationId, ActionStatus status,
                        const uint8_t* payload, size_t payloadLen,
                        uint8_t* out, size_t cap, size_t& written) {
  esp_control_v5_InvokeResult msg = esp_control_v5_InvokeResult_init_zero;
  msg.correlation_id = correlationId;
  msg.status = static_cast<esp_control_v5_Status>(status);
  // message field is a callback — leave as NULL (no message string)
  pb_ostream_t os = pb_ostream_from_buffer(out, cap);
  if (!pb_encode(&os, esp_control_v5_InvokeResult_fields, &msg)) { written = 0; return false; }
  written = os.bytes_written; return true;
}

bool ActionDecoder::dispatch(const ActionRegistry& reg,
                             const uint8_t* in, size_t inLen,
                             uint8_t* out, size_t outCap, size_t& outLen) {
  esp_control_v5_InvokeAction req = esp_control_v5_InvokeAction_init_zero;
  pb_istream_t is = pb_istream_from_buffer(in, inLen);
  if (!pb_decode(&is, esp_control_v5_InvokeAction_fields, &req)) {
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
  ActionContext ctx{req.correlation_id, nullptr, 0,
                    &replied, &status, innerReply, sizeof(innerReply), &innerLen};
  (*h)(ctx);
  if (!replied) status = ActionStatus::Internal;
  return encodeReply(req.correlation_id, status, innerReply, innerLen, out, outCap, outLen);
}

}} // namespace
