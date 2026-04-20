#pragma once
#include "../protocol/Protocol.h"
#include "../protocol/AuthHandler.h"
#include "../protocol/CommandRegistry.h"
#include "FrameCodec.h"
#include "BleTransportV5.h" // ADDED
#include <NimBLEDevice.h>
#include <Preferences.h>

class EcbCmdCallbacks;
class EcbV5DataCallbacks; // ADDED
class EcbServerCallbacks;

class BleTransport {
public:
  void begin(const char* deviceName, AuthHandler* auth,
             CommandRegistry* registry, const uint8_t* manifest, uint16_t manifestLen);

  void setV5Transport(ecb::v5::BleTransportV5* t);
  void notifyRawV5(const uint8_t* data, size_t len);
  void sendV5Manifest();
private:
  AuthHandler*     _auth     = nullptr;
  CommandRegistry* _registry = nullptr;
  ecb::v5::BleTransportV5* _v5Transport = nullptr; // ADDED

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
  void handleV5Write(const uint8_t* data, uint16_t len); // ADDED
  void handleSubscribe();
  void handleConnect();
  void handleDisconnect();

  friend class EcbCmdCallbacks;
  friend class EcbV5DataCallbacks; // ADDED
  friend class EcbServerCallbacks;
};
