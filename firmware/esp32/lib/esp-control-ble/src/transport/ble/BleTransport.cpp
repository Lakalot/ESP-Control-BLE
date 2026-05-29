#include "BleTransport.h"

#include <string.h>

// -- Shared instance hook ----------------------------------------------------
BleTransport* BleTransport::_instance = nullptr;

void BleTransport::staticNotify(const uint8_t* data, uint16_t len) {
  if (_instance) {
    _instance->sendNotify(data, len);
  }
}

#ifdef UNIT_TEST

void BleTransport::notifyRawData(const uint8_t* data, size_t len) {
  _lastRawDataLen = len > sizeof(_lastRawData) ? sizeof(_lastRawData) : len;
  if (_lastRawDataLen > 0) {
    memcpy(_lastRawData, data, _lastRawDataLen);
  }
}

void BleTransport::begin(const char*, AuthHandler* auth,
                         CommandRegistry* registry,
                         const uint8_t* manifest, uint16_t manifestLen) {
  _auth = auth;
  _registry = registry;
  _manifest = manifest;
  _manifestLen = manifestLen;
  _manifestChunked = manifestLen > 512;
  _lastNotifyLen = 0;
  _lastRawDataLen = 0;
  _instance = this;
}

void BleTransport::setDataTransport(ecb::DataBleTransport* t) {
  _dataTransport = t;
}

void BleTransport::sendDataManifest() {
  if (_dataTransport) {
    _dataTransport->sendManifest();
  }
}

void BleTransport::sendNotify(const uint8_t* data, uint16_t len) {
  _lastNotifyLen = len > sizeof(_lastNotify) ? sizeof(_lastNotify) : len;
  if (_lastNotifyLen > 0) {
    memcpy(_lastNotify, data, _lastNotifyLen);
  }
}

void BleTransport::sendManifestChunk(uint16_t offset, uint8_t requestedLen) {
  if (!_manifest || _manifestLen == 0 || offset >= _manifestLen) {
    const uint8_t resp[3] = {ECB_SYSTEM_CMD_MANIFEST_CHUNK, ECB_STATUS_BAD_FRAME, 0x00};
    sendNotify(resp, sizeof(resp));
    return;
  }

  uint8_t safeLen = requestedLen;
  if (safeLen == 0 || safeLen > ECB_MANIFEST_CHUNK_SIZE) safeLen = ECB_MANIFEST_CHUNK_SIZE;
  if (static_cast<uint16_t>(offset + safeLen) > _manifestLen) {
    safeLen = static_cast<uint8_t>(_manifestLen - offset);
  }

  uint8_t resp[3 + ECB_MANIFEST_CHUNK_SIZE] = {};
  resp[0] = ECB_SYSTEM_CMD_MANIFEST_CHUNK;
  resp[1] = ECB_STATUS_OK;
  resp[2] = safeLen;
  memcpy(resp + 3, _manifest + offset, safeLen);
  sendNotify(resp, static_cast<uint16_t>(3 + safeLen));
}

void BleTransport::handleSubscribe() {
  if (_auth->isAuthenticated()) {
    return;
  }

  uint8_t nonce[ECB_NONCE_SIZE] = {};
  _auth->generateChallenge(nonce);
  uint8_t challenge[1 + ECB_NONCE_SIZE] = {ECB_AUTH_CHALLENGE};
  memcpy(challenge + 1, nonce, ECB_NONCE_SIZE);
  sendNotify(challenge, sizeof(challenge));
}

void BleTransport::handleWrite(const uint8_t* data, uint16_t len) {
  if (len == 0) return;

  if (data[0] == ECB_AUTH_OK) {
    const bool ok = _auth->verifyResponse(data, static_cast<uint8_t>(len));
    const uint8_t resp[1] = {ok ? static_cast<uint8_t>(ECB_AUTH_OK) : static_cast<uint8_t>(ECB_AUTH_FAIL)};
    sendNotify(resp, 1);
    return;
  }

  if (!_auth->isAuthenticated()) {
    const uint8_t resp[3] = {data[0], ECB_STATUS_NOT_AUTH, 0x00};
    sendNotify(resp, sizeof(resp));
    return;
  }

  const ParsedFrame frame = ecbParseFrame(data, len);
  if (!frame.valid) {
    const uint8_t resp[3] = {data[0], ECB_STATUS_BAD_FRAME, 0x00};
    sendNotify(resp, sizeof(resp));
    return;
  }

  if (frame.cmdId == ECB_SYSTEM_CMD_MANIFEST_CHUNK) {
    if (frame.length < 3) {
      const uint8_t resp[3] = {frame.cmdId, ECB_STATUS_BAD_FRAME, 0x00};
      sendNotify(resp, sizeof(resp));
      return;
    }

    const uint16_t offset = static_cast<uint16_t>((frame.payload[0] << 8) | frame.payload[1]);
    sendManifestChunk(offset, frame.payload[2]);
    return;
  }

  if (!_registry->dispatch(frame.cmdId, frame.payload, frame.length, staticNotify)) {
    const uint8_t resp[3] = {frame.cmdId, ECB_STATUS_UNKNOWN_CMD, 0x00};
    sendNotify(resp, sizeof(resp));
  }
}

void BleTransport::handleConnect() {
  _auth->reset();
}

void BleTransport::handleDisconnect() {
  _auth->reset();
  if (_dataTransport) {
    _dataTransport->reset();
  }
}

void BleTransport::handleDataWrite(const uint8_t* data, uint16_t len) {
  if (!_dataTransport) {
    return;
  }

  ecb::FrameHeader header;
  if (len < ecb::DataFrameCodec::kHeaderSize) {
    return;
  }
  if (!ecb::DataFrameCodec::decodeHeader(data, len, header)) {
    return;
  }
  if (len != static_cast<uint16_t>(ecb::DataFrameCodec::kHeaderSize + header.length)) {
    return;
  }

  _dataTransport->handleFrame(header.kind, data + ecb::DataFrameCodec::kHeaderSize, header.length);
}

#else

#include <Arduino.h>
#include <pgmspace.h>

#include "../../support/EcbLogging.h"

void BleTransport::notifyRawData(const uint8_t* data, size_t len) {
  if (_dataChar) {
    _dataChar->setValue(data, (uint16_t)len);
    _dataChar->notify();
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

class EcbDataCallbacks : public NimBLECharacteristicCallbacks {
  BleTransport* _transport;
public:
  EcbDataCallbacks(BleTransport* t) : _transport(t) {}

  void onSubscribe(NimBLECharacteristic* pChar, ble_gap_conn_desc* desc, uint16_t subValue) override {
    if (subValue == 0) return;
    ECB_DATA_DEBUGF("[ECB DATA] Client subscribed to data char, sending manifest\n");
    _transport->sendDataManifest();
  }

  void onWrite(NimBLECharacteristic* pChar) override {
    NimBLEAttValue v = pChar->getValue();
    _transport->handleDataWrite(v.data(), (uint16_t)v.size());
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
static EcbDataCallbacks* s_dataCallbacks = nullptr;
static EcbServerCallbacks* s_serverCallbacks = nullptr;

// ── BleTransport ───────────────────────────────────────────

void BleTransport::setDataTransport(ecb::DataBleTransport* t) {
  _dataTransport = t;
}

void BleTransport::sendDataManifest() {
  if (_dataTransport) {
    ECB_DATA_DEBUGF("[ECB DATA] Triggering manifest send via data transport\n");
    _dataTransport->sendManifest();
  }
}

void BleTransport::begin(const char* deviceName, AuthHandler* auth,
                          CommandRegistry* registry,
                          const uint8_t* manifest, uint16_t manifestLen) {
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

  NimBLEService* service = server->createService(ECB_DATA_SERVICE_UUID);

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
    ECB_DATA_CMD_CHAR_UUID,
    NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::NOTIFY
  );
  if (!s_cmdCallbacks) s_cmdCallbacks = new EcbCmdCallbacks(this);
  _cmdChar->setCallbacks(s_cmdCallbacks);

  _dataChar = service->createCharacteristic(
    ECB_DATA_DATA_CHAR_UUID,
    NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::NOTIFY
  );
  if (!s_dataCallbacks) s_dataCallbacks = new EcbDataCallbacks(this);
  _dataChar->setCallbacks(s_dataCallbacks);
  
  service->start();

  NimBLEAdvertising* advertising = NimBLEDevice::getAdvertising();
  advertising->addServiceUUID(ECB_DATA_SERVICE_UUID);
  advertising->setScanResponse(true);
  advertising->start();

  ECB_LOGF("[ECB] BLE started (%s) manifest=%s len=%u\n",
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
  ECB_LOGF("[ECB] handleSubscribe this=%p _auth=%p _cmdChar=%p _instance=%p\n",
           this, _auth, _cmdChar, _instance);
  if (_auth->isAuthenticated()) {
    ECB_LOGF("[ECB] Client re-subscribed (already authenticated, skipping challenge)\n");
    return;
  }

  ECB_LOGF("[ECB] Client subscribed, sending challenge\n");
  uint8_t nonce[ECB_NONCE_SIZE];
  _auth->generateChallenge(nonce);

  uint8_t challenge[1 + ECB_NONCE_SIZE];
  challenge[0] = ECB_AUTH_CHALLENGE;
  memcpy(challenge + 1, nonce, ECB_NONCE_SIZE);
  sendNotify(challenge, sizeof(challenge));
}

void BleTransport::handleWrite(const uint8_t* data, uint16_t len) {
  if (len == 0) return;  // zero-length GATT writes are legal; guard before reading data[0]
  ECB_LOGF("[ECB] handleWrite len=%d cmd=%02x\n", len, data[0]);

  // Auth response
  if (data[0] == ECB_AUTH_OK) {
    bool ok = _auth->verifyResponse(data, (uint8_t)len);
    uint8_t resp[1] = { ok ? (uint8_t)ECB_AUTH_OK : (uint8_t)ECB_AUTH_FAIL };
    sendNotify(resp, 1);
    ECB_LOGF("[ECB] Auth %s\n", ok ? "OK" : "FAIL");
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
  ECB_LOGF("[ECB] Client connected\n");
  _auth->reset();
}

void BleTransport::handleDisconnect() {
  ECB_LOGF("[ECB] Client disconnected\n");
  _auth->reset();
  if (_dataTransport) _dataTransport->reset();
  NimBLEDevice::startAdvertising();
}

void BleTransport::handleDataWrite(const uint8_t* data, uint16_t len) {
  ECB_DATA_DEBUGF("[ECB DATA] handleDataWrite len=%d\n", len);
  if (_dataTransport) {
    ecb::FrameHeader header;
    if (len < ecb::DataFrameCodec::kHeaderSize) {
      ECB_DATA_DEBUGF("[ECB] Data frame too short\n");
      return;
    }
    if (!ecb::DataFrameCodec::decodeHeader(data, len, header)) {
      ECB_DATA_DEBUGF("[ECB] Data header decode failed\n");
      return;
    }
    if (len != static_cast<uint16_t>(ecb::DataFrameCodec::kHeaderSize + header.length)) {
      ECB_DATA_DEBUGF("[ECB] Data payload length mismatch\n");
      return;
    }
    _dataTransport->handleFrame(header.kind, data + ecb::DataFrameCodec::kHeaderSize, header.length);
  }
}

#endif
