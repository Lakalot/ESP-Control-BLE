import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ManifestScreenRenderer } from '@/manifest/render/ManifestScreenRenderer';
import { FixtureRuntime } from '@/manifest/runtime/FixtureRuntime';
import type { ManifestRuntime } from '@/manifest/runtime/ManifestRuntime';
import '@/manifest/render/widgets';

const FIXTURE = resolve(__dirname, '..', '..', 'assets', 'manifest_demo.pb');

describe('ManifestScreenRenderer', () => {
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
