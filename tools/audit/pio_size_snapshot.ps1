# tools/audit/pio_size_snapshot.ps1
# Captures pio size + nm output into timestamped files under .tmp/audit/
param(
    [string]$Label = "snapshot"
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outDir = ".tmp/audit/$timestamp-$Label"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Push-Location firmware/esp32
try {
    Write-Host "Running pio run -e esp32dev -v ..." -ForegroundColor Cyan
    pio run -e esp32dev -v *> "$PSScriptRoot/../../$outDir/build-verbose.txt"

    Write-Host "Running pio run -t size ..." -ForegroundColor Cyan
    pio run -e esp32dev -t size *> "$PSScriptRoot/../../$outDir/size-segments.txt"

    $elf = ".pio/build/esp32dev/firmware.elf"
    if (Test-Path $elf) {
        Write-Host "Running nm --size-sort ..." -ForegroundColor Cyan
        xtensa-esp32-elf-nm --size-sort --print-size --radix=d $elf |
            Sort-Object -Descending |
            Select-Object -First 100 |
            Out-File "$PSScriptRoot/../../$outDir/nm-top100.txt"
    } else {
        Write-Warning "ELF not found at $elf — nm step skipped"
    }
}
finally {
    Pop-Location
}

Write-Host "Snapshot saved to $outDir" -ForegroundColor Green
