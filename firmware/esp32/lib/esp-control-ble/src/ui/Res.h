#pragma once
#include <cstdint>
#include "ui/Ui.h"

namespace ecb { namespace ui {

// Lightweight, copyable handle to a resource: {Ui*, id}. Carries the id (resolved
// at RuntimeUi::commit), NOT the value -- the value lives in the library's
// ResourceTable. Capturing a Res<T> by value in a lambda is therefore safe (it
// points at the long-lived Ui/runtime). set()/get() route through Ui's value
// hooks: RuntimeUi writes the table + publishes; EmitterUi is a no-op.
template <typename T>
class Res {
public:
  Res() : ui_(0), id_(0) {}
  Res(Ui* ui, uint32_t id) : ui_(ui), id_(id) {}
  uint32_t id() const { return ui_ ? ui_->uiResolveId(id_) : id_; }

  void set(T v) const { if (ui_) writeImpl(v); }
  T    get() const { return ui_ ? readImpl() : T(); }

private:
  void writeImpl(T v) const;   // specialized per T below
  T    readImpl() const;       // specialized per T below
  Ui* ui_;
  uint32_t id_;
};

// ---- per-type write/read dispatch (explicit specializations; GCC-5 safe) ----
template <> inline void Res<bool>::writeImpl(bool v) const         { ui_->uiWrite(id_, v); }
template <> inline bool Res<bool>::readImpl() const                { return ui_->uiReadBool(id_); }

template <> inline void Res<int32_t>::writeImpl(int32_t v) const   { ui_->uiWrite(id_, v); }
template <> inline int32_t Res<int32_t>::readImpl() const          { return ui_->uiReadInt(id_); }

template <> inline void Res<uint32_t>::writeImpl(uint32_t v) const { ui_->uiWrite(id_, v); }
template <> inline uint32_t Res<uint32_t>::readImpl() const        { return ui_->uiReadUint(id_); }

template <> inline void Res<float>::writeImpl(float v) const       { ui_->uiWrite(id_, v); }
template <> inline float Res<float>::readImpl() const              { return ui_->uiReadFloat(id_); }

template <> inline void Res<const char*>::writeImpl(const char* v) const { ui_->uiWrite(id_, v); }
template <> inline const char* Res<const char*>::readImpl() const        { return ui_->uiReadString(id_); }

// Bool convenience: toggle() reads then writes the inverse. Free helper (avoids a
// class specialization just for one method on GCC 5).
inline void toggle(const Res<bool>& r) { r.set(!r.get()); }

}} // namespace ecb::ui
