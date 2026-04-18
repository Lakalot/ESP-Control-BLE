#include "EspControlBle.h"

#include "protocol/AuthHandler.h"
#include "transport/BleTransport.h"
#include <Arduino.h>

static CommandRegistry* _globalRegistry = nullptr;

static void staticRegister(uint8_t cmdId, EcbCommandFn cb) {
  if (_globalRegistry) _globalRegistry->registerCommand(cmdId, cb);
}

EspControl::EspControl(const char* deviceName, const char* pin)
  : _deviceName(deviceName), _pin(pin) {
  _auth = new AuthHandler();
  _registry = new CommandRegistry();
  _transport = new BleTransport();
  _globalRegistry = _registry;
  _manifest = new ManifestBuilder(staticRegister);
}

UiNodeBuilder EspControl::ui() {
  return _manifest->ui();
}

void EspControl::registerCallback(uint8_t cmdId, EcbCommandFn callback) {
  _registry->registerCommand(cmdId, callback);
}

void EspControl::begin() {
  _auth->setPin(_pin);

  uint16_t manifestCapacity = _manifest->measure();
  uint8_t* manifestBuf = manifestCapacity > 0 ? new uint8_t[manifestCapacity] : nullptr;
  uint16_t manifestLen = manifestBuf ? _manifest->build(manifestBuf, manifestCapacity) : 0;
  uint8_t manifestVersion = manifestLen > 0 ? manifestBuf[0] : 0;

  if (manifestLen == 0 || !manifestBuf) {
    Serial.println("[ECB] Manifest build failed");
    delete[] manifestBuf;
    return;
  }

  Serial.printf("[ECB] Manifest v%u: %u bytes, %u commands, %u nodes\n",
                manifestVersion, manifestLen, _manifest->count(), _manifest->nodeCount());

  _transport->begin(_deviceName, _auth, _registry, manifestBuf, manifestLen);
  delete[] manifestBuf;
}
