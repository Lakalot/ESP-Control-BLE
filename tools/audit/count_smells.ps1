# tools/audit/count_smells.ps1
# Tallies code-smell patterns in lib/esp-control-ble/
$ErrorActionPreference = "Stop"
$libRoot = "firmware/esp32/lib/esp-control-ble/src"

Write-Host "=== Fixed-size char/uint8_t buffers ===" -ForegroundColor Cyan
Get-ChildItem -Recurse $libRoot -Include *.cpp,*.h |
    Select-String -Pattern '\b(char|uint8_t|int8_t)\s+\w+\[\d+\]' |
    ForEach-Object { "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" }

Write-Host "`n=== std::function usage ===" -ForegroundColor Cyan
Get-ChildItem -Recurse $libRoot -Include *.cpp,*.h |
    Select-String -Pattern 'std::function' |
    ForEach-Object { "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" }

Write-Host "`n=== Magic numbers (integer literals >= 32 in code, excluding 0xHEX and common 0-31) ===" -ForegroundColor Cyan
Get-ChildItem -Recurse $libRoot -Include *.cpp,*.h |
    Select-String -Pattern '\b(?<![x0-9])[3-9]\d+\b' |
    Where-Object { $_.Line -notmatch '^\s*(//|\*)' } |
    ForEach-Object { "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" } |
    Select-Object -First 50

Write-Host "`n=== Direct Serial.print usage (bypasses EcbLogging) ===" -ForegroundColor Cyan
Get-ChildItem -Recurse $libRoot -Include *.cpp,*.h |
    Select-String -Pattern 'Serial\.(print|println|printf)' |
    ForEach-Object { "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" }

Write-Host "`n=== bool returns for status-like operations ===" -ForegroundColor Cyan
Get-ChildItem -Recurse $libRoot -Include *.h |
    Select-String -Pattern '^\s*bool\s+\w+\(' |
    ForEach-Object { "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" } |
    Select-Object -First 30
