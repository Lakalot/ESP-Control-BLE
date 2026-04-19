# Manifest V5 protobuf contract

## Files
- `manifest_v5.proto`: runtime wire contract for the compiled manifest.
- `nanopb/manifest_v5.options`: static bounds for future firmware code generation.

## Plan A decision
- Plan A checks in the TypeScript `protobufjs` output.
- Plan A does **not** generate firmware nanopb C sources yet.
- Firmware generation is deferred to Plan C, but the bounds file is frozen now.

## Regenerating TypeScript output

```bash
pnpm --filter @esp-control-ble/manifest-v5 run proto:gen:ts
```

Generated files:
- `tools/manifest-v5/src/generated/manifest_v5.pbjs.js`
- `tools/manifest-v5/src/generated/manifest_v5.pbjs.d.ts`
