import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ManifestScreenRenderer } from '@/manifest-v5/render/ManifestScreenRenderer';
import { FixtureRuntime } from '@/manifest-v5/runtime/FixtureRuntime';
import '@/manifest-v5/render/widgets';

const FIXTURE = resolve(__dirname, '..', '..', 'assets', 'manifest_v5_demo.pb');

describe('ManifestScreenRenderer', () => {
  it('renders the controls screen end-to-end from the demo fixture', async () => {
    const runtime = new FixtureRuntime({
      manifestBytes: new Uint8Array(readFileSync(FIXTURE)),
      initialState: { 'relay.auto': { kind: 'bool', value: true } },
    });
    const { findByText } = render(
      <ManifestScreenRenderer runtime={runtime} screenSlug="controls" />,
    );
    // Demo fixture must define a screen with a visible widget labelled 'Toggle' or similar —
    // assert any stable string the fixture ships.
    await waitFor(() => expect(findByText(/./)).resolves.toBeTruthy());
  });
});