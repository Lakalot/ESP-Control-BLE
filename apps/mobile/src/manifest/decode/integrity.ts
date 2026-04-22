import type { RuntimeManifest } from '../model/runtime.types';

export class ManifestDecodeError extends Error {
  constructor(message: string) {
    super(`ManifestDecodeError: ${message}`);
    this.name = 'ManifestDecodeError';
  }
}

export const SUPPORTED_CAPABILITIES = new Set([
  'widget.text',
  'widget.stat',
  'widget.toggle',
  'widget.button',
  'widget.slider',
  'widget.select',
  'widget.text_input',
  'widget.badge',
  'widget.progress',
  'widget.timer',
]);

export function isCompatibleAppVersion(version: string): boolean {
  if (version === '0.0.0') return true;
  return version >= '1.0.0';
}

export function requiresCapability(widgetKind: string): boolean {
  return true;
}

/**
 * Post-decode invariants. These mirror the compiler's resolveRefs pass but
 * run on the decoded RuntimeManifest so broken artifacts fail fast on load
 * instead of producing half-rendered screens.
 */
export function assertManifestIntegrity(m: RuntimeManifest): void {
  if (m.version !== 5) {
    throw new ManifestDecodeError(`expected version 5, got ${String(m.version)}`);
  }
  if (m.schemaVersion !== 1) {
    throw new ManifestDecodeError(`unsupported schemaVersion ${m.schemaVersion}`);
  }
  if (m.screens.size === 0) {
    throw new ManifestDecodeError('no screens declared');
  }
  if (m.appShell?.navBar) {
    if (m.appShell.navBar.items.length < 1 || m.appShell.navBar.items.length > 5) {
      throw new ManifestDecodeError('navBar must declare between 1 and 5 items');
    }
    for (const item of m.appShell.navBar.items) {
      if (!m.screens.has(item.screenSlug)) {
        throw new ManifestDecodeError(
          `nav item '${item.id}' references missing screen '${item.screenSlug}'`,
        );
      }
    }
  }
  for (const screen of m.screens.values()) {
    if (!m.nodes.has(screen.rootNodeSlug)) {
      throw new ManifestDecodeError(
        `screen '${screen.slug}' rootNodeSlug='${screen.rootNodeSlug}' is not in nodes`,
      );
    }
  }
  for (const node of m.nodes.values()) {
    if (node.kind !== 'widget') {
      for (const child of node.childrenSlugs) {
        if (!m.nodes.has(child)) {
          throw new ManifestDecodeError(`node '${node.slug}' references missing child '${child}'`);
        }
      }
      continue;
    }
    const bind = node.bind;
    if (!bind) continue;
    if (bind.resource && !m.resources.has(bind.resource)) {
      throw new ManifestDecodeError(`node '${node.slug}' binds missing resource '${bind.resource}'`);
    }
    if (bind.action && !m.actions.has(bind.action)) {
      throw new ManifestDecodeError(`node '${node.slug}' binds missing action '${bind.action}'`);
    }
    if (bind.form && !m.forms.has(bind.form)) {
      throw new ManifestDecodeError(`node '${node.slug}' binds missing form '${bind.form}'`);
    }
  }
}
