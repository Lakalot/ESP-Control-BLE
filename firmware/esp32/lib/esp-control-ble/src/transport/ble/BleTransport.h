#pragma once
#include "../../protocol/core/Protocol.h"
#include "../../protocol/auth/AuthHandler.h"
#include "../../protocol/commands/CommandRegistry.h"
#include "../frame/FrameCodec.h"
#include "DataBleTransport.h"

#ifndef UNIT_TEST
#include <NimBLEDevice.h>
#include <Preferences.h>
#endif

#ifndef UNIT_TEST
class EcbCmdCallbacks;
class EcbDataCallbacks; // ADDED
class EcbServerCallbacks;
#endif

class BleTransport {
public:
  void begin(const char* deviceName, AuthHandler* auth,
             CommandRegistry* registry, const uint8_t* manifest, uint16_t manifestLen);

  void setDataTransport(ecb::DataBleTransport* t);
  void notifyRawData(const uint8_t* data, size_t len);
  void sendDataManifest();
private:
  AuthHandler*     _auth     = nullptr;
  CommandRegistry* _registry = nullptr;
  ecb::DataBleTransport* _dataTransport = nullptr;

  const uint8_t* _manifest = nullptr;
  uint16_t _manifestLen = 0;
  bool _manifestChunked = false;

  static BleTransport* _instance;
  static void staticNotify(const uint8_t* data, uint16_t len);

  char _serviceUuid[ECB_UUID_STRING_LEN];
  void loadOrCreateUuid();

  void sendNotify(const uint8_t* data, uint16_t len);
  void sendManifestChunk(uint16_t offset, uint8_t requestedLen);
  void handleWrite(const uint8_t* data, uint16_t len);
  void handleDataWrite(const uint8_t* data, uint16_t len);
  void handleSubscribe();
  void handleConnect();
  void handleDisconnect();

#ifdef UNIT_TEST
  static uint8_t _lastNotify[3 + ECB_MANIFEST_CHUNK_SIZE];
  static uint16_t _lastNotifyLen;
  static uint8_t _lastRawData[ecb::kMaxFrameBody + 4];
  static size_t _lastRawDataLen;
#else
  NimBLECharacteristic* _cmdChar = nullptr;
  NimBLECharacteristic* _dataChar = nullptr;

  friend class EcbCmdCallbacks;
  friend class EcbDataCallbacks;
  friend class EcbServerCallbacks;
#endif
};
