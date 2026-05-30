#include <unity.h>
#include <string>
#include <vector>
#include "ui/Ui.h"
#include "ui/Res.h"
using namespace ecb::ui;
void setUp() {} void tearDown() {}

// Minimal Ui that records value-hook calls (all the pure structural hooks are
// no-op overrides so this compiles).
struct RecUi : public Ui {
  std::vector<std::string> log;
  // value hooks
  void uiWrite(uint32_t id, bool v) override     { log.push_back("wB:" + std::to_string(id) + ":" + (v?"1":"0")); }
  void uiWrite(uint32_t id, int32_t v) override  { log.push_back("wI:" + std::to_string(id) + ":" + std::to_string(v)); }
  void uiWrite(uint32_t id, uint32_t v) override { log.push_back("wU:" + std::to_string(id) + ":" + std::to_string(v)); }
  void uiWrite(uint32_t id, float v) override    { log.push_back("wF:" + std::to_string(id)); (void)v; }
  void uiWrite(uint32_t id, const char* v) override { log.push_back("wS:" + std::to_string(id) + ":" + std::string(v)); }
  bool        uiReadBool(uint32_t id) override   { (void)id; return true; }
  uint32_t    uiReadUint(uint32_t id) override   { (void)id; return 42u; }
  int32_t     uiReadInt(uint32_t id) override    { (void)id; return -7; }
  float       uiReadFloat(uint32_t id) override  { (void)id; return 1.5f; }
  const char* uiReadString(uint32_t id) override { (void)id; return "hi"; }
  // ---- pure structural hooks: no-op overrides ----
  void recordCapability(const std::string&, bool) override {}
  int  recordResource(const std::string&, ValueType) override { return 0; }
  void resourceLabel(int, const std::string&) override {}
  void resourceUnit(int, const std::string&) override {}
  void resourceReadMode(int, ReadMode) override {}
  void resourceStaleAfterMs(int, uint32_t) override {}
  void resourcePollMs(int, uint32_t) override {}
  void resourceEnum(int, const std::vector<std::string>&) override {}
  int  recordWidget(const std::string&, WidgetKind, int, bool, int, int) override { return 0; }
  int  recordContainer(const std::string&, NodeKind) override { return 0; }
  void containerChildren(int, const std::vector<int>&) override {}
  void nodeColumns(int, uint32_t) override {}
  void nodeTitle(int, const std::string&) override {}
  void nodeTone(int, const std::string&) override {}
  void nodeText(int, const std::string&) override {}
  void nodeFormatHint(int, const std::string&) override {}
  void recordWidgetAction(int, const std::string&, const std::string&, Danger, const std::string&, uint32_t) override {}
  int  recordAction(const std::string&, const std::string&) override { return 0; }
  void actionDanger(int, Danger) override {}
  void actionConfirm(int, const std::string&) override {}
  void actionCooldownMs(int, uint32_t) override {}
  void actionSchemaValueless(int) override {}
  void actionSchemaBoolean(int) override {}
  void actionSchemaInteger(int, int, int) override {}
  void actionSchemaStringLen(int, int, int) override {}
  void actionSchemaStringEnum(int, const std::vector<std::string>&) override {}
  void bindWidgetAction(int, const std::string&) override {}
  int  recordView(const std::string&, const std::string&) override { return 0; }
  void viewRouteKey(int, const std::string&) override {}
  void viewContent(int, const std::vector<int>&) override {}
  void recordNavItem(const std::string&, const std::string&, const std::string&, int) override {}
};

static void test_res_uint_set_get() {
  RecUi ui;
  Res<uint32_t> r(&ui, 6u);
  r.set(50u);
  TEST_ASSERT_EQUAL_UINT32(42u, r.get());
  TEST_ASSERT_EQUAL_UINT32((uint32_t)1u, (uint32_t)ui.log.size());
  TEST_ASSERT_EQUAL_STRING("wU:6:50", ui.log[0].c_str());
}
static void test_res_bool_toggle() {
  RecUi ui;
  Res<bool> r(&ui, 8u);
  toggle(r);                        // reads true -> writes false (free helper)
  TEST_ASSERT_EQUAL_STRING("wB:8:0", ui.log[0].c_str());
}
static void test_res_string_set() {
  RecUi ui;
  Res<const char*> r(&ui, 2u);
  r.set("warm");
  TEST_ASSERT_EQUAL_STRING("wS:2:warm", ui.log[0].c_str());
}
static void test_res_copy_is_safe_handle() {
  RecUi ui;
  Res<uint32_t> a(&ui, 3u);
  Res<uint32_t> b = a;              // copy = same lightweight handle
  b.set(9u);
  TEST_ASSERT_EQUAL_STRING("wU:3:9", ui.log[0].c_str());
  TEST_ASSERT_EQUAL_UINT32(3u, a.id());
}
static void test_default_res_is_inert() {
  Res<uint32_t> r;                  // no ui
  r.set(1u);                        // must not crash
  TEST_ASSERT_EQUAL_UINT32(0u, r.id());
}
static void test_res_int_set_get() {
  RecUi ui;
  Res<int32_t> r(&ui, 11u);
  r.set(-5);
  TEST_ASSERT_EQUAL_INT32(-7, r.get());          // mock returns -7
  TEST_ASSERT_EQUAL_STRING("wI:11:-5", ui.log[0].c_str());
}
static void test_res_float_set_get() {
  RecUi ui;
  Res<float> r(&ui, 12u);
  r.set(2.5f);
  TEST_ASSERT_EQUAL_FLOAT(1.5f, r.get());         // mock returns 1.5
  TEST_ASSERT_EQUAL_STRING("wF:12", ui.log[0].c_str());
}
int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_res_uint_set_get);
  RUN_TEST(test_res_bool_toggle);
  RUN_TEST(test_res_string_set);
  RUN_TEST(test_res_copy_is_safe_handle);
  RUN_TEST(test_default_res_is_inert);
  RUN_TEST(test_res_int_set_get);
  RUN_TEST(test_res_float_set_get);
  return UNITY_END();
}
