#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BluetoothSerial.h>

BluetoothSerial SerialBT;

void setup() {
  Serial.begin(115200);
  delay(200);

  // BLE side
  BLEDevice::init("ESP32-Spike");
  BLEServer* server = BLEDevice::createServer();
  BLEService* svc = server->createService("feccc3c2-7a95-4c26-91e6-f86158095207");
  svc->start();
  BLEAdvertising* adv = BLEDevice::getAdvertising();
  adv->addServiceUUID("feccc3c2-7a95-4c26-91e6-f86158095207");
  adv->start();

  // Classic SPP side
  SerialBT.begin("ESP32-Spike");

  Serial.printf("[spike] BLE + SPP started. Free heap: %u bytes\n", ESP.getFreeHeap());
  Serial.printf("[spike] Min free heap: %u bytes\n", ESP.getMinFreeHeap());
}

void loop() {
  static uint32_t last = 0;
  if (millis() - last > 2000) {
    last = millis();
    Serial.printf("[spike] free heap: %u\n", ESP.getFreeHeap());
  }
  delay(50);
}
