# Design: V5 Contract-First Platform

**Date:** 2026-04-19  
**Status:** Approved for planning  
**Approach:** Contract-first with V5 cutover

---

## 1. Objective

Transform `ESP-Control-BLE` into a declarative control platform where:

- each ESP project ships a compiled manifest
- the mobile app is not recompiled per project
- the mobile app downloads the manifest dynamically
- the mobile app renders screens and widgets from that manifest
- the firmware exposes resources and actions through a stable BLE runtime

In one sentence:

The product becomes a V5 manifest renderer platform, not a project-specific compiled UI.

---

## 2. Decisions Locked In

The following decisions are now fixed:

- `V5` is the only product target going forward
- the transition model is `cutover`, not long-term `v4/v5` coexistence
- the platform is built `contract-first`
- the authoring source of truth is `TypeScript`, not handwritten protobuf and not mobile-side fixtures
- runtime numeric IDs are generated deterministically at build time from authoring slugs
- the first V5 livrable includes the full MVP widget set:
  - `text`
  - `stat`
  - `toggle`
  - `button`
  - `slider`
  - `select`
  - `text_input`
  - `badge`
  - `progress`
  - `timer`
- the runtime BLE contract is restricted to:
  - `manifest`
  - `snapshot`
  - `delta`
  - `invokeAction`
  - `invokeResult`
  - `subscribe`
  - `unsubscribe`
- action payloads on the wire use a common protobuf envelope
- firmware is allowed to map that common envelope into internal typed protobuf handlers
- mobile compatibility policy is strict refusal on unsupported version, capabilities, or widget kinds
- the runtime widget catalog is closed, but the platform must make new widget addition cheap and standardized

---

## 3. Problem Statement

The current repository already contains a serious V5 base:

- a manifest V5 schema and compiler toolchain
- protobuf and nanopb artifacts
- firmware-side V5 frame transport pieces
- a mobile-side V5 decoder and generic renderer base

But it is not yet a product-grade declarative platform because several temporary assumptions remain:

- the mobile runtime still depends on fixtures as a normal source
- the mobile BLE runtime is incomplete
- action IDs still have fallback assumptions in places
- the app route still mixes generic rendering with pilot wiring
- the mobile app still has knowledge paths that assume a known manifest
- transport, contract, and rendering are not yet cleanly separated end-to-end

The purpose of this design is to remove those temporary assumptions and freeze the durable V5 architecture.

---

## 4. Platform Shape

The platform is split into 3 layers and 3 delivery tracks.

### 4.1 Layer A: Contract Platform

Responsibility:

- define the authoring schema
- validate manifests
- normalize and compile manifests
- assign deterministic numeric IDs
- freeze the widget vocabulary
- freeze runtime capabilities and compatibility rules
- emit firmware-ready artifacts

This layer is the source of truth.

It must not depend on mobile implementation details or firmware implementation details.

### 4.2 Layer B: Firmware Runtime V5

Responsibility:

- embed the compiled manifest
- expose the stable BLE runtime
- serve manifest transfer
- encode snapshots and deltas
- track subscriptions
- correlate action invocations and results
- map the common wire envelope into firmware-local typed handlers

This layer knows resources, actions, IDs, and payload envelopes.

It must not know UI structure beyond what is required to serve the manifest bytes.

### 4.3 Layer C: Mobile Renderer V5

Responsibility:

- connect over BLE
- download and validate the manifest
- decode it into runtime model objects
- render screens and widgets generically
- maintain snapshot cache and live deltas
- send action invocations and resolve results
- handle compatibility failures, reconnects, and runtime errors

This layer knows screens, nodes, widgets, bindings, and runtime state.

It must not contain project-specific manifests or project-specific UI code paths.

### 4.4 Dependency Rule

- Layer A has no dependency on B or C
- Layer B depends on A
- Layer C depends on A
- Layer C does not depend on B internals, only on the frozen runtime contract

---

## 5. Authoring and Build Model

### 5.1 Authoring Source

Each ESP project writes its UI and interaction model in TypeScript.

The authoring manifest describes:

- screens
- nodes
- widget kinds
- labels and static text
- resource bindings
- action bindings
- simple display constraints
- compatibility metadata

The manifest does not contain arbitrary code and does not define custom executable logic.

### 5.2 Build Pipeline

The standard pipeline is:

```text
TypeScript manifest source
  -> schema validation
  -> normalization
  -> deterministic ID assignment
  -> protobuf manifest compilation
  -> firmware embedding
```

Required outputs:

- normalized human-readable artifact for inspection
- compiled protobuf manifest artifact
- generated firmware embedding artifact
- debug inspection metadata such as counts and size budgets

### 5.3 Runtime IDs

Runtime behavior is keyed primarily by:

- `resource_id`
- `action_id`
- `screen_id`
- `node_id`

Slugs exist for:

- authoring
- debugging
- inspection
- UX labeling

Runtime systems must not depend on slugs as their primary wire keys.

### 5.4 Deterministic ID Assignment

The compiler generates numeric IDs at build time from the manifest source.

This generation must be:

- deterministic
- stable for unchanged source
- validated against collisions
- visible in build artifacts for debug

There is no manual per-project runtime ID allocation in the normal workflow.

---

## 6. Runtime BLE Contract V5

### 6.1 Frozen Message Surface

The durable runtime surface is limited to 7 message types:

- `manifest`
- `snapshot`
- `delta`
- `invokeAction`
- `invokeResult`
- `subscribe`
- `unsubscribe`

This is the long-lived language spoken between mobile and firmware.

### 6.2 Message Semantics

- `manifest`
  - transfers the compiled manifest from firmware to mobile
  - supports chunking and end-of-transfer validation

- `snapshot`
  - returns the current state of readable resources
  - is used for initial materialization of UI state

- `delta`
  - carries updates for changed resources
  - is used to keep the mobile cache live

- `invokeAction`
  - requests an action by `action_id`
  - carries a common protobuf payload envelope
  - includes correlation data

- `invokeResult`
  - returns success or failure for one invocation
  - uses the same correlation identity
  - may carry a result payload envelope or an error message

- `subscribe`
  - asks firmware to start pushing updates for a bounded set of `resource_id`

- `unsubscribe`
  - removes one or more active subscriptions

### 6.3 Transport Rules

The transport must support:

- framing
- fragmentation and reassembly
- correlation IDs for action lifecycle
- integrity checking on manifest transfer
- bounded payload sizes
- bounded timeout behavior

The contract is stable even if framing internals evolve.

### 6.4 No Extra Runtime Verbs

The platform does not add project-specific verbs such as:

- ad hoc RPC names
- raw script execution
- custom screen transitions sent over BLE
- project-local widget protocols

Any new general capability must evolve the V5 contract, not bypass it.

---

## 7. Compatibility and Refusal Policy

Every manifest must include:

- `schema_version`
- `min_app_version`
- `capabilities`

The mobile app must refuse the manifest before rendering if:

- `schema_version` is unsupported
- `min_app_version` is greater than the running app version
- the manifest requires a capability the app does not support
- the manifest references an unknown widget kind
- the manifest fails integrity or decode checks

This is a strict policy.

No partial render fallback is allowed for incompatible manifests.

This keeps failures explicit and protects the platform from undefined behavior.

---

## 8. Manifest UI Model

### 8.1 Allowed Content

The manifest is a declarative UI description.

It may define:

- screens
- nodes
- widget kinds
- labels
- text content
- bindings to resources
- bindings to actions
- visibility or enablement rules
- simple layout constraints

It may not define:

- arbitrary scripts
- project-specific code execution
- embedded React components
- dynamic widget implementations shipped by projects

### 8.2 Widget Catalog for the First V5 Livrable

The initial supported runtime catalog is:

- `text`
- `stat`
- `toggle`
- `button`
- `slider`
- `select`
- `text_input`
- `badge`
- `progress`
- `timer`

These widgets are fixed for the first V5 livrable.

### 8.3 Closed Runtime Catalog

At runtime, the mobile app only renders widget kinds it knows.

Therefore:

- projects cannot invent arbitrary widget kinds
- a new widget requires platform work and a new app version
- the app refuses manifests containing unknown widget kinds

This is intentional and part of the product model.

---

## 9. Standard Widget Extension Path

Although the runtime catalog is closed, adding a new widget must be operationally simple for the platform team.

Every future widget follows one standard path:

1. add the widget type to the authoring schema
2. add the widget value to the runtime contract or enum surface
3. add compiler support and normalization rules
4. add mobile decode mapping
5. add one renderer implementation in the widget registry
6. add validation and rendering tests
7. gate it behind a declared capability

Consequences:

- runtime stays closed and predictable
- extension is standardized
- no project hacks are needed to add a new widget class

---

## 10. Action Payload Strategy

### 10.1 Chosen Model

Wire-level action payloads use one common protobuf envelope.

The firmware is then free to map that common envelope into internal typed protobuf handlers.

This gives the platform the right balance:

- the mobile app remains generic and does not need project-specific regeneration
- the firmware remains efficient and can still use typed internal handling
- the wire contract stays stable and compact

### 10.2 Envelope Expressivity

The common envelope supports structured objects from day one.

This is required because the first V5 livrable already includes:

- `text_input`
- `timer`
- richer action payloads than single scalars

### 10.3 Embedded Constraints

To keep ESP cost bounded, the common envelope must have explicit limits such as:

- maximum object depth
- maximum field count
- maximum array length
- maximum string size
- maximum encoded payload size

Those limits belong to the contract and to CI validation.

---

## 11. Firmware Runtime V5 Design

### 11.1 Manifest Serving

The firmware stores the compiled manifest artifact and serves it as the normal mobile source.

The normal path is:

- mobile connects
- mobile requests or receives manifest transfer
- firmware streams manifest chunks
- firmware ends with a transfer completion marker and integrity data

The mobile app must not rely on a bundled fixture as the normal source in production.

### 11.2 Resource Runtime

Firmware maintains a resource table keyed by `resource_id`.

It must support:

- current value storage
- snapshot encoding
- delta emission for changed subscribed resources
- generation or freshness tracking as needed by the runtime

### 11.3 Subscription Runtime

Firmware maintains subscription state keyed by `resource_id`.

It must support:

- add and remove subscriptions
- delta emission only for watched resources
- cleanup on disconnect

### 11.4 Action Runtime

Firmware action handling must support:

- decode common envelope
- validate payload bounds
- map request to typed internal handler
- return correlated `invokeResult`
- timeout or error reporting when appropriate

### 11.5 Production Responsibilities

The production firmware runtime includes:

- real BLE connection behavior
- frame dispatch
- manifest serving
- snapshot encoding
- delta encoding
- subscription tracking
- action invocation and correlation
- error and timeout behavior

---

## 12. Mobile Renderer V5 Design

### 12.1 Mobile App Role

The mobile app is a generic renderer and runtime client.

It must:

- connect to BLE
- receive the manifest dynamically
- validate compatibility
- decode the manifest into runtime model objects
- render screens from manifest data only
- hydrate values from `snapshot`
- apply live updates from `delta`
- invoke actions generically through `invokeAction`

It must not:

- compile project manifests into the app as a normal source
- depend on per-project generated UI code
- assume fallback IDs
- assume a known manifest ahead of time

### 12.2 Required Runtime Components

The production mobile runtime must own:

- BLE connection lifecycle
- frame reassembly
- manifest download and integrity check
- decoded manifest cache
- snapshot cache
- subscription orchestration
- invoke correlation tracking
- timeout handling
- reconnect behavior
- compatibility error handling

### 12.3 Renderer Model

The renderer is manifest-driven.

Its responsibilities are:

- resolve `screen_id` to the screen root
- walk the node tree
- dispatch widget rendering from a closed widget registry
- resolve resource bindings
- resolve action bindings
- apply simple visibility and enablement rules

The renderer does not contain project-specific screen logic.

---

## 13. Rules and Logic Boundaries

The manifest may include simple declarative conditions for rendering behavior.

Allowed examples:

- visibility
- enabled or disabled state
- simple display conditions

Not allowed:

- arbitrary executable scripts
- project-provided custom logic engines
- remote code

The platform goal is dynamic UI and reliable runtime behavior, not a general no-code app engine.

---

## 14. Cutover Rules

Since the chosen migration model is `cutover`, V5 becomes the only target product path.

That means:

- new platform work targets V5 only
- temporary V5 fixtures are transitional, not architectural
- project shipping cannot depend on V4 as the target solution
- remaining V4 paths are migration leftovers to be removed, not expanded

Specific temporary assumptions to remove:

- fixture-first manifest loading on mobile
- fallback numeric IDs in runtime code
- mobile routes that assume a known pilot manifest
- project-coupled wiring in the V5 renderer path

---

## 15. Decomposition Into Delivery Tracks

This design covers the whole V5 platform, but implementation must remain decomposed.

The execution should therefore be split into 3 linked plans:

### Track A: Contract Platform

- freeze schema vocabulary
- freeze compatibility fields
- freeze widget catalog
- freeze common envelope constraints
- freeze compiler outputs and ID generation

### Track B: Firmware Runtime V5

- complete production manifest transfer
- complete snapshot and delta runtime
- complete subscribe and unsubscribe behavior
- complete invokeAction and invokeResult correlation
- remove provisional runtime assumptions

### Track C: Mobile Renderer V5

- complete production BLE runtime
- make manifest download the normal source
- remove fallback IDs and fixture assumptions
- finish generic renderer wiring
- enforce strict compatibility refusal

This decomposition is mandatory for execution clarity even though the design is unified.

---

## 16. Acceptance Criteria For The First V5 Livrable

The first V5 platform delivery is complete only when all of the following are true:

- the mobile app receives the manifest dynamically from firmware over BLE
- the mobile app does not require recompilation for each ESP project
- the mobile UI is rendered from the manifest only
- the first widget catalog is fully supported:
  - `text`
  - `stat`
  - `toggle`
  - `button`
  - `slider`
  - `select`
  - `text_input`
  - `badge`
  - `progress`
  - `timer`
- the runtime contract works end-to-end for:
  - `manifest`
  - `snapshot`
  - `delta`
  - `invokeAction`
  - `invokeResult`
  - `subscribe`
  - `unsubscribe`
- the mobile runtime uses correlation IDs, timeouts, cache updates, and reconnect handling
- unsupported version, capability, or widget manifests are refused before rendering
- firmware uses the common wire envelope and may map into internal typed protobuf handlers
- adding a new platform widget follows the standard extension path and does not require project-specific hacks

---

## 17. Explicit Non-Goals

This platform does not aim to be:

- a fully free UI system
- a scriptable no-code app engine
- a runtime for arbitrary project plugins
- a partial compatibility renderer for unknown widgets

The intended compromise is:

- dynamic UI
- stable protocol
- limited component set
- reliable rendering

---

## 18. Next Planning Step

The design is intentionally broad but execution must stay split.

The next planning phase should therefore produce separate implementation plans for:

- Track A: Contract Platform
- Track B: Firmware Runtime V5
- Track C: Mobile Renderer V5

Those plans should share this document as the architectural source of truth.
