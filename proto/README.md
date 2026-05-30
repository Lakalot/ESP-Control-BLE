# Manifest protobuf contract

The single source of truth for the manifest wire format. Both the firmware (C,
via nanopb) and the mobile app (TypeScript, via protobufjs) are generated from
these files, so the two ends always agree on the bytes.

## Files
- `manifest.proto` — the wire contract for the compiled manifest (resources,
  actions, screens, nodes, the app shell, and the embedded value/snapshot/delta
  messages).
- `nanopb/manifest.options` — static field bounds (max string/array sizes) so the
  generated C structs are fixed-size and heap-free on the ESP32.

## Generated code

**Firmware (C / nanopb):** `firmware/esp32/tools/gen_nanopb.py` runs as a
PlatformIO pre-build step and regenerates
`firmware/esp32/lib/esp-control-ble/src/nanopb/manifest.pb.{h,c}` from
`manifest.proto` + the options file. The output is checked in so the native test
suite builds without the generator present. No manual step is needed for a normal
firmware build.

**Mobile (TypeScript / protobufjs):** regenerate the checked-in bindings with:

```bash
pnpm --filter @esp-control-ble/manifest run proto:gen:ts
```

Output lands under `apps/mobile/src/manifest/generated/` (the runtime decoder) and
`tools/manifest/src/generated/` (the toolchain/oracle).

> Keep `manifest.proto` and `manifest.options` in lockstep: after editing the
> schema, regenerate **both** the firmware nanopb sources (happens automatically on
> the next `pio run`) and the TypeScript bindings (the command above), or the two
> ends will disagree on the wire format.
