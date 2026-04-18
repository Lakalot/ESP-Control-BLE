#include <Arduino.h>
#include "ble/BleServer.h"

void setup() {
  Serial.begin(115200);
  Serial.println("[ESP32] Démarrage...");
  BleServerSetup();
  Serial.println("[ESP32] BLE prêt");
}

void loop() {
  delay(10);
}
