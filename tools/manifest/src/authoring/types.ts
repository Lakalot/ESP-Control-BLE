import type { Static } from '@sinclair/typebox';
import {
  AuthoringContentSpec,
  AuthoringManifestSpec,
  AuthoringViewSpec,
} from './schema.js';

export type AuthoringManifest = Static<typeof AuthoringManifestSpec>;
export type AuthoringView = Static<typeof AuthoringViewSpec>;
export type AuthoringContent = Static<typeof AuthoringContentSpec>;
export type AuthoringAppShell = NonNullable<AuthoringManifest['appShell']>;
export type AuthoringNavBarItem = AuthoringAppShell['navBar'] extends { items: infer T }
  ? T extends readonly (infer U)[]
    ? U
    : never
  : never;
export type AuthoringContainer = Extract<AuthoringContent, { kind: 'section' | 'stack' | 'row' | 'grid' }>;
export type AuthoringSection = Extract<AuthoringContent, { kind: 'section' }>;
export type AuthoringWidget = Exclude<AuthoringContent, AuthoringContainer>;
export type AuthoringToggle = Extract<AuthoringContent, { kind: 'toggle' }>;
