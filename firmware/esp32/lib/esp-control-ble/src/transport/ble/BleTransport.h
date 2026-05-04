#pragma once
#include "../../protocol/core/Protocol.h"
#include "../../protocol/auth/AuthHandler.h"
#include "DataBleTransport.h"

#ifndef UNIT_TEST
#include <NimBLEDevice.h>
#include <Preferences.h>
#endif

#ifndef UNIT_TEST
class EcbDataCallbacks; // ADDED
class EcbServerCallbacks;
#endif

class BleTransport {
public:
  void begin(const char* deviceName, AuthHandler* auth,
             const uint8_t* manifest, uint16_t manifestLen);

  void setDataTransport(ecb::DataBleTransport* t);
  void notifyRawData(const uint8_t* data, size_t len);
  void sendDataManifest();
private:
  AuthHandler*     _auth     = nullptr;
  ecb::DataBleTransport* _dataTransport = nullptr;

  const uint8_t* _manifest = nullptr;
  uint16_t _manifestLen = 0;
  bool _manifestChunked = false;

  static BleTransport* _instance;
  static void staticNotify(const uint8_t* data, uint16_t len);

  char _serviceUuid[ECB_UUID_STRING_LEN];
  void loadOrCreateUuid();

  void handleDataWrite(const uint8_t* data, uint16_t len);
  void handleConnect();
  void handleDisconnect();

#ifdef UNIT_TEST
  static uint8_t _lastRawData[ecb::kMaxFrameBody + 4];
  static size_t _lastRawDataLen;
#else
  NimBLECharacteristic* _dataChar = nullptr;

  friend class EcbDataCallbacks;
  friend class EcbServerCallbacks;
#endif
};
