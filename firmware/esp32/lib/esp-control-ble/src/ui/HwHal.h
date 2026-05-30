#pragma once
#include <cstdint>
namespace ecb { namespace ui {
// HAL seam so native tests can intercept HW writes. On device, the defaults call
// Arduino (compiled only when NOT UNIT_TEST and NOT ECB_HOST_EMIT).
typedef void (*AnalogWriteFn)(uint8_t pin, int value);
typedef void (*DigitalWriteFn)(uint8_t pin, bool level);
void setAnalogWriteForTest(AnalogWriteFn fn);
void setDigitalWriteForTest(DigitalWriteFn fn);
void halAnalogWrite(uint8_t pin, int value);
void halDigitalWrite(uint8_t pin, bool level);
}} // namespace
