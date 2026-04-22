// Build bridge for generated manifest symbol definitions.
// PlatformIO compiles `app/` as the source tree (`src_dir = app`), while the
// generated symbol implementation lives in `../src/manifest_symbols.cpp`.
// Including it here ensures the generated constants are linked into firmware.

#include "../src/manifest_symbols.cpp"
