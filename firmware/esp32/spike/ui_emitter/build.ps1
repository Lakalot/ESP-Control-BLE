# Build the C++ manifest-emitter spike with the host mingw g++ (same toolchain the
# native tests use) + the vendored nanopb. NO Node is involved in this path.
# Produces ui_emitter_spike.exe and runs it -> cpp.pb.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$tc = "$env:USERPROFILE\.platformio\packages\toolchain-gccmingw32\bin"
$np = "..\..\.pio\libdeps\native\Nanopb"

& "$tc\g++.exe" -std=gnu++14 -O2 -static -static-libgcc -static-libstdc++ -DPB_FIELD_32BIT `
  -I "..\..\lib\esp-control-ble\src" -I $np `
  main.cpp `
  "$np\pb_encode.c" "$np\pb_common.c" `
  -o ui_emitter_spike.exe
if ($LASTEXITCODE -ne 0) { throw "g++ failed with exit code $LASTEXITCODE" }

& ".\ui_emitter_spike.exe"   # writes cpp.pb
if ($LASTEXITCODE -ne 0) { throw "ui_emitter_spike.exe failed with exit code $LASTEXITCODE" }
