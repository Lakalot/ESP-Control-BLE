#include <unity.h>
#include <pb.h>
#include <pb_encode.h>
#include <pb_decode.h>

void setUp() {}
void tearDown() {}

static void test_nanopb_symbols_linked() {
  pb_ostream_t stream = pb_ostream_from_buffer(nullptr, 0);
  TEST_ASSERT_EQUAL(0u, stream.bytes_written);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_nanopb_symbols_linked);
  return UNITY_END();
}
