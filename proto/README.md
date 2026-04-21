# Manifest protobuf contract

## Files
- `manifest.proto`: runtime wire contract for the compiled manifest.
- `nanopb/manifest.options`: static bounds for future firmware code generation.

## Plan A decision
- Plan A checks in the TypeScript `protobufjs` output.
- Plan A does **not** generate firmware nanopb C sources yet.
- Firmware generation is deferred to Plan C, but the bounds file is frozen now.

## Regenerating TypeScript output

```bash
pnpm --filter @esp-control-ble/manifest run proto:gen:ts
```

Generated files:
- generated protobuf bindings under `tools/manifest/src/generated/`
