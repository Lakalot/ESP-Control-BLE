#include "BleTransport.h"
#include <Arduino.h>
#include <pgmspace.h>

#include "../protocol/ProtocolV5.h"

// ── Static instance ────────────────────────────────────────
BleTransport* BleTransport::_instance = nullptr;

void BleTransport::staticNotify(const uint8_t* data, uint16_t len) {
  if (_instance) _instance->sendNotify(data, len);
}

void BleTransport::notifyRawV5(const uint8_t* data, size_t len) {
  if (_v5DataChar) {
    _v5DataChar->setValue(data, (uint16_t)len);
    _v5DataChar->notify();
  }
}


// ── NimBLE Callbacks ───────────────────────────────────────

class EcbCmdCallbacks : public NimBLECharacteristicCallbacks {
  BleTransport* _transport;
public:
  EcbCmdCallbacks(BleTransport* t) : _transport(t) {}

  void onSubscribe(NimBLECharacteristic* pChar, ble_gap_conn_desc* desc, uint16_t subValue) override {
    if (subValue == 0) return;
    _transport->handleSubscribe();
  }

  void onWrite(NimBLECharacteristic* pChar) override {
    NimBLEAttValue v = pChar->getValue();
    _transport->handleWrite(v.data(), (uint16_t)v.size());
  }
};

class EcbServerCallbacks : public NimBLEServerCallbacks {
  BleTransport* _transport;
public:
  EcbServerCallbacks(BleTransport* t) : _transport(t) {}

  void onConnect(NimBLEServer* pServer) override {
    _transport->handleConnect();
  }

  void onDisconnect(NimBLEServer* pServer) override {
    _transport->handleDisconnect();
  }
};

static EcbCmdCallbacks*    s_cmdCallbacks    = nullptr;
static EcbServerCallbacks* s_serverCallbacks = nullptr;

// ── BleTransport ───────────────────────────────────────────

static void formatUuid(char* out, uint32_t a, uint16_t b, uint16_t c, uint16_t d, uint32_t e_hi, uint16_t e_lo) {
  snprintf(out, 37, "%08lx-%04x-%04x-%04x-%08lx%04x",
           (unsigned long)a, b, c, d, (unsigned long)e_hi, e_lo);
}

void BleTransport::loadOrCreateUuid() {
  Preferences prefs;
  prefs.begin("ecb", false);
  String stored = prefs.getString("svc_uuid", "");
  if (stored.length() == 36) {
    memcpy(_serviceUuid, stored.c_str(), 37);
    Serial.printf("[ECB] UUID loaded from NVS: %s\n", _serviceUuid);
  } else {
    uint32_t a    = esp_random();
    uint16_t b    = (uint16_t)(esp_random() & 0xFFFF);
    uint16_t c    = (uint16_t)((esp_random() & 0x0FFF) | 0x4000);
    uint16_t d    = (uint16_t)((esp_random() & 0x3FFF) | 0x8000);
    uint32_t e_hi = esp_random();
    uint16_t e_lo = (uint16_t)(esp_random() & 0xFFFF);
    formatUuid(_serviceUuid, a, b, c, d, e_hi, e_lo);
    prefs.putString("svc_uuid", _serviceUuid);
    Serial.printf("[ECB] UUID generated and saved: %s\n", _serviceUuid);
  }
  prefs.end();
}

void BleTransport::begin(const char* deviceName, AuthHandler* auth,
                          CommandRegistry* registry,
                          const uint8_t* manifest, uint16_t manifestLen) {
  loadOrCreateUuid();

  _auth      = auth;
  _registry  = registry;
  _instance  = this;
  _manifest  = manifest;
  _manifestLen = manifestLen;
  _manifestChunked = manifestLen > 512;

  NimBLEDevice::init(deviceName);
  NimBLEDevice::setPower(ESP_PWR_LVL_P9);

  NimBLEServer* server = NimBLEDevice::createServer();
  if (!s_serverCallbacks) s_serverCallbacks = new EcbServerCallbacks(this);
  server->setCallbacks(s_serverCallbacks);

  NimBLEService* service = server->createService(_serviceUuid);

  NimBLECharacteristic* manifestChar = service->createCharacteristic(
    ECB_MANIFEST_CHAR_UUID,
    NIMBLE_PROPERTY::READ,
    512
  );
  if (_manifestChunked) {
    uint8_t meta[5];
    meta[0] = ECB_MANIFEST_VERSION_4;
    meta[1] = ECB_MANIFEST_FLAG_CHUNKED;
    meta[2] = (uint8_t)((_manifestLen >> 8) & 0xFF);
    meta[3] = (uint8_t)(_manifestLen & 0xFF);
    meta[4] = ECB_MANIFEST_CHUNK_SIZE;
    manifestChar->setValue(meta, sizeof(meta));
  } else if (_manifest && _manifestLen > 0) {
    uint8_t inlineManifest[512];
    memcpy_P(inlineManifest, _manifest, _manifestLen);
    manifestChar->setValue(inlineManifest, _manifestLen);
  }

  _cmdChar = service->createCharacteristic(
    ECB_CMD_CHAR_UUID,
    NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::NOTIFY
  );
  if (!s_cmdCallbacks) s_cmdCallbacks = new EcbCmdCallbacks(this);
  _cmdChar->setCallbacks(s_cmdCallbacks);

  _v5DataChar = service->createCharacteristic(
    ECB_V5_DATA_CHAR_UUID,
    NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::NOTIFY
  );
  // Optional: add callbacks for V5 if needed
  
  service->start();

  NimBLEAdvertising* advertising = NimBLEDevice::getAdvertising();
  advertising->addServiceUUID(_serviceUuid);
  advertising->setScanResponse(true);
  advertising->start();

  Serial.printf("[ECB] BLE started (%s) manifest=%s len=%u\n",
                deviceName,
                _manifestChunked ? "chunked" : "inline",
                _manifestLen);
}

void BleTransport::sendNotify(const uint8_t* data, uint16_t len) {
  if (_cmdChar) {
    _cmdChar->setValue(data, len);
    _cmdChar->notify();
  }
}

void BleTransport::sendManifestChunk(uint16_t offset, uint8_t requestedLen) {
  if (!_manifest || _manifestLen == 0) {
    uint8_t resp[3] = { ECB_SYSTEM_CMD_MANIFEST_CHUNK, ECB_STATUS_BAD_FRAME, 0x00 };
    sendNotify(resp, sizeof(resp));
    return;
  }

  if (offset >= _manifestLen) {
    uint8_t resp[3] = { ECB_SYSTEM_CMD_MANIFEST_CHUNK, ECB_STATUS_BAD_FRAME, 0x00 };
    sendNotify(resp, sizeof(resp));
    return;
  }

  uint8_t safeLen = requestedLen;
  if (safeLen == 0 || safeLen > ECB_MANIFEST_CHUNK_SIZE) safeLen = ECB_MANIFEST_CHUNK_SIZE;
  if ((uint16_t)(offset + safeLen) > _manifestLen) {
    safeLen = (uint8_t)(_manifestLen - offset);
  }

  uint8_t resp[3 + ECB_MANIFEST_CHUNK_SIZE];
  resp[0] = ECB_SYSTEM_CMD_MANIFEST_CHUNK;
  resp[1] = ECB_STATUS_OK;
  resp[2] = safeLen;
  memcpy_P(resp + 3, _manifest + offset, safeLen);
  sendNotify(resp, (uint16_t)(3 + safeLen));
}

void BleTransport::handleSubscribe() {
  Serial.printf("[ECB] handleSubscribe this=%p _auth=%p _cmdChar=%p _instance=%p\n",
                this, _auth, _cmdChar, _instance);
  if (_auth->isAuthenticated()) {
    Serial.println("[ECB] Client re-subscribed (already authenticated, skipping challenge)");
    return;
  }

  Serial.println("[ECB] Client subscribed, sending challenge");
  uint8_t nonce[ECB_NONCE_SIZE];
  _auth->generateChallenge(nonce);

  uint8_t challenge[1 + ECB_NONCE_SIZE];
  challenge[0] = ECB_AUTH_CHALLENGE;
  memcpy(challenge + 1, nonce, ECB_NONCE_SIZE);
  sendNotify(challenge, sizeof(challenge));
}

void BleTransport::handleWrite(const uint8_t* data, uint16_t len) {
  if (len == 0) return;

  // Auth response
  if (data[0] == ECB_AUTH_OK) {
    bool ok = _auth->verifyResponse(data, (uint8_t)len);
    uint8_t resp[1] = { ok ? (uint8_t)ECB_AUTH_OK : (uint8_t)ECB_AUTH_FAIL };
    sendNotify(resp, 1);
    Serial.printf("[ECB] Auth %s\n", ok ? "OK" : "FAIL");
    return;
  }

  // Not authenticated
  if (!_auth->isAuthenticated()) {
    uint8_t resp[3] = { data[0], ECB_STATUS_NOT_AUTH, 0x00 };
    sendNotify(resp, 3);
    return;
  }

  // Parse command frame
  ParsedFrame frame = ecbParseFrame(data, len);
  if (!frame.valid) {
    uint8_t resp[3] = { data[0], ECB_STATUS_BAD_FRAME, 0x00 };
    sendNotify(resp, 3);
    return;
  }

  if (frame.cmdId == ECB_SYSTEM_CMD_MANIFEST_CHUNK) {
    if (frame.length < 3) {
      uint8_t resp[3] = { frame.cmdId, ECB_STATUS_BAD_FRAME, 0x00 };
      sendNotify(resp, sizeof(resp));
      return;
    }

    uint16_t offset = (uint16_t)((frame.payload[0] << 8) | frame.payload[1]);
    uint8_t requestedLen = frame.payload[2];
    sendManifestChunk(offset, requestedLen);
    return;
  }

  // Dispatch via static notify (no lambda capture needed)
  bool found = _registry->dispatch(frame.cmdId, frame.payload, frame.length, staticNotify);
  if (!found) {
    uint8_t resp[3] = { frame.cmdId, ECB_STATUS_UNKNOWN_CMD, 0x00 };
    sendNotify(resp, 3);
  }
}

void BleTransport::handleConnect() {
  Serial.println("[ECB] Client connected");
  _auth->reset();
}

void BleTransport::handleDisconnect() {
  Serial.println("[ECB] Client disconnected");
  _auth->reset();
  NimBLEDevice::startAdvertising();
}
