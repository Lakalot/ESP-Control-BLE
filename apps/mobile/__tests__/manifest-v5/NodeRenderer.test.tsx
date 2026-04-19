import React from 'react';
import { render } from '@testing-library/react-native';
import { NodeRenderer } from '@/manifest-v5/render/NodeRenderer';
import type { RuntimeManifest } from '@/manifest-v5/model/runtime.types';
import '@/manifest-v5/render/widgets';

function tinyManifest(): RuntimeManifest {
  return {
    version: 5,
    capabilities: new Set(),
    resources: new Map(),
    actions: new Map(),
    forms: new Map(),
    themeTokens: new Map(),
    screens: new Map(),
    nodes: new Map<string, any>([
      ['root', { kind: 'stack', slug: 'root', label: undefined, tone: undefined, visibleIf: undefined, enabledIf: undefined, childrenSlugs: ['label'], columns: undefined }],
      ['label', { kind: 'widget', slug: 'label', widget: 'text', label: 'Hello', tone: undefined, visibleIf: undefined, enabledIf: undefined, bind: undefined, formatHint: undefined }],
    ]),
  } as RuntimeManifest;
}

describe('NodeRenderer', () => {
  it('renders container children', () => {
    const m = tinyManifest();
    const { getByText } = render(
      <NodeRenderer
        manifest={m}
        slug="root"
        snapshot={new Map()}
        ctx={{}}
        onInvoke={() => {}}
        pendingActions={new Set()}
      />,
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('hides nodes whose visibleIf is false', () => {
    const m = tinyManifest();
    (m.nodes as Map<string, any>).set('label', {
      ...(m.nodes.get('label') as any),
      visibleIf: { '==': [1, 2] },
    });
    const { queryByText } = render(
      <NodeRenderer
        manifest={m}
        slug="root"
        snapshot={new Map()}
        ctx={{}}
        onInvoke={() => {}}
        pendingActions={new Set()}
      />,
    );
    expect(queryByText('Hello')).toBeNull();
  });
});