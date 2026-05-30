#pragma once
// Shared FreeRTOS shim.
//
// On hardware this pulls in the real FreeRTOS mutex API. Under UNIT_TEST the
// native suite is single-threaded, so it provides no-op stand-ins for the
// handful of semaphore primitives the firmware uses. Centralizing the stub here
// (behind the #pragma once guard) lets multiple headers — e.g. ResourceTable.h
// and DataBleTransport.h — be included in the same translation unit without
// redefining portMAX_DELAY or the inline shims.

#ifdef UNIT_TEST

using SemaphoreHandle_t = void*;
constexpr int portMAX_DELAY = 0;
inline SemaphoreHandle_t xSemaphoreCreateMutex() { return nullptr; }
inline void xSemaphoreTake(SemaphoreHandle_t, int) {}
inline void xSemaphoreGive(SemaphoreHandle_t) {}

#else

#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>

#endif
