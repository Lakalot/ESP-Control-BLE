#pragma once
#include "../protocol/Protocol.h"
#include "../protocol/AuthHandler.h"
#include "../protocol/CommandRegistry.h"
#include "FrameCodec.h"
#include <NimBLEDevice.h>
#include <Preferences.h>

class EcbCmdCallbacks;
class EcbServerCallbacks;

class BleTransport {
public:
  void begin(const char* deviceName, AuthHandler* auth,
             CommandRegistry* registry, const uint8_t* manifest, uint16_t manifestLen);

  void notifyRawV5(const uint8_t* data, size_t len);
private:
  AuthHandler*     _auth     = nullptr;
  CommandRegistry* _registry = nullptr;

  NimBLECharacteristic* _cmdChar = nullptr;
  NimBLECharacteristic* _v5DataChar = nullptr; // NEW

  const uint8_t* _manifest = nullptr;
  uint16_t _manifestLen = 0;
  bool _manifestChunked = false;

  static BleTransport* _instance;
  static void staticNotify(const uint8_t* data, uint16_t len);

  char _serviceUuid[37]; // "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\0"
  void loadOrCreateUuid();

  void sendNotify(const uint8_t* data, uint16_t len);
  void sendManifestChunk(uint16_t offset, uint8_t requestedLen);
  void handleWrite(const uint8_t* data, uint16_t len);
  void handleSubscribe();
  void handleConnect();
  void handleDisconnect();

  friend class EcbCmdCallbacks;
  friend class EcbServerCallbacks;
};
