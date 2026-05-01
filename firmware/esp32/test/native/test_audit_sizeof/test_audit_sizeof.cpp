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
#include "protocol/commands/CommandRegistry.h"
#include "EspControlBle.h"
#include "transport/ble/BleTransport.h"
#include "transport/frame/FrameCodec.h"
#include "transport/frame/DataFrameCodec.h"

// Helper that prints "AUDIT_SIZEOF <name> <bytes>" for visual inspection
// during `pio test -e native -v`. The values are also asserted below.
static void print_size(const char* name, std::size_t bytes) {
    std::printf("AUDIT_SIZEOF %-40s %6zu bytes\n", name, bytes);
}

static std::size_t expected_for_pointer_width(std::size_t expected32,
                                              std::size_t expected64) {
    if (sizeof(void*) == 4) return expected32;
    if (sizeof(void*) == 8) return expected64;
    TEST_FAIL_MESSAGE("Unsupported native pointer width for sizeof audit");
    return 0;
}

static std::size_t expected_action_registry_size(void) {
    struct ExpectedEntry {
        uint32_t actionId;
        std::function<void(ecb::ActionContext&)> handler;
        bool used;
    };

    return sizeof(ExpectedEntry) * 32;
}

static constexpr std::size_t kProductionBleCharacteristicPointers = 2;
static constexpr std::size_t kEspControlEsp32Limit = 6500;
static constexpr std::size_t kBleTransportEsp32Limit = 80;
static constexpr std::size_t kEspControlHost64SanityLimit = 8000;
static constexpr std::size_t kBleTransportHost64SanityLimit = 128;

static std::size_t production_ble_transport_size(void) {
    // UNIT_TEST omits _cmdChar/_dataChar; account for the production pointers.
    return sizeof(BleTransport) + (kProductionBleCharacteristicPointers * sizeof(void*));
}

static std::size_t production_esp_control_size(void) {
    // EspControl embeds BleTransport, so apply the same production adjustment.
    return sizeof(EspControl) + (kProductionBleCharacteristicPointers * sizeof(void*));
}

static void assert_production_adjusted_size(const char* message,
                                            std::size_t observed,
                                            std::size_t esp32Limit,
                                            std::size_t host64Limit) {
    if (sizeof(void*) == 4) {
        TEST_ASSERT_LESS_OR_EQUAL_size_t_MESSAGE(esp32Limit, observed, message);
        return;
    }

    TEST_ASSERT_LESS_OR_EQUAL_size_t_MESSAGE(host64Limit, observed, message);
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
    print_size("CmdContext",               sizeof(CmdContext));
    print_size("CommandRegistry",          sizeof(CommandRegistry));
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
// HOST CAVEAT: Windows native builds are configured as 32-bit by
// `firmware/esp32/tools/configure_native_toolchain.py`, matching ESP32 pointer
// and size_t widths. Linux/macOS native builds may be 64-bit, so
// pointer-bearing types use pointer-width-specific baselines below.
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
    // 64 x uint32_t + size_t = 260 on 32-bit native/ESP32, 264 on 64-bit native.
    const std::size_t expected = expected_for_pointer_width(260, 264);
    TEST_ASSERT_EQUAL_size_t_MESSAGE(expected, sizeof(ecb::SubscriptionState),
        "SubscriptionState size changed for this native pointer width");
}

static void test_locked_ResourceTable_dominates_ram(void) {
    // The headline finding: ResourceTable is huge.
    // 32-bit native/ESP32: 5000 bytes. 64-bit native: size_t padding raises it
    // to 5008 bytes.
    const std::size_t observed = sizeof(ecb::ResourceTable);
    const std::size_t expected = expected_for_pointer_width(5000, 5008);
    print_size("(headline) ResourceTable HEADLINE", observed);
    TEST_ASSERT_EQUAL_size_t_MESSAGE(expected, observed,
        "ResourceTable size changed for this native pointer width");
}

static void test_locked_ActionRegistry_dominates_ram(void) {
    // First-run measurement: 768 bytes on 32-bit native host = 32 x 24-byte Entry.
    // 64-bit native baseline is 1536 bytes = 32 x 48-byte Entry.
    // Plain POD-ish types above key off pointer width. ActionRegistry also embeds
    // std::function, whose SBO size/layout varies by STL implementation, so model
    // the current Entry shape with this toolchain's std::function size/alignment.
    // The hypothesis H3 about std::function heap captures still holds: the 16-byte
    // SBO buffer cannot hold lambdas with non-trivial state (e.g. multiple captures
    // by reference), which heap-allocates at registration.
    const std::size_t observed = sizeof(ecb::ActionRegistry);
    const std::size_t expected = expected_action_registry_size();
    print_size("(headline) ActionRegistry HEADLINE", observed);
    TEST_ASSERT_EQUAL_size_t_MESSAGE(expected, observed,
        "ActionRegistry size changed for this native std::function layout");
}

static void test_locked_CommandRegistry(void) {
    // 32 × Entry, Entry = uint8_t + fn-pointer + bool with padding.
    // On 64-bit host: 8-byte fn-pointer => Entry = 16, total = 512.
    // On 32-bit ESP32: 4-byte fn-pointer => Entry = 12, total = 384.
    const std::size_t observed = sizeof(CommandRegistry);
    const std::size_t expected = expected_for_pointer_width(384, 512);
    print_size("(footprint) CommandRegistry", observed);
    TEST_ASSERT_EQUAL_size_t_MESSAGE(expected, observed,
        "CommandRegistry size changed for this native pointer width");
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
    // uint8_t nonce[4] + const char* pin + bool authenticated
    // On 64-bit host: 4 + 8 + 1 + padding = 16.
    // On 32-bit ESP32: 4 + 4 + 1 + padding = 12.
    const std::size_t observed = sizeof(AuthHandler);
    print_size("AuthHandler", observed);
    TEST_ASSERT_LESS_THAN_size_t_MESSAGE(32, observed,
        "AuthHandler grew - did mbedtls context become persistent?");
}

static void test_locked_EspControl_after_manifest_field_removal(void) {
    const std::size_t observed = production_esp_control_size();
    // 32-bit native is the ESP32-equivalent guard; 64-bit native uses a host bound.
    print_size("EspControl (production-adjusted)", observed);
    assert_production_adjusted_size(
        "EspControl grew beyond the post-manifest-field-removal guardrail",
        observed,
        kEspControlEsp32Limit,
        kEspControlHost64SanityLimit);
}

static void test_locked_BleTransport_runtime_state(void) {
    const std::size_t observed = production_ble_transport_size();
    // 32-bit native is the ESP32-equivalent guard; 64-bit native uses a host bound.
    print_size("BleTransport (production-adjusted)", observed);
    assert_production_adjusted_size(
        "BleTransport grew beyond the runtime state guardrail",
        observed,
        kBleTransportEsp32Limit,
        kBleTransportHost64SanityLimit);
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
    RUN_TEST(test_locked_CommandRegistry);
    RUN_TEST(test_locked_ActionContext_has_stringValue_buffer);
    RUN_TEST(test_locked_ResourceValue_has_string_and_bytes_buffers);
    RUN_TEST(test_locked_ManifestStore_is_a_borrow);
    RUN_TEST(test_locked_AuthHandler);
    RUN_TEST(test_locked_EspControl_after_manifest_field_removal);
    RUN_TEST(test_locked_BleTransport_runtime_state);
    return UNITY_END();
}
