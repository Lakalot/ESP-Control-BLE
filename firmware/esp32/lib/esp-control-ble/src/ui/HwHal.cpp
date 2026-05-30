#include "ui/HwHal.h"
#if !defined(UNIT_TEST) && !defined(ECB_HOST_EMIT)
#include <Arduino.h>
#endif
namespace ecb { namespace ui {
static AnalogWriteFn  s_analog  = 0;
static DigitalWriteFn s_digital = 0;
void setAnalogWriteForTest(AnalogWriteFn fn)  { s_analog  = fn; }
void setDigitalWriteForTest(DigitalWriteFn fn) { s_digital = fn; }
void halAnalogWrite(uint8_t pin, int value) {
  if (s_analog) { s_analog(pin, value); return; }
#if !defined(UNIT_TEST) && !defined(ECB_HOST_EMIT)
  analogWrite(pin, value);
#else
  (void)pin; (void)value;
#endif
}
void halDigitalWrite(uint8_t pin, bool level) {
  if (s_digital) { s_digital(pin, level); return; }
#if !defined(UNIT_TEST) && !defined(ECB_HOST_EMIT)
  digitalWrite(pin, level ? HIGH : LOW);
#else
  (void)pin; (void)level;
#endif
}
}} // namespace
