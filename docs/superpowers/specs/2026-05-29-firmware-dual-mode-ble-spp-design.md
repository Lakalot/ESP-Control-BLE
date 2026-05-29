# Firmware dual-mode BLE + SPP — Design

**Date:** 2026-05-29
**Statut:** Design validé, prêt pour plan d'implémentation
**Périmètre:** Sous-projet 1 de 3 (firmware). Voir « Décomposition » ci-dessous.

## Contexte et objectif

Le firmware ESP32 expose aujourd'hui une console de contrôle via **BLE uniquement**
(stack NimBLE, l'ESP est périphérique/serveur ; l'app mobile est central/initiateur).

Besoin : permettre à une **vieille tablette qui ne supporte que le Bluetooth Classic**
(pas de BLE) de se connecter à l'ESP32 et de le contrôler **exactement comme l'app BLE**.
La tablette est un client de plus, qui parle **SPP** (Serial Port Profile, RFCOMM) au lieu
de BLE. L'ESP reste serveur ; la tablette initie la connexion. Aucun rôle inversé, aucun
pont/gateway.

Contrainte matérielle décisive (vérifiée) : sur l'ESP32 classique, BLE et Bluetooth Classic
coexistent au niveau radio (dual-mode BTDM), **mais** NimBLE est BLE-only et **ne peut pas
cohabiter avec la stack Classic**. `esp_bt_controller_enable()` ne peut être appelé qu'une
fois. Pour avoir SPP, il faut donc **migrer toute la couche Bluetooth de NimBLE vers
Bluedroid** (qui fait BLE + Classic dans une seule stack, en `ESP_BT_MODE_BTDM`).

Atout : le cœur protocole est **déjà transport-agnostique**. `DataBleTransport` ne dépend
que d'une abstraction `FrameSender` + `handleFrame(kind, body, len)` ; il ne connaît pas
NimBLE. La logique métier (manifest, ressources, actions, snapshot/delta) est donc réutilisée
à 100 %.

## Décomposition en sous-projets

Le chantier complet (firmware + 2 clients) est trop large pour un seul spec. Découpage en
3 sous-projets séquentiels, chacun avec son cycle spec → plan → implémentation :

1. **Firmware dual-mode** (CE SPEC) — migre NimBLE→Bluedroid, unifie l'auth en in-band,
   retire le legacy v4, ajoute SppTransport. **Fige le protocole filaire unifié.**
2. **App mobile BLE (adaptation)** — adapte le client BLE existant au protocole d'auth
   in-band. La découverte/connexion BLE ne change pas.
3. **Client SPP tablette** — app/outil sur la tablette qui parle SPP + le protocole unifié.

Ordre : 1 d'abord (porte le risque technique, fige le contrat). 2 et 3 sont indépendants
entre eux une fois le protocole figé.

## Architecture en couches

Objectif : isoler complètement le protocole applicatif des stacks Bluetooth, pour que le
même cœur serve BLE et SPP.

```
┌─────────────────────────────────────────────────────────────┐
│  Cœur protocole (INCHANGÉ — déjà transport-agnostique)       │
│  ManifestStore · ResourceTable · SubscriptionState ·         │
│  ActionRegistry · ActionDecoder · SnapshotEncoder            │
│  + ProtocolEngine (ex-DataBleTransport, élargi)              │
│    handleFrame(kind, body, len) + FrameSender                │
│    + AUTH in-band + état de session                          │
└───────────────▲──────────────────────────▲──────────────────┘
                │ ITransport (interface)    │
        ┌───────┴────────┐         ┌────────┴─────────┐
        │ BleTransport   │         │ SppTransport     │
        │ (Bluedroid BLE)│         │ (Bluedroid SPP)  │
        │ 2 caract.:     │         │ flux RFCOMM +    │
        │  manifest+data │         │ FrameAccumulator │
        └───────▲────────┘         └────────▲─────────┘
                │                            │
        ┌───────┴────────────────────────────┴─────────┐
        │  Bluedroid controller en ESP_BT_MODE_BTDM     │
        └───────────────────────────────────────────────┘
```

### Composants

- **`ProtocolEngine`** (évolution de `DataBleTransport`) : point d'entrée unique du
  protocole. Garde `handleFrame` + `FrameSender`, **absorbe l'auth** (machine à états) et
  gère l'**exclusivité de session**. Aucune dépendance transport.
- **Interface `ITransport`** : contrat minimal d'un transport — démarrer, envoyer des octets
  au client connecté, notifier l'engine des octets reçus, signaler connexion/déconnexion.
- **`BleTransport` (Bluedroid)** : réécrit sur `BLEDevice`/`BLEServer`. Passe de **3 à 2
  caractéristiques** (legacy v4 retiré) : `manifest` (read/découverte) + `data`
  (write/notify) qui porte désormais **tout** : auth in-band + protocole applicatif. La
  caractéristique CMD legacy disparaît.
- **`SppTransport` (Bluedroid)** : `BluetoothSerial` en serveur. `FrameAccumulator` pour
  reconstituer les trames depuis le flux RFCOMM ; `FrameSender` qui écrit sur SPP.
- **Init Bluetooth** : point unique qui initialise le contrôleur en `BTDM` puis démarre les
  deux transports.

## Modèle de session : 1 seule, exclusive

Une **seule** session active à la fois (BLE **ou** SPP, jamais les deux).

- État global `activeTransport ∈ {None, Ble, Spp}` dans `ProtocolEngine`.
- Connexion sur un transport alors que `None` → cette session devient active.
- Connexion alors qu'une session est déjà active sur l'autre transport → **refus** :
  déconnexion immédiate côté BLE / refus RFCOMM côté SPP.
- Déconnexion → `activeTransport = None`, état d'auth remis à `Idle`.

Conséquence : **un seul état d'auth global** (pas d'auth par-session), ce qui garde
`AuthHandler` quasi tel quel — seul le déclenchement devient in-band.

## Protocole filaire unifié (contrat pour les sous-projets 2 et 3)

### Format de trame (inchangé)

```
[kind:1][flags:1][length:2 big-endian][body:length]
```

### FrameKind d'auth in-band (nouveaux)

Ajoutés à l'enum existant (valeurs 0x40–0x43, libres) :

| Nom            | Valeur | Sens                                  | Body                      |
|----------------|--------|---------------------------------------|---------------------------|
| `AuthRequest`  | 0x40   | client → ESP : démarrer l'auth        | vide                      |
| `AuthChallenge`| 0x41   | ESP → client : défi                   | nonce (16 octets)         |
| `AuthResponse` | 0x42   | client → ESP : réponse                | hash (16 octets)          |
| `AuthResult`   | 0x43   | ESP → client : résultat               | body[0] = 0x01 OK / 0x00  |

FrameKind existants conservés : ManifestChunk 0x01, ManifestEof 0x02, Snapshot 0x10,
Delta 0x11, InvokeAction 0x20, InvokeResult 0x21, Subscribe 0x30, Unsubscribe 0x31,
Ping 0x32, Pong 0x33.

### Séquence d'authentification (identique BLE et SPP)

```
client                          ESP
  │ ── AuthRequest ──────────────▶│  génère nonce aléatoire ; état → Challenged
  │ ◀───────── AuthChallenge ──────│  body = nonce (16 o)
  │ ── AuthResponse ──────────────▶│  body = hash ; compare ; état → Authenticated si OK
  │ ◀───────── AuthResult ─────────│  body[0] = 0x01 / 0x00
  │ ── Subscribe / InvokeAction ──▶│  rejeté si non authentifié
```

### Règles d'auth

- Avant `Authenticated`, l'engine **rejette** toute trame ≠ `AuthRequest`/`AuthResponse`.
- État d'auth **global** (session exclusive), remis à `Idle` à la déconnexion.
- `hash = SHA-256(PIN ‖ nonce)` tronqué aux **16 premiers octets**. Nonce = **16 octets**
  aléatoires (`esp_random`). Comparaison à **temps constant** (pas de `memcmp` court-circuité).

### Framing SPP — `FrameAccumulator`

SPP est un flux d'octets continu (pas de frontières de message). Composant réutilisable :

1. accumule les octets entrants dans un buffer borné (`4 + kMaxFrameBody`) ;
2. dès ≥ 4 octets, lit `length` depuis le header ;
3. attend `4 + length` octets, puis livre la trame complète à l'engine et retire ces octets ;
4. **resynchro** : si `kind` inconnu ou `length > kMaxFrameBody`, drop 1 octet et retente
   (évite le blocage sur flux corrompu) ;
5. si le buffer atteint sa borne sans trame valide → drop pour éviter la croissance non bornée.

BLE n'a pas besoin de l'accumulateur (chaque write est déjà une trame délimitée), mais peut
le réutiliser pour homogénéité si pertinent.

## Mémoire, flash, partition

- **RAM** : Bluedroid BTDM ne permet plus de libérer la DRAM Classic (`esp_bt_mem_release`
  inapplicable). Surcoût attendu **+60 à +100 Ko** vs NimBLE. Base actuelle 42 Ko → cible
  ~100–140 Ko, dans les 320 Ko mais **à mesurer tôt**.
- **Flash** : dual-mode gonfle le binaire (base actuelle 47 %). **Action probable** : passer
  à une table de partitions `huge_app` ou custom via `board_build.partitions`. À valider au
  premier build Bluedroid.
- **Garde-fou** : la première étape d'implémentation est un spike Bluedroid BTDM minimal
  (BLE + SPP qui démarrent) pour **mesurer RAM/Flash réels avant** d'investir dans la
  migration complète. Décision Go/No-go sur le budget à ce moment.

## Stratégie de test

| Composant | Natif ? | Tests |
|---|---|---|
| `ProtocolEngine` (handleFrame + auth in-band + exclusivité) | ✅ | séquence d'auth, rejet avant auth, reset à la déconnexion, refus 2ᵉ session |
| `FrameAccumulator` | ✅ | trame en 1 morceau, fragmentée, 2 trames collées, resynchro kind/length invalide, buffer borné |
| Auth renforcée (nonce/hash 16 o, temps constant) | ✅ | étend `test_auth_handler` |
| `ITransport` via `FakeTransport` | ✅ | injection d'octets, capture des envois |
| `BleTransport` / `SppTransport` (Bluedroid) | ❌ device | compilation esp32dev + test manuel (app BLE + terminal SPP type Android/PuTTY) |

Le gros du risque protocole est couvert nativement grâce à l'architecture transport-agnostique.

## Découpage d'implémentation (ordre, chaque étape vérifiable)

1. **Spike Bluedroid BTDM** : hello-world BLE+SPP qui démarrent ; **mesure RAM/Flash** ;
   Go/No-go budget. *(device)*
2. **`FrameAccumulator`** + tests natifs. *(natif, zéro dépendance Bluetooth)*
3. **Auth in-band dans `ProtocolEngine`** + nonce/hash 16 o + temps constant + tests natifs.
4. **Interface `ITransport`** + `FakeTransport` + rebrancher l'engine + tests natifs.
5. **`BleTransport` Bluedroid** iso-fonctionnel (2 caractéristiques) → valider BLE device.
6. **Retrait du legacy v4** (`CommandRegistry`, ancienne caractéristique CMD). *(natif + device)*
7. **`SppTransport` Bluedroid** + exclusivité de session → valider tablette device.
8. **Build esp32dev final** + mesure RAM/Flash + partition ajustée.

Étapes 2–4 = pur natif TDD, débloquent l'essentiel du protocole avant de toucher Bluedroid.

## Impacts hors firmware (traités dans les sous-projets 2 et 3)

- **App mobile BLE** : l'auth passe d'un déclenchement par `subscribe` à un handshake in-band
  (AuthRequest/Challenge/Response/Result) ; nonce/hash passent à 16 o ; la caractéristique CMD
  legacy disparaît (auth + data sur la caractéristique `data`). Découverte/connexion BLE
  inchangées.
- **Client SPP tablette** : nouveau client implémentant le protocole filaire ci-dessus sur un
  socket RFCOMM/SPP.

## Hors périmètre (YAGNI)

- Connexions multiples simultanées (on a choisi 1 session exclusive).
- Auth par-session (inutile avec session exclusive).
- Pont/gateway vers des appareils Classic (l'ESP reste serveur, pas maître).
- OTA / re-design de partition au-delà du strict nécessaire pour faire tenir le binaire.
