# Mobile app — in-band auth + BLE cutover — Design

**Date:** 2026-05-29
**Statut:** Design validé, prêt pour plan d'implémentation
**Périmètre:** Sous-projet 2 de 3 (app mobile). Dépend du protocole figé par le sous-projet 1 (firmware dual-mode).

## Contexte

Le firmware (sous-projet 1) a migré son transport BLE de NimBLE vers Bluedroid et changé son
protocole d'authentification. Conséquences pour l'app mobile :

- **La caractéristique CMD (`8bf0baf5-…`) n'existe plus.** Le firmware n'expose que deux
  caractéristiques : manifest (READ, `f99e14e3-…`) et data (WRITE|NOTIFY, `fac1a3ac-…`).
- **L'auth est désormais in-band** sur la caractéristique data, via des trames :
  `AuthRequest 0x40` (corps vide) → `AuthChallenge 0x41` (corps = nonce 16 o) →
  `AuthResponse 0x42` (corps = hash 16 o = `SHA-256(pin‖nonce)[:16]`) → `AuthResult 0x43`
  (corps[0] = 0x01 OK / 0x00 FAIL).
- Nonce et hash font **16 octets** (avant : 4).

État actuel de l'app mobile (deux stacks BLE coexistants) :

- **Stack legacy ACTIF** : `transport/BleConnection.ts` sur la caractéristique CMD, auth
  challenge/response hors-bande (octets 0xF0/0xF1/0xF2), hash 4 o
  (`protocol/auth/ChallengeResponse.ts`), orchestré par `hooks/useBle.ts` +
  `useBleConnection.ts` + `useBleAuth.ts` + `useBleManifest.ts` + `useBleCommands.ts`.
  **Ce stack est MORT face au nouveau firmware** (la caractéristique CMD a disparu).
- **Stack cible désactivé** : `manifest/runtime/RealBleDevice.ts` + `manifest/runtime/BleRuntime.ts`
  sur la caractéristique data, protocole à trames (`frameCodec.ts`, `bleFrameStream.ts`). Il
  gère déjà manifest-chunks / snapshots / deltas / invoke-action, mais **n'a aucune auth**, et
  il est désactivé par un flag (`settings/manifestRuntimeFlag.ts`, codé en dur sur `'manifest'`).

## Bug firmware découvert pendant ce design

L'ancien firmware NimBLE envoyait le manifeste automatiquement quand le client s'abonnait à la
caractéristique data (`EcbDataCallbacks::onSubscribe → sendDataManifest`). La réécriture
Bluedroid (sous-projet 1, Task 5) a **perdu ce déclencheur** — `ProtocolEngine::sendManifest()`
n'est jamais appelé, donc le nouveau firmware n'envoie jamais le manifeste.

**Correctif retenu :** le firmware appelle `sendManifest()` juste après avoir émis `AuthResult OK`
dans `ProtocolEngine::handleAuthResponse`. Aucun nouveau type de trame ; l'envoi est naturellement
gaté par l'auth ; sémantique claire (« authentifié → je reçois l'UI »). Le mobile n'a donc qu'à
attendre les trames `ManifestChunk`/`ManifestEof` après une auth réussie.

## Décision : cutover complet + suppression du legacy

Le stack legacy est mort ; le conserver laisserait du code trompeur. On bascule entièrement sur
le chemin data, on y greffe l'auth in-band, et on **supprime** tout le legacy. (Conforme à la
préférence : refactoring propre plutôt que patch minimal.)

## Architecture cible (mobile)

```
  Scan (BleScanner, par UUID de service — inchangé)
        │
        ▼
  createRealBleDevice(deviceId)  ── caractéristique DATA (write/notify) uniquement
        │
        ▼
  BleRuntime (sur la caract DATA via BleFrameStream)
    1. authenticate(pin)                       ◀── NOUVEAU
       write AuthRequest
       attend AuthChallenge (nonce 16 o)
       write AuthResponse(SHA-256(pin‖nonce)[:16])
       attend AuthResult → résout / rejette
    2. loadManifest()   (reçoit ManifestChunk/Eof auto après l'auth, grâce au correctif firmware)
    3. subscribe / invokeAction / snapshots / deltas  (déjà implémenté)
        │
        ▼
  ConnectionController (machine à états)  ── pilote la séquence + reconnexion + ré-auth
        │
        ▼
  UI (PilotRenderer / useDeviceUi)
```

### Composants

- **`frameCodec.ts`** — ajouter au `FrameKind` enum : `AuthRequest=0x40`, `AuthChallenge=0x41`,
  `AuthResponse=0x42`, `AuthResult=0x43`.
- **Nouveau `manifest/runtime/auth.ts`** — `computeAuthResponse(pin, nonce): Promise<Uint8Array>`
  = `SHA-256(pin‖nonce)` tronqué à **16 octets**, via `expo-crypto` (déjà utilisé). Remplace
  `protocol/auth/ChallengeResponse.ts` (4 o, hors-bande).
- **`BleRuntime`** — nouvelle méthode `authenticate(pin)` ; `dispatchFrame` reconnaît
  `AuthChallenge` (résout l'attente de challenge) et `AuthResult` (résout/rejette l'auth). Auth
  basée sur des promesses internes (`authResolve`/`authReject`), avec timeout.
- **`ConnectionController`** (nouveau, ex. `manifest/runtime/ConnectionController.ts`) — machine à
  états centralisée : `connecting → authenticating → loading → ready → reconnecting → failed`.
  Orchestre connect → authenticate → loadManifest → (re)subscribe. Gère la reconnexion auto + la
  ré-auth. Annulable (si l'utilisateur quitte l'écran). Remplace la logique éparpillée des hooks
  legacy.
- **Orchestration UI** — `PilotRenderer` / `useDeviceUi` câblés sur le `ConnectionController` ; le
  PIN provient déjà des params de route.
- **Flag de runtime REDÉFINI (debug conservé)** — `settings/manifestRuntimeFlag.ts` est conservé
  mais ses valeurs changent de sens. Aujourd'hui `'manifest' | 'fixture'` où `'manifest'`
  désignait l'ancien chemin legacy ; il devient **`'device' | 'fixture'`** :
  - `'device'` (défaut prod) → `BleRuntime` sur BLE réel (via le `ConnectionController`).
  - `'fixture'` → `FixtureRuntime` (mock embarqué via `bundledFixtureRuntime`, sans matériel) —
    le **mode debug**, qui permet de piloter l'UI complète sans ESP32. Précieux tant que la
    validation device n'est pas faite.
  Le bug actuel de `setManifestRuntime` (qui ne peut jamais sélectionner `'fixture'`) est corrigé
  au passage. `PilotRenderer` choisit l'implémentation `ManifestRuntime` selon le flag ; les deux
  partagent la même interface, donc l'UI en aval est identique.

### Conservés

`transport/BleScanner.ts` et `transport/BleManager.ts` — la découverte par UUID de service ne
change pas.

### Supprimés (legacy)

`transport/BleConnection.ts`, `transport/IBleTransport.ts`, `transport/BleNotifyHandler.ts`,
`protocol/auth/ChallengeResponse.ts`, `protocol/frame/CommandEncoder.ts` +
`protocol/frame/CommandDecoder.ts` (+ leurs `__tests__`), `hooks/useBle.ts`,
`hooks/useBleConnection.ts`, `hooks/useBleAuth.ts`, `hooks/useBleManifest.ts`,
`hooks/useBleCommands.ts`, `types/protocol.types.ts` (constantes 0xF0/0xF1/0xF2). Toute référence
résiduelle doit être supprimée (vérif au typecheck). `settings/manifestRuntimeFlag.ts` est
**conservé mais redéfini** (voir Orchestration UI), pas supprimé.

## Gestion d'erreurs et cas limites

| Cas | Comportement |
|---|---|
| PIN incorrect | `AuthResult` corps[0]=0x00 → `authenticate()` rejette `AuthError` → UI « PIN incorrect » + re-saisie ; le PIN erroné est retiré du stockage sécurisé. |
| Timeout d'auth | Pas de réponse sous 5 s à AuthRequest/AuthResponse → rejet `AuthTimeoutError`. |
| 2ᵉ connexion refusée (session SPP active côté firmware) | Le firmware déconnecte ; le mobile traduit la déconnexion immédiate post-connect en erreur « appareil occupé » plutôt qu'un timeout opaque. |
| Déconnexion inopinée | Reconnexion auto (backoff, 3 tentatives) **puis ré-auth + re-manifest + re-subscribe** automatiques. Au-delà → état `failed` + callback UI. |
| Trame Auth hors séquence | Ignorée si aucune auth en cours ; loggée ; pas de crash. |
| Manifeste invalide (CRC/taille) | `loadManifest` rejette (déjà géré) → erreur UI. |
| MTU / fragmentation | `BleFrameStream` réassemble via la longueur d'en-tête ; `RealBleDevice` demande MTU 512. |

La reconnexion + ré-auth est **idempotente et annulable** : quitter l'écran pendant un backoff
annule la séquence. Le PIN reste en mémoire le temps de la session pour permettre la ré-auth
transparente (choix validé : reconnexion + ré-auth automatiques).

## Stratégie de test (Jest)

Commande : `npm test` (dans `apps/mobile`), soit `jest`.

| Quoi | Comment |
|---|---|
| `computeAuthResponse(pin, nonce)` 16 o | Vecteur précalculé **partagé avec le firmware** : `SHA-256("1234"‖nonce[0x01..0x10])[:16]` = `bc b0 85 18 d2 96 7e 37 5f 57 3d 7e 3a 64 49 74`. |
| `frameCodec` Auth kinds | Étendre les tests existants : encode/decode des 4 trames Auth. |
| `BleRuntime.authenticate(pin)` | Via `FixtureBleDevice` : injecter AuthChallenge → vérifier le hash écrit dans AuthResponse → injecter AuthResult OK (résout) / FAIL (rejet `AuthError`). |
| Séquence connect→auth→manifest | Étendre `__tests__/manifest/BleRuntime.test.ts` (qui fait déjà connect→manifest) en insérant l'auth en tête. |
| `ConnectionController` | Transitions d'états, annulation, épuisement des tentatives de reconnexion, ré-auth après reconnexion. |
| Timeout d'auth | Jest fake timers. |

Le test sur device réel (vrai ESP32 + app) reste manuel et dépend aussi de la validation device
du sous-projet 1.

## Découpage d'implémentation

1. **Firmware** : `sendManifest()` après `AuthResult OK` dans `handleAuthResponse` (+ test natif :
   après un handshake réussi, un `ManifestChunk` est émis).
2. **`frameCodec`** : ajouter les 4 Auth `FrameKind` + tests.
3. **Module auth mobile** : `auth.ts` `computeAuthResponse` 16 o + test (vecteur partagé).
4. **`BleRuntime.authenticate()`** + trames Auth dans `dispatchFrame` + timeout + tests fixture.
5. **`ConnectionController`** (machine à états : connect/auth/load/subscribe/reconnect) + tests.
6. **Orchestration UI** : câbler `PilotRenderer`/`useDeviceUi` sur le contrôleur ; **redéfinir** le
   flag `manifestRuntimeFlag` en `'device' | 'fixture'` (corriger le bug de `setManifestRuntime`),
   `PilotRenderer` construit `BleRuntime` (device) ou `FixtureRuntime` (debug) selon le flag. Si un
   toggle debug n'existe pas encore dans l'UI, en ajouter un minimal (dev-only) pour basculer.
7. **Suppression legacy** : retirer les modules listés + leurs tests ; vérifier zéro référence
   résiduelle.
8. **Vérif finale** : `jest` vert, `tsc` (typecheck) propre, lint ; revue des références mortes.

## Contrat consommé (figé par le sous-projet 1)

- Trame : `[kind:1][flags:1][length:2 BE][body:length]`.
- Auth : `AuthRequest 0x40` (vide) → `AuthChallenge 0x41` (nonce 16 o) →
  `AuthResponse 0x42` (hash 16 o) → `AuthResult 0x43` (corps[0] 0x01/0x00).
- `hash = SHA-256(pin‖nonce)[:16]`.
- Manifeste envoyé automatiquement par le firmware après `AuthResult OK` (correctif de ce
  sous-projet), en trames `ManifestChunk 0x01` / `ManifestEof 0x02`.
- Une seule session à la fois côté firmware ; une 2ᵉ connexion est refusée (déconnexion).

## Hors périmètre (YAGNI)

- Le client SPP de la tablette (sous-projet 3).
- Tout changement à la découverte/scan BLE (UUID de service inchangé).
- Persistance du flag de runtime en stockage durable (il reste en mémoire ; le mode `'device'`
  est le défaut au démarrage, comme aujourd'hui).
- Re-fetch du manifeste à la demande (le manifeste arrive après auth ; pas de ManifestRequest).
