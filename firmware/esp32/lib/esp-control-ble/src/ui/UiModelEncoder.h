#pragma once
#include <cstdint>
#include <vector>

#include "ui/ManifestModel.h"

namespace ecb { namespace ui {

// Serialize a normalized UiModel into a protobuf esp_control.ManifestBundle,
// byte-IDENTICAL to the TS toolchain (tools/manifest encodeProto.ts).
//
// IMPORTANT: this uses nanopb LOW-LEVEL stream primitives (pb_encode_tag /
// pb_encode_varint / pb_encode_string / pb_write), NOT the generated
// esp_control_ManifestBundle_fields struct-encode. The TS path (protobuf.js
// static encoder) writes every scalar field that is set on the message object,
// including zero-valued ones (poll_ms=0, confirm_idx=0, widget_kind=0,
// bind{0,0}, empty StringEntry, ...); proto3 struct-encode would OMIT those
// zeros and diverge. The encoder reproduces the write-zeros / omit-empty
// behavior exactly.
//
// Returns true on success; `out` is filled with the encoded bytes.
bool encodeUiModel(const UiModel& model, std::vector<uint8_t>& out);

}} // namespace ecb::ui
