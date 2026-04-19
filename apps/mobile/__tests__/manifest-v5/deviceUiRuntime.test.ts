import { renderHook, act } from '@testing-library/react-native';
import { useDeviceUi } from '@/manifest-v5/runtime/useDeviceUi';

function createRuntimeFixture() {
  return {
    snapshotCalls: 0,
    subscriptions: [] as string[],
    async loadManifest() {
      return {
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: new Set(['widget.timer']),
        resources: new Map([
          ['relay.auto', { runtimeId: 1, slug: 'relay.auto', readMode: 'subscribe' }],
          ['timer.remaining', { runtimeId: 2, slug: 'timer.remaining', readMode: 'subscribe' }],
        ]),
        actions: new Map(),
        screens: new Map(),
        nodes: new Map(),
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
  const runtime = createRuntimeFixture();
  const { result } = renderHook(() => useDeviceUi(runtime));
  await act(async () => {
    await runtime.flush();
  });
  expect(runtime.snapshotCalls).toBe(1);
  expect(runtime.subscriptions).toEqual(['relay.auto', 'timer.remaining']);
  expect(result.current.snapshot.get('relay.auto')?.value).toEqual({ kind: 'bool', value: true });
});
