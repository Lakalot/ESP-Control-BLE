#include "BleServer.h"
#include "AuthHandler.h"
#include "ManifestBuilder.h"
#include "../protocol/FrameParser.h"
#include "../protocol/CommandHandler.h"
#include "../commands/LedCommand.h"
#include <NimBLEDevice.h>
#include <Arduino.h>

#define SERVICE_UUID       "12345678-1234-1234-1234-123456789abc"
#define MANIFEST_CHAR_UUID "12345678-1234-1234-1234-123456789abd"
#define CMD_CHAR_UUID      "12345678-1234-1234-1234-123456789abe"

static NimBLECharacteristic* cmdChar = nullptr;
static std::vector<uint8_t> manifestData;

static void notifyResponse(const uint8_t* data, uint16_t len) {
  if (cmdChar) {
    cmdChar->setValue(data, len);
    cmdChar->notify();
  }
}

class CmdCharCallbacks : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic* pChar) override {
    std::string value = pChar->getValue();
    const uint8_t* data = (const uint8_t*)value.data();
    uint16_t len = (uint16_t)value.length();
    if (len == 0) return;

    if (data[0] == AUTH_OK) {
      bool ok = authHandler.verifyResponse(data, (uint8_t)len);
      uint8_t resp[1] = { ok ? (uint8_t)AUTH_OK : (uint8_t)AUTH_FAIL };
      cmdChar->setValue(resp, 1);
      cmdChar->notify();
      return;
    }

    if (!authHandler.isAuthenticated()) {
      uint8_t resp[3] = { data[0], 0x01, 0x00 };
      cmdChar->setValue(resp, 3);
      cmdChar->notify();
      return;
    }

    ParsedFrame frame = parseFrame(data, len);
    if (!frame.valid) {
      uint8_t resp[3] = { data[0], 0x03, 0x00 };
      cmdChar->setValue(resp, 3);
      cmdChar->notify();
      return;
    }

    commandHandler.dispatch(frame.cmdId, frame.payload, frame.length, notifyResponse);
  }
};

class ServerCallbacks : public NimBLEServerCallbacks {
  void onConnect(NimBLEServer* pServer) override {
    Serial.println("[BLE] Client connecté");
    authHandler.reset();

    uint8_t nonce[4];
    authHandler.generateChallenge(nonce);

    uint8_t challenge[5];
    challenge[0] = AUTH_CHALLENGE;
    memcpy(challenge + 1, nonce, 4);
    cmdChar->setValue(challenge, 5);
    cmdChar->notify();
  }

  void onDisconnect(NimBLEServer* pServer) override {
    Serial.println("[BLE] Client déconnecté");
    authHandler.reset();
    NimBLEDevice::startAdvertising();
  }
};

void BleServerSetup() {
  registerLedCommands();

  manifestBuilder.addCommand(CMD_LED_TOGGLE, CMD_TYPE_ACTION, "LED Toggle");
  manifestBuilder.addCommand(CMD_LED_BRIGHT, CMD_TYPE_RANGE, "LED Brightness", 0, 100);
  manifestData = manifestBuilder.build();

  Serial.printf("[BLE] Manifest: %d bytes\n", (int)manifestData.size());

  NimBLEDevice::init("ESP32-Control");
  NimBLEDevice::setPower(ESP_PWR_LVL_P9);

  NimBLEServer* server = NimBLEDevice::createServer();
  server->setCallbacks(new ServerCallbacks());

  NimBLEService* service = server->createService(SERVICE_UUID);

  NimBLECharacteristic* manifestChar = service->createCharacteristic(
    MANIFEST_CHAR_UUID,
    NIMBLE_PROPERTY::READ
  );
  manifestChar->setValue(manifestData.data(), manifestData.size());

  cmdChar = service->createCharacteristic(
    CMD_CHAR_UUID,
    NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::NOTIFY
  );
  cmdChar->setCallbacks(new CmdCharCallbacks());

  service->start();

  NimBLEAdvertising* advertising = NimBLEDevice::getAdvertising();
  advertising->addServiceUUID(SERVICE_UUID);
  advertising->setScanResponse(true);
  advertising->start();

  Serial.println("[BLE] Advertising démarré (ESP32-Control)");
}
