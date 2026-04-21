#include <unity.h>
#include <pb_decode.h>
#include <string.h>
#include "protocol/snapshot/SnapshotEncoder.h"
#include "protocol/resources/ResourceTable.h"
#include "nanopb/manifest.pb.h"

using ecb::ResourceTable;
using ecb::ResourceValue;
using ecb::ResourceValueKind;
using ecb::SnapshotEncoder;

void setUp() {}
void tearDown() {}

struct DecodeCtx { size_t count; };

static bool countValues(pb_istream_t* stream, const pb_field_t* /*field*/, void** arg) {
  DecodeCtx* ctx = static_cast<DecodeCtx*>(*arg);
  esp_control_ResourceValue rv = esp_control_ResourceValue_init_zero;
  if (!pb_decode(stream, esp_control_ResourceValue_fields, &rv)) return false;
  ctx->count += 1;
  return true;
}

struct Cursor {
  const uint8_t* ptr;
  size_t remaining;
};

static bool readVarint(Cursor& cursor, uint64_t& value) {
  value = 0;
  uint8_t shift = 0;
  while (cursor.remaining > 0 && shift < 64) {
    const uint8_t byte = *cursor.ptr++;
    cursor.remaining -= 1;
    value |= static_cast<uint64_t>(byte & 0x7Fu) << shift;
    if ((byte & 0x80u) == 0) return true;
    shift = static_cast<uint8_t>(shift + 7u);
  }
  return false;
}

static bool readLengthDelimited(Cursor& cursor, Cursor& submessage) {
  uint64_t length = 0;
  if (!readVarint(cursor, length) || length > cursor.remaining) return false;
  submessage.ptr = cursor.ptr;
  submessage.remaining = static_cast<size_t>(length);
  cursor.ptr += length;
  cursor.remaining -= static_cast<size_t>(length);
  return true;
}

static bool skipField(Cursor& cursor, uint8_t wireType) {
  switch (wireType) {
    case 0: {
      uint64_t ignored = 0;
      return readVarint(cursor, ignored);
    }
    case 2: {
      Cursor skipped{};
      return readLengthDelimited(cursor, skipped);
    }
    default:
      return false;
  }
}

static bool commonValueContainsString(Cursor cursor, const char* expected) {
  while (cursor.remaining > 0) {
    uint64_t key = 0;
    if (!readVarint(cursor, key)) return false;
    const uint32_t fieldNumber = static_cast<uint32_t>(key >> 3);
    const uint8_t wireType = static_cast<uint8_t>(key & 0x07u);
    if (fieldNumber == 5u && wireType == 2u) {
      Cursor str{};
      if (!readLengthDelimited(cursor, str)) return false;
      const size_t expectedLen = strlen(expected);
      return str.remaining == expectedLen && memcmp(str.ptr, expected, expectedLen) == 0;
    }
    if (!skipField(cursor, wireType)) return false;
  }
  return false;
}

static bool resourceValueContainsString(Cursor cursor, const char* expected) {
  while (cursor.remaining > 0) {
    uint64_t key = 0;
    if (!readVarint(cursor, key)) return false;
    const uint32_t fieldNumber = static_cast<uint32_t>(key >> 3);
    const uint8_t wireType = static_cast<uint8_t>(key & 0x07u);
    if (fieldNumber == 2u && wireType == 2u) {
      Cursor commonValue{};
      if (!readLengthDelimited(cursor, commonValue)) return false;
      return commonValueContainsString(commonValue, expected);
    }
    if (!skipField(cursor, wireType)) return false;
  }
  return false;
}

static bool snapshotContainsStringValue(const uint8_t* data, size_t len, const char* expected) {
  Cursor cursor{data, len};
  while (cursor.remaining > 0) {
    uint64_t key = 0;
    if (!readVarint(cursor, key)) return false;
    const uint32_t fieldNumber = static_cast<uint32_t>(key >> 3);
    const uint8_t wireType = static_cast<uint8_t>(key & 0x07u);
    if (fieldNumber == 1u && wireType == 2u) {
      Cursor resourceValue{};
      if (!readLengthDelimited(cursor, resourceValue)) return false;
      if (resourceValueContainsString(resourceValue, expected)) return true;
      continue;
    }
    if (!skipField(cursor, wireType)) return false;
  }
  return false;
}

static bool commonValueContainsBytes(Cursor cursor, const uint8_t* expected, size_t expectedLen) {
  while (cursor.remaining > 0) {
    uint64_t key = 0;
    if (!readVarint(cursor, key)) return false;
    const uint32_t fieldNumber = static_cast<uint32_t>(key >> 3);
    const uint8_t wireType = static_cast<uint8_t>(key & 0x07u);
    if (fieldNumber == 5u && wireType == 2u) {
      Cursor bytes{};
      if (!readLengthDelimited(cursor, bytes)) return false;
      return bytes.remaining == expectedLen && memcmp(bytes.ptr, expected, expectedLen) == 0;
    }
    if (!skipField(cursor, wireType)) return false;
  }
  return false;
}

static bool resourceValueContainsBytes(Cursor cursor, uint32_t resourceId,
                                       const uint8_t* expected, size_t expectedLen) {
  bool matchesResourceId = false;
  while (cursor.remaining > 0) {
    uint64_t key = 0;
    if (!readVarint(cursor, key)) return false;
    const uint32_t fieldNumber = static_cast<uint32_t>(key >> 3);
    const uint8_t wireType = static_cast<uint8_t>(key & 0x07u);
    if (fieldNumber == 1u && wireType == 0u) {
      uint64_t decodedId = 0;
      if (!readVarint(cursor, decodedId)) return false;
      matchesResourceId = decodedId == resourceId;
      continue;
    }
    if (fieldNumber == 2u && wireType == 2u) {
      Cursor commonValue{};
      if (!readLengthDelimited(cursor, commonValue)) return false;
      return matchesResourceId && commonValueContainsBytes(commonValue, expected, expectedLen);
    }
    if (!skipField(cursor, wireType)) return false;
  }
  return false;
}

static bool snapshotContainsBytesValue(const uint8_t* data, size_t len, uint32_t resourceId,
                                       const uint8_t* expected, size_t expectedLen) {
  Cursor cursor{data, len};
  while (cursor.remaining > 0) {
    uint64_t key = 0;
    if (!readVarint(cursor, key)) return false;
    const uint32_t fieldNumber = static_cast<uint32_t>(key >> 3);
    const uint8_t wireType = static_cast<uint8_t>(key & 0x07u);
    if (fieldNumber == 1u && wireType == 2u) {
      Cursor resourceValue{};
      if (!readLengthDelimited(cursor, resourceValue)) return false;
      if (resourceValueContainsBytes(resourceValue, resourceId, expected, expectedLen)) return true;
      continue;
    }
    if (!skipField(cursor, wireType)) return false;
  }
  return false;
}

static bool deltaContainsBytesValue(const uint8_t* data, size_t len, uint32_t resourceId,
                                    const uint8_t* expected, size_t expectedLen) {
  return resourceValueContainsBytes(Cursor{data, len}, resourceId, expected, expectedLen);
}

static void test_encode_two_resources_round_trips_via_nanopb() {
  ResourceTable t;
  t.setBool(10, true);
  t.setInt(20, -5);
  uint8_t buf[256] = {0};
  size_t written = 0;
  TEST_ASSERT_TRUE(SnapshotEncoder::encode(t, buf, sizeof(buf), written));
  TEST_ASSERT_GREATER_THAN(0u, written);

  DecodeCtx ctx{};
  esp_control_ResourceSnapshot decoded = esp_control_ResourceSnapshot_init_zero;
  decoded.values.funcs.decode = countValues;
  decoded.values.arg = &ctx;
  pb_istream_t is = pb_istream_from_buffer(buf, written);
  TEST_ASSERT_TRUE(pb_decode(&is, esp_control_ResourceSnapshot_fields, &decoded));
  TEST_ASSERT_EQUAL(2u, ctx.count);
  TEST_ASSERT_EQUAL(t.generation(), decoded.generation);
}

static void test_encode_includes_string_values() {
  ResourceTable t;
  t.setString(10, "hello");

  uint8_t buf[256] = {0};
  size_t written = 0;
  TEST_ASSERT_TRUE(SnapshotEncoder::encode(t, buf, sizeof(buf), written));
  TEST_ASSERT_GREATER_THAN(0u, written);

  DecodeCtx ctx{};
  esp_control_ResourceSnapshot decoded = esp_control_ResourceSnapshot_init_zero;
  decoded.values.funcs.decode = countValues;
  decoded.values.arg = &ctx;

  pb_istream_t is = pb_istream_from_buffer(buf, written);
  TEST_ASSERT_TRUE(pb_decode(&is, esp_control_ResourceSnapshot_fields, &decoded));
  TEST_ASSERT_TRUE(snapshotContainsStringValue(buf, written, "hello"));
}

static void test_encode_includes_bytes_values() {
  ResourceTable t;
  const uint8_t payload[] = {0x00, 0x7F, 0x80, 0xFF};
  t.setBytes(21, payload, sizeof(payload));

  uint8_t buf[256] = {0};
  size_t written = 0;
  TEST_ASSERT_TRUE(SnapshotEncoder::encode(t, buf, sizeof(buf), written));
  TEST_ASSERT_GREATER_THAN(0u, written);
  TEST_ASSERT_TRUE(snapshotContainsBytesValue(buf, written, 21, payload, sizeof(payload)));
}

static void test_encode_delta_includes_blob_backed_bytes_values() {
  ResourceValue value{};
  value.resourceId = 33;
  value.kind = ResourceValueKind::Bytes;
  const uint8_t payload[] = {0x41, 0x00, 0x42};
  memcpy(value.bytesValue, payload, sizeof(payload));
  value.bytesLength = sizeof(payload);

  uint8_t buf[256] = {0};
  size_t written = 0;
  TEST_ASSERT_TRUE(SnapshotEncoder::encodeDelta(value, 9, buf, sizeof(buf), written));
  TEST_ASSERT_GREATER_THAN(0u, written);
  TEST_ASSERT_TRUE(deltaContainsBytesValue(buf, written, 33, payload, sizeof(payload)));
}

static void test_encode_overflow_returns_false() {
  ResourceTable t;
  for (uint32_t i = 0; i < 64; ++i) t.setInt(i, 0);
  uint8_t tiny[8] = {0};
  size_t written = 0;
  TEST_ASSERT_FALSE(SnapshotEncoder::encode(t, tiny, sizeof(tiny), written));
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_encode_two_resources_round_trips_via_nanopb);
  RUN_TEST(test_encode_includes_string_values);
  RUN_TEST(test_encode_includes_bytes_values);
  RUN_TEST(test_encode_delta_includes_blob_backed_bytes_values);
  RUN_TEST(test_encode_overflow_returns_false);
  return UNITY_END();
}
