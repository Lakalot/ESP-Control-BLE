#pragma once

#include "ui/Ui.h"

namespace app {
class AppRuntime;
}  // namespace app

// The single device UI description, defined in app/device/device_ui.cpp. Visited
// twice with the same fluent builder:
//   * host:   EmitterUi (tools/ui_emit_main.cpp) -> manifest_data.h / symbols.
//   * device: RuntimeUi (runtime/AppRuntime.cpp) -> resources + .onSet handlers.
// Declared here so both call sites share one prototype.
void buildUi(ecb::ui::Ui& ui, app::AppRuntime& rt);
