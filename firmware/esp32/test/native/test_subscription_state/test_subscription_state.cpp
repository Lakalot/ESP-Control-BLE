#include <unity.h>
#include "protocol/subscriptions/SubscriptionState.h"

using ecb::SubscriptionState;

void setUp() {}
void tearDown() {}

static void test_add_and_check() {
  SubscriptionState s;
  s.add(10);
  s.add(11);
  TEST_ASSERT_TRUE(s.isWatching(10));
  TEST_ASSERT_TRUE(s.isWatching(11));
  TEST_ASSERT_FALSE(s.isWatching(12));
}

static void test_remove_only_affects_that_id() {
  SubscriptionState s;
  s.add(10); s.add(11);
  s.remove(10);
  TEST_ASSERT_FALSE(s.isWatching(10));
  TEST_ASSERT_TRUE(s.isWatching(11));
}

static void test_clear_drops_everything() {
  SubscriptionState s;
  s.add(1); s.add(2); s.add(3);
  s.clear();
  TEST_ASSERT_FALSE(s.isWatching(1));
  TEST_ASSERT_EQUAL(0u, s.size());
}

static void test_dedup_add() {
  SubscriptionState s;
  s.add(7); s.add(7); s.add(7);
  TEST_ASSERT_EQUAL(1u, s.size());
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_add_and_check);
  RUN_TEST(test_remove_only_affects_that_id);
  RUN_TEST(test_clear_drops_everything);
  RUN_TEST(test_dedup_add);
  return UNITY_END();
}
