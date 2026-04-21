#pragma once

#ifdef UNIT_TEST

#define ECB_LOGF(...) do {} while (0)
#define ECB_DATA_DEBUGF(...) do {} while (0)

#else

#include <Arduino.h>

#if defined(ECB_ENABLE_DEBUG_LOGS)
#define ECB_LOGF(...) Serial.printf(__VA_ARGS__)
#else
#define ECB_LOGF(...) do {} while (0)
#endif

#if defined(ECB_ENABLE_DATA_DEBUG_LOGS)
#define ECB_DATA_DEBUGF(...) Serial.printf(__VA_ARGS__)
#else
#define ECB_DATA_DEBUGF(...) do {} while (0)
#endif

#endif
