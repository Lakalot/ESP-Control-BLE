import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ManifestScreenRenderer } from '@/manifest/render/ManifestScreenRenderer';
import { FixtureRuntime } from '@/manifest/runtime/FixtureRuntime';
import type { ManifestRuntime } from '@/manifest/runtime/ManifestRuntime';
import * as pb from '@/manifest/generated/manifest.pbjs';
import '@/manifest/render/widgets';

const FIXTURE = resolve(__dirname, '..', '..', 'assets', 'manifest_demo.pb');
const V = pb.esp_control;

function buildManifestBytes(): Uint8Array {
  const strings = [
    '',
    'widget.text',
    'home',
    'Home',
    'settings',
    'Settings',
    'home.root',
    'settings.root',
    'home.panel',
    'settings.panel',
    'Home Panel',
    'Settings Panel',
  ];

  return V.ManifestBundle.encode({
    version: 5,
    schemaVersion: 1,
    minAppVersion: '1.0.0',
    capabilities: { featureIdxs: [1] },
    strings: strings.map((value) => ({ value })),
    resources: [],
    actions: [],
    screens: [
      { id: 1, slugIdx: 2, titleIdx: 3, rootNodeId: 101 },
      { id: 2, slugIdx: 4, titleIdx: 5, rootNodeId: 102 },
    ],
    nodes: [
      { id: 101, slugIdx: 6, kind: V.NodeKind.NODE_KIND_STACK, childrenIds: [201] },
      { id: 102, slugIdx: 7, kind: V.NodeKind.NODE_KIND_STACK, childrenIds: [202] },
      {
        id: 201,
        slugIdx: 8,
        kind: V.NodeKind.NODE_KIND_WIDGET,
        widgetKind: V.WidgetKind.WIDGET_KIND_TEXT,
        titleIdx: 10,
      },
      {
        id: 202,
        slugIdx: 9,
        kind: V.NodeKind.NODE_KIND_WIDGET,
        widgetKind: V.WidgetKind.WIDGET_KIND_TEXT,
        titleIdx: 11,
      },
    ],
    appShell: {
      navBar: {
        items: [
          { idIdx: 2, labelIdx: 3, iconIdx: 2, screenId: 1 },
          { idIdx: 4, labelIdx: 5, iconIdx: 4, screenId: 2 },
        ],
      },
    },
  }).finish();
}

describe('ManifestScreenRenderer', () => {
  it('renders a fixed bottom nav and switches screens on tap', async () => {
    const runtime = new FixtureRuntime({
      manifestBytes: buildManifestBytes(),
    });

    const { findByTestId, findByText, queryByText } = render(
      <ManifestScreenRenderer runtime={runtime} screenSlug="settings" />,
    );

    await expect(findByTestId('bottom-nav')).resolves.toBeTruthy();
    await expect(findByText('Home Panel')).resolves.toBeTruthy();
    expect(queryByText('Settings Panel')).toBeNull();

    fireEvent.press(await findByText('Settings'));
    await expect(findByText('Settings Panel')).resolves.toBeTruthy();
  });

  it('renders the first available screen inside the premium V5 shell', async () => {
    const runtime = new FixtureRuntime({
      manifestBytes: new Uint8Array(readFileSync(FIXTURE)),
      initialState: { 'relay.auto': { kind: 'bool', value: true } },
    });
    const { findByTestId, findByText, queryByText } = render(
      <ManifestScreenRenderer runtime={runtime} screenSlug="controls" />,
    );

    await waitFor(() => expect(queryByText('Unknown screen: controls')).toBeNull());
    await expect(findByTestId('screen-shell')).resolves.toBeTruthy();
    await expect(findByText('Manifest V5 demo')).resolves.toBeTruthy();
    expect(queryByText('Settings')).toBeNull();
  });

  it('renders the premium shell around manifest loading errors', async () => {
    const runtime: ManifestRuntime = {
      loadManifest: async () => {
        throw new Error('boom');
      },
      snapshot: async () => new Map(),
      subscribe: () => () => {},
      invokeAction: async () => ({ status: 'ok', payload: new Uint8Array(), message: '' }),
    };

    const { findByTestId, findByText } = render(
      <ManifestScreenRenderer runtime={runtime} screenSlug="home" />,
    );

    await expect(findByTestId('screen-shell')).resolves.toBeTruthy();
    await expect(findByTestId('error-panel')).resolves.toBeTruthy();
    await expect(findByText(/boom/)).resolves.toBeTruthy();
  });
});
