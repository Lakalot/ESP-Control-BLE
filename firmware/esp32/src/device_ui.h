#pragma once
#include "ui/Ui.h"
#include "ui/Res.h"

// Shared typed handles for values pushed from loop()/sensors (telemetry). They are
// assigned in buildUi() (a single description visited twice: EmitterUi on the host
// to emit the manifest, RuntimeUi on the device to seed resources + handlers) and
// written from main.cpp's loop(). On EmitterUi a Res<T> write is a harmless no-op;
// on RuntimeUi it writes the ResourceTable + publishes the delta over the wire.
namespace dev {
extern ecb::ui::Res<float>    temperature;
extern ecb::ui::Res<float>    humidity;
extern ecb::ui::Res<uint32_t> load;
extern ecb::ui::Res<int32_t>  rssi;
extern ecb::ui::Res<uint32_t> uptime;
}  // namespace dev

// The single device UI description. Defined in src/device_ui.cpp; shared with the
// host emitter (tools/ui_emit_main.cpp) and the device runtime (EspControl::beginUi).
void buildUi(ecb::ui::Ui& ui);
