#include "DataBleTransport.h"
#include "../frame/DataFrameCodec.h"

namespace ecb {

DataBleTransport::DataBleTransport(FrameSender sender, void* senderContext,
                                   FrameCallback callback, void* callbackContext)
  : _sender(sender), _senderContext(senderContext),
    _callback(callback), _callbackContext(callbackContext) {}

void DataBleTransport::onRawFrame(const uint8_t* data, size_t len) {
  if (!_callback) return;
  FrameHeader header;
  if (len < DataFrameCodec::kHeaderSize) return;
  if (!DataFrameCodec::decodeHeader(data, len, header)) return;
  if (len != static_cast<uint16_t>(DataFrameCodec::kHeaderSize + header.length)) return;
  _callback(header.kind, data + DataFrameCodec::kHeaderSize, header.length, _callbackContext);
}

} // namespace