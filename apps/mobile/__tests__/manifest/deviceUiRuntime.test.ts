import { renderHook, act } from '@testing-library/react-native';
import { useDeviceUi } from '@/manifest/runtime/useDeviceUi';
import type { ManifestRuntime } from '@/manifest/runtime/ManifestRuntime';

function createRuntimeFixture() {
  return {
    snapshotCalls: 0,
    subscriptions: [] as string[],
    async loadManifest() {
      return {
        version: 5 as const,
        schemaVersion: 1 as const,
        minAppVersion: '1.0.0',
        capabilities: new Set(['widget.timer']),
        resources: new Map([
          ['relay.auto', { runtimeId: 1, slug: 'relay.auto', readMode: 'subscribe' }],
          ['timer.remaining', { runtimeId: 2, slug: 'timer.remaining', readMode: 'subscribe' }],
        ]),
        actions: new Map(),
        screens: new Map(),
        nodes: new Map(),
        forms: new Map(),
        themeTokens: new Map(),
      };
    },
    async snapshot() {
      this.snapshotCalls += 1;
      return new Map([
        ['relay.auto', { slug: 'relay.auto', value: { kind: 'bool', value: true }, updatedAt: 0, stale: false }],
      ]);
    },
    subscribe(slugs: readonly string[]) {
      this.subscriptions = [...slugs];
      return () => {};
    },
    async invokeAction() {
      return { status: 'ok' as const };
    },
    async flush() {
      await Promise.resolve();
      await Promise.resolve();
    },
  };
}

it('loads manifest, requests snapshot, and subscribes only to subscribe-mode resources', async () => {
  const runtime = createRuntimeFixture() as unknown as ManifestRuntime & { snapshotCalls: number; subscriptions: string[]; flush(): Promise<void> };
  const { result } = renderHook(() => useDeviceUi(runtime));
  await act(async () => {
    await runtime.flush();
  });
  expect(runtime.snapshotCalls).toBe(1);
  expect(runtime.subscriptions).toEqual(['relay.auto', 'timer.remaining']);
  expect(result.current.snapshot.get('relay.auto')?.value).toEqual({ kind: 'bool', value: true });
});
