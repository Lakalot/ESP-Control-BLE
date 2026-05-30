// Host-only manifest emitter. Compiled+run by tools/emit_ui.py with the SAME
// mingw host g++ the native tests use (NO Node, NO npx tsx). It visits the single
// device description buildUi(...) with an EmitterUi, encodes the normalized model
// to protobuf, and writes the three checked-in build artifacts:
//   * src/manifest_data.h     -- the embedded protobuf (byte-identical to the
//                                legacy YAML->TS output; the tablet sees no change)
//   * src/manifest_symbols.h  -- slug->id symbol tables (declarations)
//   * src/manifest_symbols.cpp-- slug->id symbol tables (definitions)
//
// manifest_data.h reproduces tools/embed_manifest.py's exact byte layout, and the
// symbol files reproduce tools/manifest generateFirmwareSymbols.ts's exact layout,
// so swapping the build step over is a no-op diff for downstream consumers.
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
#include "runtime/AppRuntime.h"  // proves AppRuntime.h is host-portable; never invoked

// The single device description (firmware/esp32/app/device/device_ui.cpp).
#include "device/device_ui.h"

namespace {

using ecb::ui::UiModel;

// ---- firmwareSymbol derivation -------------------------------------------------
// Resources/actions/nodes: the slug with '.' -> '_' (reproduces the YAML authoring
// rule; verified against manifest.yaml for every entry). Screens carry custom
// overrides in the YAML (home stays "home"; stats/settings get a "_screen"
// suffix), so they are special-cased to keep manifest_symbols.* a faithful
// drop-in. The id values are unaffected (they come from the model).
std::string dotToUnderscore(const std::string& slug) {
  std::string out = slug;
  for (size_t i = 0; i < out.size(); ++i)
    if (out[i] == '.') out[i] = '_';
  return out;
}

std::string screenSymbol(const std::string& slug) {
  if (slug == "stats") return "stats_screen";
  if (slug == "settings") return "settings_screen";
  return dotToUnderscore(slug);  // "home" -> "home"
}

// A symbol-table row: (numeric id, C++ symbol, manifest slug) in declaration order.
struct SymRow {
  uint32_t id;
  std::string symbol;
  std::string slug;
};

struct Category {
  std::string ns;          // e.g. "manifest_resources"
  std::string tableName;   // e.g. "kManifestResourceSymbols"
  std::string lookupName;  // e.g. "find_manifest_resource_symbol"
  std::vector<SymRow> rows;
};

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

// ---- manifest_data.h (mirror tools/embed_manifest.py byte-for-byte) ------------
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

// ---- manifest_symbols.{h,cpp} (mirror generateFirmwareSymbols.ts) --------------
std::string renderSymbolHeader(const std::vector<Category>& cats) {
  std::string out;
  out += "#pragma once\n";
  out += "\n";
  out += "#include <cstddef>\n";
  out += "#include <cstdint>\n";
  out += "\n";
  out += "struct ManifestSymbolEntry {\n";
  out += "  uint32_t id;\n";
  out += "  const char* symbol;\n";
  out += "  const char* slug;\n";
  out += "};\n";
  out += "\n";
  for (size_t c = 0; c < cats.size(); ++c) {
    const Category& cat = cats[c];
    out += "namespace " + cat.ns + " {\n";
    for (size_t r = 0; r < cat.rows.size(); ++r)
      out += "extern const uint32_t " + cat.rows[r].symbol + ";\n";
    out += "}\n";
    out += "\n";
    out += "extern const ManifestSymbolEntry " + cat.tableName + "[];\n";
    out += "extern const size_t " + cat.tableName + "Count;\n";
    out += "const ManifestSymbolEntry* " + cat.lookupName + "(uint32_t id);\n";
    out += "\n";
  }
  return out;
}

std::string renderSymbolSource(const std::vector<Category>& cats) {
  std::string out;
  out += "#include \"manifest_symbols.h\"\n";
  out += "\n";
  char buf[32];
  for (size_t c = 0; c < cats.size(); ++c) {
    const Category& cat = cats[c];
    out += "namespace " + cat.ns + " {\n";
    for (size_t r = 0; r < cat.rows.size(); ++r) {
      std::snprintf(buf, sizeof(buf), "%uu", (unsigned)cat.rows[r].id);
      out += "const uint32_t " + cat.rows[r].symbol + " = " + buf + ";\n";
    }
    out += "}\n";
    out += "\n";

    if (cat.rows.empty()) {
      out += "const ManifestSymbolEntry " + cat.tableName + "[1] = {};\n";
      out += "const size_t " + cat.tableName + "Count = 0;\n";
    } else {
      out += "const ManifestSymbolEntry " + cat.tableName + "[] = {\n";
      for (size_t r = 0; r < cat.rows.size(); ++r) {
        const SymRow& row = cat.rows[r];
        out += "  {" + cat.ns + "::" + row.symbol + ", \"" + row.symbol + "\", \"" + row.slug + "\"},\n";
      }
      out += "};\n";
      out += "const size_t " + cat.tableName + "Count = sizeof(" + cat.tableName +
             ") / sizeof(" + cat.tableName + "[0]);\n";
    }
    out += "\n";
    out += "const ManifestSymbolEntry* " + cat.lookupName + "(uint32_t id) {\n";
    out += "  for (size_t index = 0; index < " + cat.tableName + "Count; ++index) {\n";
    out += "    if (" + cat.tableName + "[index].id == id) {\n";
    out += "      return &" + cat.tableName + "[index];\n";
    out += "    }\n";
    out += "  }\n";
    out += "  return nullptr;\n";
    out += "}\n";
    out += "\n";
  }
  return out;
}

}  // namespace

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

  // Build the normalized model from the single device description.
  app::AppRuntime rt;  // stub; .onSet handlers never run at emit time
  ecb::ui::EmitterUi emitter;
  buildUi(emitter, rt);
  UiModel m = emitter.build();

  // Encode to protobuf (byte-identical to the TS toolchain).
  std::vector<uint8_t> pb;
  if (!ecb::ui::encodeUiModel(m, pb)) {
    std::fprintf(stderr, "[ui_emit] encodeUiModel failed\n");
    return 1;
  }

  // --- manifest_data.h ---
  const std::string dataPath = outDir + "manifest_data.h";
  if (!writeFile(dataPath, renderManifestData(pb))) return 1;
  std::printf("[ui_emit] wrote %s (%u bytes)\n", dataPath.c_str(), (unsigned)pb.size());

  // --- manifest_symbols.{h,cpp} ---
  // Declaration-order rows per kind, slug decoded from the string table, id from
  // the model (sort-by-id 1-based, same as the protobuf), firmwareSymbol derived.
  std::vector<Category> cats;

  Category resources;
  resources.ns = "manifest_resources";
  resources.tableName = "kManifestResourceSymbols";
  resources.lookupName = "find_manifest_resource_symbol";
  for (size_t i = 0; i < m.resources.size(); ++i) {
    SymRow row;
    row.id = m.resources[i].id;
    row.slug = m.strings.at(m.resources[i].slugIdx);
    row.symbol = dotToUnderscore(row.slug);
    resources.rows.push_back(row);
  }
  cats.push_back(resources);

  Category actions;
  actions.ns = "manifest_actions";
  actions.tableName = "kManifestActionSymbols";
  actions.lookupName = "find_manifest_action_symbol";
  for (size_t i = 0; i < m.actions.size(); ++i) {
    SymRow row;
    row.id = m.actions[i].id;
    row.slug = m.strings.at(m.actions[i].slugIdx);
    row.symbol = dotToUnderscore(row.slug);
    actions.rows.push_back(row);
  }
  cats.push_back(actions);

  Category screens;
  screens.ns = "manifest_screens";
  screens.tableName = "kManifestScreenSymbols";
  screens.lookupName = "find_manifest_screen_symbol";
  for (size_t i = 0; i < m.screens.size(); ++i) {
    SymRow row;
    row.id = m.screens[i].id;
    row.slug = m.strings.at(m.screens[i].slugIdx);
    row.symbol = screenSymbol(row.slug);
    screens.rows.push_back(row);
  }
  cats.push_back(screens);

  Category nodes;
  nodes.ns = "manifest_nodes";
  nodes.tableName = "kManifestNodeSymbols";
  nodes.lookupName = "find_manifest_node_symbol";
  for (size_t i = 0; i < m.nodes.size(); ++i) {
    SymRow row;
    row.id = m.nodes[i].id;
    row.slug = m.strings.at(m.nodes[i].slugIdx);
    row.symbol = dotToUnderscore(row.slug);
    nodes.rows.push_back(row);
  }
  cats.push_back(nodes);

  const std::string headerPath = outDir + "manifest_symbols.h";
  const std::string sourcePath = outDir + "manifest_symbols.cpp";
  if (!writeFile(headerPath, renderSymbolHeader(cats))) return 1;
  if (!writeFile(sourcePath, renderSymbolSource(cats))) return 1;
  std::printf("[ui_emit] wrote %s + %s\n", headerPath.c_str(), sourcePath.c_str());

  return 0;
}
