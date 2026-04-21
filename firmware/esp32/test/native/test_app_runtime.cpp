#include <unity.h>

#include "../../app/device/DeviceTelemetry.h"
#include "../../app/device/DeviceState.h"
#include "../../app/runtime/AppRuntime.h"
#include "../../app/runtime/PublishScheduler.h"

using app::AppRuntime;
using app::DeviceTelemetry;
using app::DeviceState;
using app::PublishScheduler;

void test_publish_scheduler_gates_until_interval_elapsed() {
  PublishScheduler scheduler(2000u);

  TEST_ASSERT_TRUE(scheduler.shouldPublish(0u));
  TEST_ASSERT_FALSE(scheduler.shouldPublish(1999u));
  TEST_ASSERT_TRUE(scheduler.shouldPublish(2000u));
  TEST_ASSERT_FALSE(scheduler.shouldPublish(3999u));
  TEST_ASSERT_TRUE(scheduler.shouldPublish(4000u));
}

void test_publish_scheduler_handles_millis_wraparound() {
  PublishScheduler scheduler(1000u);

  TEST_ASSERT_TRUE(scheduler.shouldPublish(0xFFFFFF00u));
  TEST_ASSERT_FALSE(scheduler.shouldPublish(0xFFFFFF80u));
  TEST_ASSERT_TRUE(scheduler.shouldPublish(0x000002E8u));
}

void test_app_runtime_routes_action_and_telemetry_updates_through_device_state() {
  AppRuntime runtime;

  const DeviceState& initial = runtime.state();
  TEST_ASSERT_FALSE(initial.relayEnabled);
  TEST_ASSERT_EQUAL_UINT8(0u, initial.brightness);
  TEST_ASSERT_FLOAT_WITHIN(0.001f, 0.0f, initial.temperatureC);
  TEST_ASSERT_EQUAL_UINT8(0u, initial.fanProfile);
  TEST_ASSERT_EQUAL_UINT32(0u, initial.loadPercent);
  TEST_ASSERT_FALSE(initial.debugEnabled);

  runtime.toggleRelay();
  runtime.setBrightness(120u);
  runtime.setFanProfile(3u);
  runtime.setDebugEnabled(true);
  runtime.updateTemperature(31.5f);
  runtime.updateLoadPercent(55u);

  const DeviceState& updated = runtime.state();
  TEST_ASSERT_TRUE(updated.relayEnabled);
  TEST_ASSERT_EQUAL_UINT8(100u, updated.brightness);
  TEST_ASSERT_FLOAT_WITHIN(0.001f, 31.5f, updated.temperatureC);
  TEST_ASSERT_EQUAL_UINT8(3u, updated.fanProfile);
  TEST_ASSERT_EQUAL_UINT32(55u, updated.loadPercent);
  TEST_ASSERT_TRUE(updated.debugEnabled);
}

void test_app_runtime_clamps_signed_action_values_before_updating_state() {
  AppRuntime runtime;

  runtime.setBrightness(-10);
  runtime.setFanProfile(-4);

  TEST_ASSERT_EQUAL_UINT8(0u, runtime.state().brightness);
  TEST_ASSERT_EQUAL_UINT8(0u, runtime.state().fanProfile);

  runtime.setBrightness(120u);
  runtime.setFanProfile(300u);

  TEST_ASSERT_EQUAL_UINT8(100u, runtime.state().brightness);
  TEST_ASSERT_EQUAL_UINT8(255u, runtime.state().fanProfile);
}

void test_device_telemetry_samples_load_and_resets_the_window() {
  int64_t windowStartUs = 1000;
  uint64_t windowWorkUs = 400;

  const uint32_t load = DeviceTelemetry::sampleLoadPercent(1500, windowStartUs, windowWorkUs, 33u);

  TEST_ASSERT_EQUAL_UINT32(80u, load);
  TEST_ASSERT_EQUAL_INT32(1500, static_cast<int32_t>(windowStartUs));
  TEST_ASSERT_EQUAL_UINT32(0u, static_cast<uint32_t>(windowWorkUs));
}

void test_device_telemetry_uses_previous_load_when_elapsed_time_is_not_positive() {
  int64_t windowStartUs = 2000;
  uint64_t windowWorkUs = 75;

  const uint32_t load = DeviceTelemetry::sampleLoadPercent(2000, windowStartUs, windowWorkUs, 41u);

  TEST_ASSERT_EQUAL_UINT32(41u, load);
  TEST_ASSERT_EQUAL_INT32(2000, static_cast<int32_t>(windowStartUs));
  TEST_ASSERT_EQUAL_UINT32(75u, static_cast<uint32_t>(windowWorkUs));
}
