#include "BleTransport.h"

#include <string.h>

// -- Shared instance hook ----------------------------------------------------
BleTransport* BleTransport::_instance = nullptr;

#ifdef UNIT_TEST
uint8_t BleTransport::_lastRawData[ecb::kMaxFrameBody + 4] = {};
size_t BleTransport::_lastRawDataLen = 0;
#endif

void BleTransport::staticNotify(const uint8_t* data, uint16_t len) {
}

#ifdef UNIT_TEST

static bool notifyTestBuffer(uint8_t* dest, size_t cap, size_t& destLen,
                             const uint8_t* data, size_t len) {
  destLen = len > cap ? cap : len;
  if (destLen > 0) memcpy(dest, data, destLen);
  return true;
}

void BleTransport::notifyRawData(const uint8_t* data, size_t len) {
  notifyTestBuffer(_lastRawData, sizeof(_lastRawData), _lastRawDataLen, data, len);
}

void BleTransport::loadOrCreateUuid() {}

void BleTransport::begin(const char*, AuthHandler* auth,
                         const uint8_t* manifest, uint16_t manifestLen) {
  _auth = auth;
  _manifest = manifest;
  _manifestLen = manifestLen;
  _manifestChunked = manifestLen > 512;
  _lastRawDataLen = 0;
  _instance = this;
}

void BleTransport::setDataTransport(ecb::DataBleTransport* t) {
  _dataTransport = t;
}

void BleTransport::setProtocolCallbacks(void (*onDisconnect)(void*), void (*onSubscribe)(void*), void* ctx) {
  _onDisconnect = onDisconnect;
  _onSubscribe = onSubscribe;
  _protocolCtx = ctx;
}

void BleTransport::handleConnect() {
  _auth->reset();
}

void BleTransport::handleDisconnect() {
  _auth->reset();
  if (_onDisconnect) _onDisconnect(_protocolCtx);
}

void BleTransport::handleDataWrite(const uint8_t* data, uint16_t len) {
  if (!_dataTransport) {
    return;
  }
  _dataTransport->onRawFrame(data, len);
}

#else

#include <Arduino.h>
#include <pgmspace.h>

#include "../../support/EcbLogging.h"

static bool notifyDataCharacteristic(NimBLECharacteristic* characteristic, const uint8_t* data, size_t len) {
  if (!characteristic) return false;
  characteristic->setValue(data, len);
  characteristic->notify();
  return true;
}

void BleTransport::notifyRawData(const uint8_t* data, size_t len) {
  notifyDataCharacteristic(_dataChar, data, len);
}

// ── NimBLE Callbacks ───────────────────────────────────────

class EcbDataCallbacks : public NimBLECharacteristicCallbacks {
  BleTransport* _transport;
public:
  EcbDataCallbacks(BleTransport* t) : _transport(t) {}

  void onSubscribe(NimBLECharacteristic* pChar, ble_gap_conn_desc* desc, uint16_t subValue) override {
    if (subValue == 0) return;
    ECB_DATA_DEBUGF("[ECB DATA] Client subscribed to data char, sending manifest\n");
    if (_transport->_onSubscribe) _transport->_onSubscribe(_transport->_protocolCtx);
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

static EcbDataCallbacks* s_dataCallbacks = nullptr;
static EcbServerCallbacks* s_serverCallbacks = nullptr;

// ── BleTransport ───────────────────────────────────────────

static void formatUuid(char* out, uint32_t a, uint16_t b, uint16_t c, uint16_t d, uint32_t e_hi, uint16_t e_lo) {
  snprintf(out, ECB_UUID_STRING_LEN, "%08lx-%04x-%04x-%04x-%08lx%04x",
           (unsigned long)a, b, c, d, (unsigned long)e_hi, e_lo);
}

void BleTransport::loadOrCreateUuid() {
  Preferences prefs;
  prefs.begin("ecb", false);
  String stored = prefs.getString("svc_uuid", "");
  if (stored.length() == ECB_UUID_STRING_LEN - 1) {
    memcpy(_serviceUuid, stored.c_str(), ECB_UUID_STRING_LEN);
    ECB_LOGF("[ECB] UUID loaded from NVS: %s\n", _serviceUuid);
  } else {
    uint32_t a    = esp_random();
    uint16_t b    = (uint16_t)(esp_random() & 0xFFFF);
    uint16_t c    = (uint16_t)((esp_random() & 0x0FFF) | 0x4000);
    uint16_t d    = (uint16_t)((esp_random() & 0x3FFF) | 0x8000);
    uint32_t e_hi = esp_random();
    uint16_t e_lo = (uint16_t)(esp_random() & 0xFFFF);
    formatUuid(_serviceUuid, a, b, c, d, e_hi, e_lo);
    prefs.putString("svc_uuid", _serviceUuid);
    ECB_LOGF("[ECB] UUID generated and saved: %s\n", _serviceUuid);
  }
  prefs.end();
}

void BleTransport::setDataTransport(ecb::DataBleTransport* t) {
  _dataTransport = t;
}

void BleTransport::setProtocolCallbacks(void (*onDisconnect)(void*), void (*onSubscribe)(void*), void* ctx) {
  _onDisconnect = onDisconnect;
  _onSubscribe = onSubscribe;
  _protocolCtx = ctx;
}

void BleTransport::begin(const char* deviceName, AuthHandler* auth,
                          const uint8_t* manifest, uint16_t manifestLen) {
  // loadOrCreateUuid();

  _auth      = auth;
  _instance  = this;
  _manifest  = manifest;
  _manifestLen = manifestLen;
  _manifestChunked = manifestLen > 512;

  NimBLEDevice::init(deviceName);
  NimBLEDevice::setPower(ESP_PWR_LVL_P9);

  NimBLEServer* server = NimBLEDevice::createServer();
  if (!s_serverCallbacks) s_serverCallbacks = new EcbServerCallbacks(this);
  server->setCallbacks(s_serverCallbacks);

  NimBLEService* service = server->createService(ECB_SERVICE_UUID);

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

  _dataChar = service->createCharacteristic(
    ECB_DATA_DATA_CHAR_UUID,
    NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::NOTIFY
  );
  if (!s_dataCallbacks) s_dataCallbacks = new EcbDataCallbacks(this);
  _dataChar->setCallbacks(s_dataCallbacks);
  
  service->start();

  NimBLEAdvertising* advertising = NimBLEDevice::getAdvertising();
  advertising->addServiceUUID(ECB_SERVICE_UUID);
  advertising->setScanResponse(true);
  advertising->start();

  ECB_LOGF("[ECB] BLE started (%s) manifest=%s len=%u\n",
           deviceName,
           _manifestChunked ? "chunked" : "inline",
           _manifestLen);
}

void BleTransport::handleConnect() {
  ECB_LOGF("[ECB] Client connected\n");
  _auth->reset();
}

void BleTransport::handleDisconnect() {
  ECB_LOGF("[ECB] Client disconnected\n");
  _auth->reset();
  if (_onDisconnect) _onDisconnect(_protocolCtx);
  NimBLEDevice::startAdvertising();
}

void BleTransport::handleDataWrite(const uint8_t* data, uint16_t len) {
  ECB_DATA_DEBUGF("[ECB DATA] handleDataWrite len=%d\n", len);
  if (_dataTransport) {
    _dataTransport->onRawFrame(data, len);
  }
}

#endif

