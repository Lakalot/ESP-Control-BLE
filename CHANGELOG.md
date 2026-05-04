# Changelog

## Unreleased

- Refactor `esp-control-ble` internals in L0-L6 while preserving the V5 wire format.
- Removed unreachable V4 command registry and frame parser paths from `esp-control-ble`.
- Changed `EspControl::registerAction` to accept a function pointer plus context pointer instead of `std::function`.
- Moved `EspControl` into `namespace ecb`; applications should use `ecb::EspControl`.
- Replaced ambiguous bool status APIs with explicit result enums; semantic lookup bools remain unchanged.
- Added `ecb::ResourceTable<MaxBlobSlots>` template to allow overriding the default 4-slot limit for string/bytes resources.