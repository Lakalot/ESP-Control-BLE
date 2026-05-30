// Host-only manifest emitter. Compiled+run by tools/emit_ui.py with the SAME
// mingw host g++ the native tests use (NO Node, NO npx tsx). It visits the single
// device description buildUi(...) with an EmitterUi, encodes the normalized model
// to protobuf, and writes the checked-in build artifact:
//   * src/generated/manifest_data.h -- the embedded protobuf (byte array + length)
//
// GCC 5.1.0 host toolchain: plain C++11/14 only (no optional/variant/string_view/
// structured-bindings/if-constexpr). <cstdio> file I/O.

#include <cstdio>
#include <cstdint>
#include <cstring>
#include <string>
#include <vector>

#include "ui/EmitterUi.h"
#include "ui/UiModelEncoder.h"

// The single device description (firmware/esp32/src/device_ui.h).
#include "device_ui.h"

namespace {

using ecb::ui::UiModel;

// ---- file writer ---------------------------------------------------------------
bool writeFile(const std::string& path, const std::string& contents) {
  FILE* f = std::fopen(path.c_str(), "wb");
  if (!f) {
    std::fprintf(stderr, "[ui_emit] cannot open %s for writing\n", path.c_str());
    return false;
  }
  size_t n = std::fwrite(contents.data(), 1, contents.size(), f);
  std::fclose(f);
  if (n != contents.size()) {
    std::fprintf(stderr, "[ui_emit] short write to %s\n", path.c_str());
    return false;
  }
  return true;
}

// ---- manifest_data.h (a #pragma once header: MANIFEST_LEN + the byte array,
//      the array guarded by MANIFEST_DEFINE_DATA so exactly one TU defines it) ----
std::string renderManifestData(const std::vector<uint8_t>& data) {
  std::string out;
  char buf[32];
  std::snprintf(buf, sizeof(buf), "%uu", (unsigned)data.size());
  const std::string lenStr = buf;

  out += "// Generated from device_ui.cpp - do not edit by hand.\n";
  out += "#pragma once\n";
  out += "#include <stdint.h>\n";
  out += "\n";
  out += "#define MANIFEST_LEN " + lenStr + "\n";
  out += "extern const uint8_t MANIFEST_DATA[MANIFEST_LEN];\n";
  out += "#ifdef MANIFEST_DEFINE_DATA\n";
  out += "const uint8_t MANIFEST_DATA[" + lenStr + "] = {\n";
  for (size_t i = 0; i < data.size(); i += 16) {
    out += "    ";
    size_t end = i + 16;
    if (end > data.size()) end = data.size();
    for (size_t j = i; j < end; ++j) {
      std::snprintf(buf, sizeof(buf), "0x%02x,", (unsigned)data[j]);
      out += buf;
    }
    out += "\n";
  }
  out += "};\n";
  out += "#endif\n";
  return out;
}

}  // namespace

// Forward declaration: defined in device_ui.cpp (src/).
void buildUi(ecb::ui::Ui& ui);

int main(int argc, char** argv) {
  if (argc < 2) {
    std::fprintf(stderr, "usage: %s <out-dir>\n", argv[0]);
    return 2;
  }
  std::string outDir = argv[1];
  if (!outDir.empty()) {
    char last = outDir[outDir.size() - 1];
    if (last != '/' && last != '\\') outDir += "/";
  }

  ecb::ui::EmitterUi emitter;
  buildUi(emitter);
  UiModel m = emitter.build();

  std::vector<uint8_t> pb;
  if (!ecb::ui::encodeUiModel(m, pb)) {
    std::fprintf(stderr, "[ui_emit] encodeUiModel failed\n");
    return 1;
  }

  const std::string dataPath = outDir + "manifest_data.h";
  if (!writeFile(dataPath, renderManifestData(pb))) return 1;
  std::printf("[ui_emit] wrote %s (%u bytes)\n", dataPath.c_str(), (unsigned)pb.size());

  return 0;
}
