# SPP transport for the Android app — Design

**Date:** 2026-05-29
**Statut:** Design validé, prêt pour plan d'implémentation
**Périmètre:** Sous-projet 3 de 3 (client SPP). Dépend du protocole figé par le sous-projet 1 et de l'app mobile du sous-projet 2.

## Contexte

La tablette cible est **Android 8.1.0 (API 27)** dont le **matériel BLE ne fonctionne pas** ; seul
le Bluetooth Classic (SPP/RFCOMM) est utilisable. L'app mobile (Expo / React Native, sous-projet 2)
ne peut donc pas s'y connecter via BLE. Il faut un **transport SPP**.

Décision d'architecture (validée) : **étendre l'app Expo existante** avec un transport SPP plutôt
que créer une app séparée. Tout le moteur applicatif est réutilisé sans modification :
`connectionMachine`, `BleRuntime`, l'auth in-band, `frameCodec`/`BleFrameStream`,
`ManifestScreenRenderer`, `useDeviceUi`, `deviceUiMachine`. Le découplage mis en place au
sous-projet 2 rend ça direct : `BleRuntime` accepte n'importe quel device implémentant l'interface
`FixtureBleDevice` (`write`/`onNotify`/`onDisconnected`/`disconnect`), et `connectionMachine`
accepte des callbacks `connect`/`authenticate` quelconques.

Conditions du projet (vérifiées) : l'app est en **workflow prebuild** (`android/` présent),
`expo-dev-client` est installé, `expo-modules-core` est disponible (Expo 54), et les permissions
Bluetooth Classic (`BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_CONNECT`, `BLUETOOTH_SCAN`) sont déjà
déclarées. Sur API 27 (< 31), `BLUETOOTH`/`BLUETOOTH_ADMIN` sont accordées à l'installation — pas de
demande runtime, plus simple que sur Android moderne.

## Architecture

```
  ┌─────────────────────────────────────────────────────────┐
  │  RÉUTILISÉ TEL QUEL (sous-projet 2) :                    │
  │  connectionMachine · BleRuntime · auth · frameCodec ·    │
  │  BleFrameStream · ManifestScreenRenderer · useDeviceUi   │
  └───────────────▲─────────────────────────────────────────┘
                  │ interface FixtureBleDevice
                  │ (write / onNotify / onDisconnected / disconnect)
        ┌─────────┴──────────┐
        │  RealBleDevice     │   SppDevice  ◀── NOUVEAU (JS/TS)
        │  (BLE, existant)   │   parle au module natif
        └────────────────────┘        │
                                       │ Expo Modules API (Function/AsyncFunction + Events)
                              ┌────────┴───────────────────────┐
                              │  EcbSpp local Expo module (Kotlin) ◀── NOUVEAU
                              │  BluetoothSocket RFCOMM,                │
                              │  SPP UUID 00001101-0000-1000-8000-     │
                              │  00805F9B34FB, read-loop sur thread    │
                              └─────────────────────────────────────────┘
```

### Composants nouveaux

1. **Module natif local Expo `EcbSpp` (Kotlin)** — créé via `npx create-expo-module --local`,
   sous `apps/mobile/modules/ecb-spp/`. Utilise l'**Expo Modules API** (`Module`/`ModuleDefinition`,
   `Function`/`AsyncFunction`, `Events`, `sendEvent`). API exposée :
   - `AsyncFunction("isAvailable")` → `Boolean` (Bluetooth Classic présent + activé).
   - `AsyncFunction("listBondedDevices")` → `[{ name: String, address: String }]`
     (`BluetoothAdapter.bondedDevices`).
   - `AsyncFunction("connect")(address: String)` → ouvre un `BluetoothSocket` RFCOMM vers
     l'UUID SPP standard, lance une boucle de lecture sur un thread dédié. Résout à la connexion,
     rejette sur échec (non appairé / hors portée / occupé).
   - `AsyncFunction("write")(base64: String)` → écrit les octets sur l'`OutputStream`.
   - `AsyncFunction("disconnect")()` → ferme le socket et interrompt le thread proprement
     (flag intentionnel pour ne pas émettre `onDisconnected` sur une fermeture volontaire).
   - `Events("onData", "onDisconnected")` — `onData` émet les chunks reçus (base64) ;
     `onDisconnected` émet quand le read-loop détecte une fin de flux non sollicitée
     (`read() == -1` / `IOException`).
   - Mono-connexion (la tablette pilote un ESP à la fois), cohérent avec la session exclusive
     côté firmware.

2. **`SppDevice` (TS)** — `apps/mobile/src/manifest/runtime/SppDevice.ts`. Implémente la **même
   interface** que `RealBleDevice` (`write`/`onNotify`/`onDisconnected`/`disconnect`,
   `sentFrames`/`queueIncoming` no-op pour satisfaire `FixtureBleDevice`) :
   - `write(frame)` → base64 → `EcbSpp.write`.
   - s'abonne à l'événement natif `onData` → décode base64 → notifie ses `onNotify` listeners
     (chunks bruts ; **`BleRuntime`/`BleFrameStream` réassemble les trames par longueur d'en-tête**,
     exactement comme le `FrameAccumulator` firmware).
   - s'abonne à `onDisconnected` natif → notifie ses `onDisconnected` listeners (déclenche la
     reconnexion de `connectionMachine`).
   - `disconnect()` → `EcbSpp.disconnect`.
   - Un `createSppDevice(address)` qui `await EcbSpp.connect(address)` puis renvoie le `SppDevice`
     (parallèle de `createRealBleDevice`).

3. **Sélection de transport (auto-détection)** — au démarrage l'app choisit BLE ou SPP :
   si le BLE est indisponible/non supporté sur l'appareil (`bleState === 'unsupported'`, ou
   `EcbSpp.isAvailable()` vrai alors que le BLE ne l'est pas) → **mode SPP**. Un override manuel
   reste possible (réutilise un flag de transport, voir ci-dessous) pour forcer/debug. Sur la
   tablette cible (BLE cassé) → SPP automatiquement, sans config.

### Découverte des appareils (SPP ≠ BLE)

SPP ne se scanne pas par UUID de service. Flux Android standard :
1. L'utilisateur **appaire** l'ESP une fois dans les Réglages Bluetooth Android.
2. L'app liste les **appareils appairés** via `EcbSpp.listBondedDevices()` et l'utilisateur choisit.

L'écran de scan (`app/index.tsx`), en mode SPP, affiche les appareils appairés au lieu de lancer un
scan BLE. À la sélection, `connectionMachine` reçoit un `connect` SPP :
`new BleRuntime(await createSppDevice(address))`.

### Réutilisé sans modification

`connectionMachine` (connect→auth→ready, retry, reconnexion auto + ré-auth, busy), `BleRuntime`
(auth in-band, manifeste via chunks/EOF, snapshots/deltas/invoke), `auth.ts`, `frameCodec`,
`BleFrameStream`, le rendu manifeste, `useDeviceUi`. La reconnexion auto fonctionne **telle quelle**
en SPP car `SppDevice.onDisconnected` a la même sémantique que `RealBleDevice.onDisconnected`.

## Intégration UI

- Au lancement : déterminer le transport (auto BLE→SPP). Le `manifestRuntimeFlag` est étendu en
  `'ble' | 'spp' | 'fixture'` (toujours en mémoire, défaut = résultat de l'auto-détection ;
  override possible). `'fixture'` reste le mode debug sans matériel du sous-projet 2.
- `app/index.tsx` : en mode `spp`, liste `EcbSpp.listBondedDevices()` (mêmes cartes d'appareil) ;
  en mode `ble`, le scan BLE existant ; bouton « Appairer dans les réglages » si aucun appairé.
- `app/control/[deviceId].tsx` : le `DeviceRenderer` construit le `connect` selon le transport
  (`createSppDevice(address)` vs `createRealBleDevice(id)`). Le reste (machine, reconnexion,
  cleanup, rendu) est identique.

## Gestion d'erreurs et cas limites

| Cas | Comportement |
|---|---|
| Aucun appareil appairé | Écran SPP : « Appairez votre ESP dans les réglages Bluetooth » + bouton vers les réglages. |
| Connexion RFCOMM échoue (éteint/hors portée) | `connect()` rejette → `connectionMachine` retry backoff → `failed` après N essais. |
| Appareil non appairé au connect | Message clair « appareil non appairé ». |
| Déconnexion en cours de session | read-loop natif détecte fin de flux → événement `onDisconnected` → reconnexion + ré-auth auto (déjà géré). |
| Session exclusive firmware (BLE déjà connecté) | RFCOMM refusé → message « appareil occupé » (logique busy existante côté machine). |
| Thread de lecture | thread dédié ; interrompu proprement à disconnect/cleanup ; pas de fuite ; fermeture volontaire ne déclenche pas `onDisconnected` (flag intentionnel). |
| Framing | identique au BLE : `BleFrameStream` réassemble ; le firmware borne les trames. |

## Stratégie de test (Jest)

Commande : `cd apps/mobile && npm test`.

| Quoi | Comment |
|---|---|
| `SppDevice` (TS) | Mock du module natif `EcbSpp` (jest `moduleNameMapper` ou un mock manuel injecté) : `write` encode base64 et appelle le natif ; un événement `onData` simulé est décodé et passé à `onNotify` ; `onDisconnected`/`disconnect` fonctionnent. |
| Intégration `BleRuntime` + `SppDevice` | Le `SppDevice` (sur mock natif) se branche dans `BleRuntime` ; auth in-band + framing + manifeste fonctionnent (réutilise les patterns de `BleRuntime.test.ts`). |
| Auto-détection transport | Test unitaire de la logique de sélection (BLE unsupported → spp ; override). |
| Module natif Kotlin | ❌ Non testable en Jest. Vérifié par build de l'app (dev client) + **test sur la tablette réelle** (seul moyen de valider RFCOMM). |

## Découpage d'implémentation

1. **Module natif `EcbSpp`** : scaffolder le module local Expo (Kotlin) ; implémenter
   `isAvailable`/`listBondedDevices`/`connect`/`write`/`disconnect` + events `onData`/`onDisconnected`
   avec le read-loop et le flag intentionnel. Build du dev client (vérif compilation).
2. **Typings + wrapper JS du module** : interface TS du module natif (`EcbSpp` typé) + un mock Jest.
3. **`SppDevice`** (implémente `FixtureBleDevice`) + `createSppDevice(address)` + tests (mock natif).
4. **Logique d'auto-détection de transport** + extension du flag `'ble' | 'spp' | 'fixture'` + tests.
5. **Intégration UI** : `index.tsx` liste les appareils appairés en mode SPP ;
   `[deviceId].tsx` choisit le `connect` selon le transport. Typecheck.
6. **Vérif finale** : `jest` vert, `tsc` propre, build dev client OK. (Test tablette = manuel, côté
   utilisateur.)

## Contrat consommé (figé par le sous-projet 1, identique au BLE)

- Trame : `[kind:1][flags:1][length:2 BE][body:length]` (réassemblée par `BleFrameStream`).
- Auth in-band : `AuthRequest 0x40` → `AuthChallenge 0x41` (nonce 16 o) → `AuthResponse 0x42`
  (hash 16 o) → `AuthResult 0x43`. `hash = SHA-256(pin‖nonce)[:16]`.
- Manifeste poussé automatiquement par le firmware après `AuthResult OK`.
- Une seule session à la fois côté firmware.
- Le transport est interchangeable : SPP fournit le même flux d'octets bidirectionnel que la
  caractéristique BLE data.

## Hors périmètre (YAGNI)

- iOS (iOS ne fait pas SPP hors MFi ; non concerné).
- Découverte active SPP (on s'appuie sur les appareils appairés).
- Multi-connexion (un ESP à la fois).
- Re-design de l'écran de scan au-delà de l'affichage des appareils appairés en mode SPP.
- Minors mobiles différés du sous-projet 2 (docstrings, console.log) — hors de ce sous-projet.
