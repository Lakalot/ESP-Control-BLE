# C++ UI builder (full-C++ manifest authoring) — Design

**Date:** 2026-05-29
**Statut:** Design validé, prêt pour plan d'implémentation (le plan commence par un spike Go/No-Go).
**Périmètre:** Nouvelle façon d'écrire l'UI + les handlers côté ESP, en remplacement du YAML, sans changer l'app mobile.

## Contexte et objectif

Aujourd'hui un utilisateur de la lib décrit son appareil en **deux endroits / deux langages** :
- l'UI + les ressources + les actions en **YAML** (`firmware/esp32/src/manifest.yaml`), compilé en protobuf à la build par `tools/embed_manifest.py` (via le toolchain TS `tools/manifest`), qui produit `manifest_data.h` (binaire embarqué, envoyé à la tablette) **et** `manifest_symbols.h` (les `manifest_resources::x` / `manifest_actions::y` que le C++ référence) ;
- les **handlers** en C++ (`registerAction(manifest_actions::…, lambda)`), avec validation `valueKind` manuelle et publication `setX`+`publishDelta` répétée.

Frictions : (a) deux langages, (b) le `firmwareSymbol` à garder synchronisé à la main entre YAML et C++ (casse silencieuse au renommage), (c) le boilerplate des handlers.

Objectif (choix produit assumé) : **décrire toute l'UI ET les handlers en C++ fluide, au même endroit**, avec un gros gain de simplicité, **sans coût runtime sur l'ESP** et **sans recompiler ni modifier l'app mobile**.

Point capital vérifié : l'app mobile est 100 % pilotée par le manifeste — elle décode des octets protobuf reçus de l'ESP et rend l'UI (`NodeRenderer`/`widgetRegistry`). Elle ignore d'où vient le protobuf. **Donc tant que le protobuf émis est identique au format actuel, l'app mobile ne change pas.**

## Approche retenue : A1/1b (full C++, émis à la compilation)

Une **seule** fonction de description C++ (`buildUi(Ui&, AppRuntime&, DeviceState&)`) est appelée dans **deux contextes** via une interface abstraite `Ui` (visiteur) :

```
┌─ PC (build step, remplace embed_manifest.py dans extra_scripts) ──────────┐
│  device_ui.cpp + EmitterUi (impl PC) compilés par g++ en un petit exe      │
│  hôte → buildUi() est appelé → EmitterUi sérialise la structure visitée    │
│  en JSON (forme de l'objet manifeste de tools/manifest) → on réutilise     │
│  normalize()+encodeManifest() (TS existant) → manifest_data.h (protobuf).  │
│  Les lambdas de handlers ne sont JAMAIS exécutées ici (forme seule).       │
└────────────────────────────────────────────────────────────────────────────┘
┌─ ESP (runtime) ────────────────────────────────────────────────────────────┐
│  device_ui.cpp + RuntimeUi (impl ESP) → buildUi() appelé au setup() →       │
│  RuntimeUi enregistre les ressources (liées à l'état, auto-publish) et les   │
│  handlers (les lambdas). Le manifeste binaire embarqué (manifest_data.h)    │
│  est envoyé à la tablette comme aujourd'hui.                                │
└────────────────────────────────────────────────────────────────────────────┘
```

Pourquoi A1 (émis à la compile) et pas A2 (construit au boot) : **perf**. L'ESP embarque le binaire pré-calculé (zéro construction/sérialisation au runtime), exactement comme aujourd'hui. Réutilise le slot `extra_scripts` existant.

Pourquoi l'émetteur passe par **JSON → toolchain TS** (et ne réémet pas le protobuf en C++) : une **seule source de vérité** du format binaire que la tablette comprend. L'émetteur C++ ne fait que sérialiser la forme visitée ; `normalize()`+`encodeManifest()` (déjà testés) font le protobuf. Pas de duplication de l'encodeur → pas de risque de divergence avec la tablette.

## API (mécanisme 1b, fluente)

Exemple complet (section "Lighting" de l'appareil actuel) :

```cpp
// device_ui.cpp — UI + ressources + handlers, un seul endroit
#include <EspControlUi.h>
#include "device/AppRuntime.h"   // en-tête PORTABLE (pas d'<Arduino.h>)
#include "device/DeviceState.h"

void buildUi(ecb::Ui& ui, app::AppRuntime& rt, app::DeviceState& state) {
  auto relay      = ui.resource("relay.auto", state.relayEnabled);       // bool
  auto brightness = ui.resource("light.brightness", state.brightness).unit("%"); // uint
  auto color      = ui.resource("light.color")
                       .enumv({"warm_white","cool_white","red","green","blue","party"});

  ui.section("Lighting")
    .toggle("Main Power", relay)
      .onSet([&](bool)        { rt.toggleRelay();        relay = state.relayEnabled; })
    .slider("Brightness", brightness, 0, 100)
      .onSet([&](uint8_t v)   { rt.setBrightness(v);     brightness = state.brightness; })
    .select("Color Preset", color)
      .onSet([&](const char* c){ rt.setColorPreset(c);   color = colorPresetName(state.colorPreset); });
}
```

- **Typage compile-time des handlers** : `slider(...).onSet` exige `void(uint8_t)`, `toggle` → `void(bool)`, `select`/`text_input` → `void(const char*)`. Un mismatch est une **erreur de compilation** (remplace la validation `valueKind` runtime).
- **Ressources « live »** : `ui.resource(id, stateVar)` lie la ressource à une variable ; l'affectation (`brightness = …`) publie le delta automatiquement (plus de `setUint`+`publishDelta`).
- **Plus de `firmwareSymbol`** : l'id (`"light.brightness"`) est l'unique référence ; les symboles numériques sont gérés en interne.

## Discipline de portabilité (la contrainte clé de A1)

`device_ui.cpp` + `EspControlUi.h` doivent **compiler sur PC sans Arduino/ESP-IDF** (pour l'émetteur). Donc :
- Les **lambdas de handlers n'appellent que la couche applicative portable** (`AppRuntime`/`DeviceState`) — jamais d'API Arduino directe (`analogWrite`, `Serial`, etc.). Les en-têtes `AppRuntime.h`/`DeviceState.h` doivent être **portables** : pas d'`#include <Arduino.h>`. `DeviceState` l'est déjà ; `AppRuntime` devra exposer ses méthodes métier sans Arduino dans l'en-tête (l'impl `.cpp` garde Arduino, compilée **ESP-only**).
- Côté PC, l'émetteur linke `device_ui.cpp` avec des **stubs** d'`AppRuntime` (les lambdas compilent, ne s'exécutent jamais à l'émission).
- Bénéfice : on garde layout + handlers **inline au même endroit**, au prix d'une bonne pratique (logique métier découplée de l'I/O matériel). C'est aussi ce qui rend les handlers testables nativement.

## Composants

**Nouveau (lib) :**
- `EspControlUi.h` : l'interface `Ui` + les types de builder (`ResourceRef`, `SectionBuilder`, `WidgetBuilder`, `ViewBuilder`, `NavBuilder`) — portable, sans Arduino.
- `RuntimeUi` (ESP) : implémentation qui enregistre ressources + handlers dans `EspControl` (réutilise `ActionRegistry`/`ResourceTable`/le moteur existant).
- `EmitterUi` (PC) : implémentation qui sérialise la structure en JSON (forme `tools/manifest`).

**Nouveau (build/outillage) :**
- `tools/emit_ui.py` (ou évolution de `embed_manifest.py`) : compile `device_ui.cpp` + `EmitterUi` + un `main()` hôte avec g++, l'exécute pour produire le JSON, le passe au CLI TS (`compile` étendu pour accepter ce JSON) → `manifest_data.h` + `manifest_symbols.h`.
- Extension du CLI `tools/manifest` : accepter une **source JSON** (l'objet manifeste déjà formé) en plus du YAML — réutilise `normalize()`+`encodeManifest()`.

**Modifié (app exemple) :**
- `manifest.yaml` → `device_ui.cpp` (migration, avec preuve d'égalité protobuf).
- `AppRuntime.h` rendu portable ; `DeviceActions` fusionné dans `buildUi` (les handlers y vivent).
- `platformio.ini` : `extra_scripts` pointe vers le nouvel émetteur.

**Inchangé :**
- Tout `tools/manifest/src/compiler` (`normalize`, `encodeProto`, …) — réutilisé tel quel.
- L'app mobile — **zéro changement** (protobuf identique).
- Le firmware lib (transports, ProtocolEngine, auth) — inchangé.

## Stratégie de test

- **Spike (Go/No-Go, première tâche du plan)** : un `EmitterUi` minimal sur 2-3 widgets → JSON → protobuf, et **comparaison byte-à-byte avec le protobuf produit par le YAML équivalent**. Prouve (i) que le mécanisme PC compile/exécute, (ii) que le format binaire est identique (tablette inchangée). Si l'égalité n'est pas atteignable proprement, STOP et réviser.
- **Émetteur** : tests sur PC — décrire une UI, émettre le JSON, comparer à un golden ; puis protobuf == golden YAML.
- **RuntimeUi** : tests natifs (Unity) — `buildUi` avec un `EspControl`/transport factice enregistre les bonnes ressources/handlers ; un handler typé reçoit la bonne valeur ; l'affectation d'une ressource publie un delta.
- **Migration** : le `device_ui.cpp` portant l'appareil actuel doit émettre un protobuf **byte-identique** à `manifest.yaml` (test de non-régression ; garantit la tablette inchangée).
- **Portabilité** : `device_ui.cpp` compile avec g++ PC (sans Arduino) — vérifié par le build de l'émetteur.

## Découpage d'implémentation (le plan détaillera)

1. **Spike émetteur** (Go/No-Go) : `EmitterUi` minimal + chemin JSON→TS→protobuf + égalité byte-à-byte sur un sous-ensemble. Décision avant d'investir.
2. **CLI TS** : accepter une source JSON (objet manifeste) en plus du YAML.
3. **`EspControlUi.h`** : l'interface `Ui` + builders, portable, typage des handlers. Tests de forme.
4. **`EmitterUi`** complet (tous les widgets/ressources/vues/navBar) + golden tests.
5. **`RuntimeUi`** : enregistrement ressources (live/auto-publish) + handlers typés dans `EspControl`. Tests natifs.
6. **Portabiliser `AppRuntime.h`** (sortir Arduino de l'en-tête) + stubs PC.
7. **Build** : `tools/emit_ui.py` dans `extra_scripts` (compile+exécute l'émetteur, passe au CLI).
8. **Migration** de `manifest.yaml` → `device_ui.cpp` + preuve protobuf byte-identique + build esp32dev.
9. **Vérif finale** : natif vert, esp32dev build, tablette non impactée (protobuf identique).

## Risques / points durs (assumés)

- **Le double build** (compiler une partie du firmware pour PC) est le gros morceau d'ingénierie ; isolé derrière le spike.
- **La portabilité d'`AppRuntime.h`** : si la logique métier est trop intriquée avec Arduino, la sortir peut demander un refactor. À mesurer tôt.
- **Coexistence temporaire** : pendant la migration, garder `embed_manifest.py`/YAML opérationnel jusqu'à ce que `device_ui.cpp` prouve l'égalité, puis bascule.

## Hors périmètre (YAGNI)

- Changer le format protobuf ou l'app mobile.
- A2 (construire le manifeste au boot) — écarté pour la perf.
- constexpr-pur (1a) — écarté pour l'ergonomie.
- Réémettre l'encodeur protobuf en C++ — on réutilise le toolchain TS.
- Un éditeur visuel d'UI.

## Contrat préservé

Le protobuf émis (donc ce que la tablette reçoit) reste **identique** au format actuel — mêmes champs, mêmes ids, même string table. C'est la condition non négociable : l'app mobile et le protocole filaire (sous-projets 1-3) ne changent pas.
