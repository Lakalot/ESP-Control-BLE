#include <unity.h>

void test_publish_scheduler_gates_until_interval_elapsed();
void test_publish_scheduler_handles_millis_wraparound();
void test_app_runtime_routes_action_and_telemetry_updates_through_device_state();
void test_app_runtime_clamps_signed_action_values_before_updating_state();
void test_device_telemetry_samples_load_and_resets_the_window();
void test_device_telemetry_uses_previous_load_when_elapsed_time_is_not_positive();

void setUp() {}
void tearDown() {}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_publish_scheduler_gates_until_interval_elapsed);
  RUN_TEST(test_publish_scheduler_handles_millis_wraparound);
  RUN_TEST(test_app_runtime_routes_action_and_telemetry_updates_through_device_state);
  RUN_TEST(test_app_runtime_clamps_signed_action_values_before_updating_state);
  RUN_TEST(test_device_telemetry_samples_load_and_resets_the_window);
  RUN_TEST(test_device_telemetry_uses_previous_load_when_elapsed_time_is_not_positive);
  return UNITY_END();
}
