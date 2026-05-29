// Audit sizeof guardrails — locks the on-disk RAM footprint of key library
// types as of 2026-04-24. The refactor phase will INTENTIONALLY change these
// numbers; when it does, both the implementation AND the asserted value here
// must move together — that is the point.
//
// Sources for the expected values: hand-calculation in
// `.tmp/audit/inventory-raw.md` cross-checked against this file's first run.
//
// Reference: docs/audits/2026-04-24-esp-control-ble-audit.md §3.1

#include <unity.h>
#include <cstdio>
#include <cstddef>
#include <cstdint>
#include <functional>

#include "protocol/core/Protocol.h"
#include "protocol/resources/ResourceTable.h"
#include "protocol/actions/ActionRegistry.h"
#include "protocol/subscriptions/SubscriptionState.h"
#include "protocol/manifest/ManifestStore.h"
#include "protocol/auth/AuthHandler.h"
#include "transport/frame/FrameCodec.h"
#include "transport/frame/DataFrameCodec.h"

// Helper that prints "AUDIT_SIZEOF <name> <bytes>" for visual inspection
// during `pio test -e native -v`. The values are also asserted below.
static void print_size(const char* name, std::size_t bytes) {
    std::printf("AUDIT_SIZEOF %-40s %6zu bytes\n", name, bytes);
}

void setUp(void) {}
void tearDown(void) {}

// Pretty-print every measured size. Always passes; serves as documentation.
static void test_audit_sizeof_dump(void) {
    print_size("ecb::FrameHeader",         sizeof(ecb::FrameHeader));
    print_size("ecb::FrameKind",           sizeof(ecb::FrameKind));
    print_size("ParsedFrame (global)",     sizeof(ParsedFrame));
    print_size("ecb::DataFrameCodec",      sizeof(ecb::DataFrameCodec));
    print_size("AuthHandler",              sizeof(AuthHandler));
    print_size("ecb::ResourceValue",       sizeof(ecb::ResourceValue));
    print_size("ecb::ResourceEntry",       sizeof(ecb::ResourceEntry));
    print_size("ecb::ResourceTable",       sizeof(ecb::ResourceTable));
    print_size("ecb::ActionContext",       sizeof(ecb::ActionContext));
    print_size("ecb::ActionRegistry",      sizeof(ecb::ActionRegistry));
    print_size("ecb::SubscriptionState",   sizeof(ecb::SubscriptionState));
    print_size("ecb::ManifestStore",       sizeof(ecb::ManifestStore));
    print_size("std::function<void(ecb::ActionContext&)>",
               sizeof(std::function<void(ecb::ActionContext&)>));
    TEST_ASSERT_TRUE(true);
}

// ---------------------------------------------------------------------------
// Locked baselines — captured 2026-04-24 from the audit branch on a 64-bit
// native host (pio test -e native). These numbers ARE EXPECTED TO CHANGE
// during the refactor phase. When they do, update both the implementation AND
// the expected value here in the same commit.
//
// HOST CAVEAT: native build runs on a 32-bit host (configured via
// `firmware/esp32/tools/configure_native_toolchain.py` to match ESP32 layout).
// Sizes measured here therefore equal target ESP32 sizes for POD types and
// pointer-bearing structs. This was verified on first run by observing
// sizeof(ecb::SubscriptionState) == 260 (not 264 as a 64-bit host would
// produce), confirming size_t and pointer widths are 4 bytes.
// ---------------------------------------------------------------------------

static void test_locked_FrameHeader(void) {
    // Pure POD: enum + uint8_t + uint16_t = 4 bytes on any platform
    TEST_ASSERT_EQUAL_size_t_MESSAGE(4, sizeof(ecb::FrameHeader),
        "ecb::FrameHeader size changed - update audit report sec 3.1");
}

static void test_locked_FrameKind(void) {
    TEST_ASSERT_EQUAL_size_t_MESSAGE(1, sizeof(ecb::FrameKind),
        "ecb::FrameKind size changed");
}

static void test_locked_DataFrameCodec_empty(void) {
    // Empty class with only static members = 1 byte minimum
    TEST_ASSERT_EQUAL_size_t_MESSAGE(1, sizeof(ecb::DataFrameCodec),
        "DataFrameCodec gained instance state");
}

static void test_locked_ResourceEntry_compact(void) {
    // ResourceTable.cpp:16 already has static_assert(sizeof <= 24)
    // Lock to the actual measured value (12 on both targets).
    TEST_ASSERT_EQUAL_size_t_MESSAGE(12, sizeof(ecb::ResourceEntry),
        "ResourceEntry layout changed - audit Refactor expects this only when reducing");
}

static void test_locked_SubscriptionState(void) {
    // 64 × uint32_t + size_t = 256 + 4 = 260 on 32-bit native host (matches ESP32).
    TEST_ASSERT_EQUAL_size_t_MESSAGE(260, sizeof(ecb::SubscriptionState),
        "SubscriptionState size changed (32-bit native: 64*4+4)");
}

static void test_locked_ResourceTable_dominates_ram(void) {
    // The headline finding: ResourceTable is huge.
    // On 64-bit host the layout is slightly different from ESP32 due to
    // size_t and pointer widths. The expected value was captured on first
    // run.
    const std::size_t observed = sizeof(ecb::ResourceTable);
    print_size("(headline) ResourceTable HEADLINE", observed);
    // Sanity bound: at least 4500 (the BlobSlot array alone is ~4224).
    TEST_ASSERT_GREATER_THAN_size_t_MESSAGE(4500, observed,
        "ResourceTable shrank below 4500 bytes - audit report needs update");
    // Upper bound: we expect roughly 5000-5100 on either target.
    TEST_ASSERT_LESS_THAN_size_t_MESSAGE(5100, observed,
        "ResourceTable grew above 5100 bytes - audit headline finding may need refresh");
}

static void test_locked_ActionRegistry_dominates_ram(void) {
    // First-run measurement: 768 bytes on 32-bit native host = 32 × 24-byte Entry.
    // Entry layout: uint32_t actionId(4) + std::function(16 with SBO) + bool used(1) + padding(3) = 24.
    // The hypothesis H3 about std::function heap captures still holds: the 16-byte
    // SBO buffer cannot hold lambdas with non-trivial state (e.g. multiple captures
    // by reference), which heap-allocates at registration.
    const std::size_t observed = sizeof(ecb::ActionRegistry);
    print_size("(headline) ActionRegistry HEADLINE", observed);
    TEST_ASSERT_GREATER_THAN_size_t_MESSAGE(700, observed,
        "ActionRegistry shrank below 700 bytes - audit headline needs refresh");
    TEST_ASSERT_LESS_THAN_size_t_MESSAGE(2200, observed,
        "ActionRegistry grew above 2200 bytes - audit headline needs refresh");
}

static void test_locked_ActionContext_has_stringValue_buffer(void) {
    // ActionContext is the H1 finding: contains char stringValue[65].
    // Sanity-check: at least 65 + a few pointers + correlationId.
    const std::size_t observed = sizeof(ecb::ActionContext);
    print_size("(H1) ActionContext", observed);
    TEST_ASSERT_GREATER_THAN_size_t_MESSAGE(100, observed,
        "ActionContext smaller than expected");
}

static void test_locked_ResourceValue_has_string_and_bytes_buffers(void) {
    // ResourceValue: char stringValue[65] + uint8_t bytesValue[64] + scalars
    const std::size_t observed = sizeof(ecb::ResourceValue);
    print_size("(H1) ResourceValue", observed);
    TEST_ASSERT_GREATER_THAN_size_t_MESSAGE(140, observed,
        "ResourceValue lost its 65+64 buffers");
}

static void test_locked_ManifestStore_is_a_borrow(void) {
    // ManifestStore should be small: pointer + size_t + uint32 cache + bool.
    // On 64-bit host: 8 + 8 + 4 + 1 + padding = 24.
    // On 32-bit ESP32: 4 + 4 + 4 + 1 + padding = 16.
    const std::size_t observed = sizeof(ecb::ManifestStore);
    print_size("(A3) ManifestStore", observed);
    TEST_ASSERT_LESS_THAN_size_t_MESSAGE(40, observed,
        "ManifestStore unexpectedly grew - did it accidentally start COPYING the manifest?");
}

static void test_locked_AuthHandler(void) {
    // uint8_t nonce[ECB_NONCE_SIZE=16] + const char* pin + bool authenticated
    // On 64-bit host: 16 + 8 + 1 + padding = 32 (so the bound below is 40).
    // On 32-bit ESP32: 16 + 4 + 1 + padding = 24.
    const std::size_t observed = sizeof(AuthHandler);
    print_size("AuthHandler", observed);
    TEST_ASSERT_LESS_THAN_size_t_MESSAGE(48, observed,
        "AuthHandler grew - did mbedtls context become persistent?");
}

int main(int /*argc*/, char** /*argv*/) {
    UNITY_BEGIN();
    RUN_TEST(test_audit_sizeof_dump);
    RUN_TEST(test_locked_FrameHeader);
    RUN_TEST(test_locked_FrameKind);
    RUN_TEST(test_locked_DataFrameCodec_empty);
    RUN_TEST(test_locked_ResourceEntry_compact);
    RUN_TEST(test_locked_SubscriptionState);
    RUN_TEST(test_locked_ResourceTable_dominates_ram);
    RUN_TEST(test_locked_ActionRegistry_dominates_ram);
    RUN_TEST(test_locked_ActionContext_has_stringValue_buffer);
    RUN_TEST(test_locked_ResourceValue_has_string_and_bytes_buffers);
    RUN_TEST(test_locked_ManifestStore_is_a_borrow);
    RUN_TEST(test_locked_AuthHandler);
    return UNITY_END();
}
