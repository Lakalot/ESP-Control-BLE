#include "BleTransport.h"
#include "DataBleTransport.h"

#ifdef UNIT_TEST

// Not exercised in native tests; minimal no-op stubs.
void BleTransport::attach(ecb::ProtocolEngine* engine, const uint8_t* manifest, uint16_t manifestLen) {
  _engine = engine; _manifest = manifest; _manifestLen = manifestLen;
}
void BleTransport::begin(const char*) {}
void BleTransport::send(const uint8_t*, size_t) {}
void BleTransport::onData(const uint8_t* data, size_t len) { if (_engine) _engine->handleFrame((ecb::FrameKind)data[0], data + 4, len > 4 ? len - 4 : 0); }
void BleTransport::onConnect(uint16_t) {}
void BleTransport::onDisconnect() {}

#else

#include <Arduino.h>
#include "../../support/EcbLogging.h"

static BleTransport* s_self = nullptr;  // single-session: one transport instance

class EcbDataCb : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* c) override {
    std::string v = c->getValue();
    if (s_self) s_self->onData((const uint8_t*)v.data(), v.size());
  }
};

class EcbServerCb : public BLEServerCallbacks {
  void onConnect(BLEServer*, esp_ble_gatts_cb_param_t* param) override {
    if (s_self) s_self->onConnect(param->connect.conn_id);
  }
  void onDisconnect(BLEServer*) override {
    if (s_self) s_self->onDisconnect();
    BLEDevice::startAdvertising();
  }
};

void BleTransport::attach(ecb::ProtocolEngine* engine, const uint8_t* manifest, uint16_t manifestLen) {
  _engine = engine; _manifest = manifest; _manifestLen = manifestLen;
}

void BleTransport::begin(const char* deviceName) {
  s_self = this;
  BLEDevice::init(deviceName);

  BLEServer* server = BLEDevice::createServer();
  _server = server;
  server->setCallbacks(new EcbServerCb());

  BLEService* svc = server->createService(BLEUUID(ECB_DATA_SERVICE_UUID), 16, 0);

  // Manifest characteristic (read): inline manifest, used for discovery.
  BLECharacteristic* manifestChar = svc->createCharacteristic(
      BLEUUID(ECB_MANIFEST_CHAR_UUID), BLECharacteristic::PROPERTY_READ);
  if (_manifest && _manifestLen > 0 && _manifestLen <= 512) {
    manifestChar->setValue((uint8_t*)_manifest, _manifestLen);
  }

  // Data characteristic (write + notify): carries auth + protocol frames.
  _dataChar = svc->createCharacteristic(
      BLEUUID(ECB_DATA_DATA_CHAR_UUID),
      BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY);
  _dataChar->setCallbacks(new EcbDataCb());

  svc->start();

  BLEAdvertising* adv = BLEDevice::getAdvertising();
  adv->addServiceUUID(ECB_DATA_SERVICE_UUID);
  adv->setScanResponse(true);
  adv->start();

  ECB_LOGF("[ECB] BLE(Bluedroid) started: %s\n", deviceName);
}

void BleTransport::send(const uint8_t* data, size_t len) {
  if (_dataChar) {
    _dataChar->setValue((uint8_t*)data, len);
    _dataChar->notify();
  }
}

void BleTransport::onData(const uint8_t* data, size_t len) {
  if (!_engine || len < 4) return;
  if (!_engine->beginSession(ecb::ProtocolEngine::Session::Ble)) return;  // another session active
  _engine->setSender(ecb::FrameSender{this, [](void* c, const uint8_t* d, size_t n) {
    static_cast<BleTransport*>(c)->send(d, n);
  }});
  const ecb::FrameKind kind = (ecb::FrameKind)data[0];
  const uint16_t bodyLen = (uint16_t)((data[2] << 8) | data[3]);
  if ((size_t)(4 + bodyLen) > len) return;
  _engine->handleFrame(kind, data + 4, bodyLen);
}

void BleTransport::onConnect(uint16_t connId) {
  _connId = connId;
  if (_engine && _engine->beginSession(ecb::ProtocolEngine::Session::Ble)) {
    _engine->setSender(ecb::FrameSender{this, [](void* c, const uint8_t* d, size_t n) {
      static_cast<BleTransport*>(c)->send(d, n);
    }});
  } else if (_server) {
    // Another session (SPP) owns the link: refuse this central per the spec's
    // session model by dropping it at the BLE link layer immediately.
    _server->disconnect(connId);
  }
}

void BleTransport::onDisconnect() {
  if (_engine) _engine->endSession(ecb::ProtocolEngine::Session::Ble);
}

#endif
