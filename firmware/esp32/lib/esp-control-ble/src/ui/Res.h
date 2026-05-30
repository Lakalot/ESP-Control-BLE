#pragma once
#include <cstdint>
#include "ui/Ui.h"

namespace ecb { namespace ui {

// Lightweight, copyable handle to a resource: {Ui*, id}. Carries the id (resolved
// at RuntimeUi::commit), NOT the value -- the value lives in the library's
// ResourceTable. Capturing a Res<T> by value in a lambda is therefore safe (it
// points at the long-lived Ui/runtime). id(), set(), and get() all resolve the
// handle through Ui::uiResolveId at call time (a no-op until RuntimeUi assigns
// real ids at commit). set()/get() route through Ui's value hooks: RuntimeUi
// writes the table + publishes; EmitterUi is a no-op.
template <typename T>
class Res {
public:
  Res() : ui_(0), id_(0) {}
  Res(Ui* ui, uint32_t id) : ui_(ui), id_(id) {}
  uint32_t id() const { return ui_ ? ui_->uiResolveId(id_) : id_; }

  void set(T v) const { if (ui_) writeImpl(v); }
  T    get() const { return ui_ ? readImpl() : T(); }

private:
  uint32_t resolvedId() const { return ui_->uiResolveId(id_); }
  void writeImpl(T v) const;   // specialized per T below
  T    readImpl() const;       // specialized per T below
  Ui* ui_;
  uint32_t id_;
};

// ---- primary template definitions (fires a clear compile-time error for any
//      unsupported T; specializations below override these). ------------------
// value-dependent false so the assert only fires when an unsupported T is
// actually instantiated, not merely because the primary template is parsed.
template <typename T> struct ResAlwaysFalse { static const bool value = false; };

template <typename T>
inline void Res<T>::writeImpl(T) const {
  static_assert(ResAlwaysFalse<T>::value,
    "Res<T>: unsupported type. Supported: bool, int32_t, uint32_t, float, const char*. "
    "For a uint8_t slider value, store it in a Res<uint32_t>.");
}
template <typename T>
inline T Res<T>::readImpl() const {
  static_assert(ResAlwaysFalse<T>::value, "Res<T>: unsupported type (see writeImpl).");
  return T();
}

// ---- per-type write/read dispatch (explicit specializations; GCC-5 safe) ----
template <> inline void Res<bool>::writeImpl(bool v) const         { ui_->uiWrite(resolvedId(), v); }
template <> inline bool Res<bool>::readImpl() const                { return ui_->uiReadBool(resolvedId()); }

template <> inline void Res<int32_t>::writeImpl(int32_t v) const   { ui_->uiWrite(resolvedId(), v); }
template <> inline int32_t Res<int32_t>::readImpl() const          { return ui_->uiReadInt(resolvedId()); }

template <> inline void Res<uint32_t>::writeImpl(uint32_t v) const { ui_->uiWrite(resolvedId(), v); }
template <> inline uint32_t Res<uint32_t>::readImpl() const        { return ui_->uiReadUint(resolvedId()); }

template <> inline void Res<float>::writeImpl(float v) const       { ui_->uiWrite(resolvedId(), v); }
template <> inline float Res<float>::readImpl() const              { return ui_->uiReadFloat(resolvedId()); }

template <> inline void Res<const char*>::writeImpl(const char* v) const { ui_->uiWrite(resolvedId(), v); }
template <> inline const char* Res<const char*>::readImpl() const        { return ui_->uiReadString(resolvedId()); }

// Bool convenience: toggle() reads then writes the inverse. Free helper (avoids a
// class specialization just for one method on GCC 5).
inline void toggle(const Res<bool>& r) { r.set(!r.get()); }

// ---- Ui typed-creator default bodies. Declared on the Ui base in Ui.h; defined
//      HERE, where both Ui (included at the top of this header) and Res<T> (above)
//      are complete -- this is what breaks the Ui<->Res include cycle. The default
//      records the resource and returns an INERT (id 0) handle: harmless on
//      EmitterUi, which never resolves or writes a handle. RuntimeUi overrides
//      these (RuntimeUi.cpp) to return slot-tagged handles resolved at commit().
inline Res<bool>        Ui::resourceB(const std::string& slug, ValueType type)   { recordResource(slug, type); return Res<bool>(this, 0u); }
inline Res<uint32_t>    Ui::resourceU32(const std::string& slug, ValueType type) { recordResource(slug, type); return Res<uint32_t>(this, 0u); }
inline Res<int32_t>     Ui::resourceI32(const std::string& slug, ValueType type) { recordResource(slug, type); return Res<int32_t>(this, 0u); }
inline Res<float>       Ui::resourceF(const std::string& slug, ValueType type)   { recordResource(slug, type); return Res<float>(this, 0u); }
inline Res<const char*> Ui::resourceS(const std::string& slug, ValueType type)   { recordResource(slug, type); return Res<const char*>(this, 0u); }

}} // namespace ecb::ui
