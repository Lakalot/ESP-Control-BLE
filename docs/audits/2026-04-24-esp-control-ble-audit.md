# ESP-Control-BLE Library — Audit Report

- **Date:** 2026-04-24
- **Scope:** `firmware/esp32/lib/esp-control-ble/`
- **Target hardware:** ESP32 classic (520 KB SRAM, no PSRAM)
- **Spec:** `docs/superpowers/specs/2026-04-24-esp-control-ble-audit-design.md`

## 1. Executive Summary

_Filled in last (Task 11)._

## 2. Methodology and Measurements

### 2.1 Tools

| Tool | Purpose | Command |
|---|---|---|
| `pio run -e esp32dev -v` | Linker/map output, section sizes | `tools/audit/pio_size_snapshot.ps1 -Label <name>` |
| `pio run -e esp32dev -t size` | Segment table (`.text`, `.rodata`, `.bss`, `.data`) | idem |
| `xtensa-esp32-elf-nm --size-sort` | Top symbols by memory footprint | idem |
| `pio test -e native -f test_audit_sizeof` | Hard `sizeof` numbers via `static_assert` | `pio test -e native -f test_audit_sizeof` |
| `tools/audit/count_smells.ps1` | Pattern tally (buffers, std::function, magic numbers, logging, bool returns) | `pwsh -File tools/audit/count_smells.ps1` |
| `esp_get_free_heap_size` / `uxTaskGetStackHighWaterMark` | Runtime heap and stack via probe firmware | See §2.3 |

### 2.2 Static measurement commands

Reproducible from repo root on Windows/PowerShell. If `pwsh` (PowerShell 7) is not
on PATH, substitute `powershell` (Windows PowerShell 5.1) — both work identically
for these scripts.

```powershell
# Full snapshot
pwsh -File tools/audit/pio_size_snapshot.ps1 -Label before-refactor

# Smells tally
pwsh -File tools/audit/count_smells.ps1 > .tmp/audit/smells.txt

# Sizeof assertions
cd firmware/esp32
pio test -e native -f test_audit_sizeof -v
```

### 2.3 Runtime measurement commands

### 2.4 Known measurement error and limitations

## 3. RAM Footprint

_Filled in Task 7 (static pass 1) and Task 10 (runtime pass 2)._

### 3.1 Static `.bss` / `.data` per module

### 3.2 Heap allocated at `begin()` / construction

### 3.3 Stack high-water marks

### 3.4 Current total vs. post-refactor target

## 4. Architecture and Layering

_Filled in Task 4._

### 4.1 Real dependency graph

### 4.2 Layering violations

### 4.3 Ownership ambiguity

### 4.4 Cycles

## 5. Code Smells and Duplication

_Filled in Task 5._

### 5.1 Fixed-size string and byte buffers

### 5.2 Parallel codecs / registries

### 5.3 Scattered magic numbers

### 5.4 Error-handling inconsistency

### 5.5 Logging bypasses

## 6. Tests and Tooling

_Filled in Task 6._

### 6.1 Current native test coverage

### 6.2 Blind spots

### 6.3 Wire-format regression tests

## 7. ROI Matrix

_Filled in Task 11._

## 8. Annexes

### 8.1 Raw static measurement logs

### 8.2 Raw runtime logs

### 8.3 Reproducible command lines

### 8.4 Calculation assumptions
