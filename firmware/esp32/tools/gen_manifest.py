#!/usr/bin/env python3
"""
gen_manifest.py — Pre-build hook PlatformIO
Lit src/manifest.json, valide, sérialise en protocole binaire v4,
génère src/manifest_data.h avec les bytes en PROGMEM.

Usage standalone : python tools/gen_manifest.py [--dry-run]
"""

import json
import os
import sys
import struct
from datetime import datetime

# ── Mappings protocole ──────────────────────────────────────────────────────

CMD_TYPES = {
    'action': 0x01, 'range': 0x02, 'toggle': 0x03, 'read_only': 0x04,
    'text_input': 0x05, 'color_picker': 0x06, 'xy_pad': 0x07,
    'multi_select': 0x08, 'progress': 0x09,
}

CMD_OPTS = {
    'unit': 0x01, 'icon': 0x02, 'color': 0x03, 'confirm': 0x04,
    'refreshMs': 0x05, 'step': 0x06, 'format': 0x07, 'scale': 0x08,
    'minLabel': 0x09, 'maxLabel': 0x0A, 'dangerous': 0x0B, 'disabled': 0x0C,
    'badge': 0x0D, 'choices': 0x0E, 'hint': 0x0F,
}
CMD_U16_OPTS  = {0x05, 0x06, 0x08}
CMD_FLAG_OPTS = {0x0B, 0x0C}

NODE_KINDS = {
    'section': 0x01, 'stack': 0x02, 'row': 0x03, 'grid': 0x04,
    'command': 0x05, 'text': 0x06, 'divider': 0x07,
}
NODE_OPTS = {
    'title': 0x20, 'subtitle': 0x21, 'columns': 0x22, 'span': 0x23,
    'variant': 0x24, 'style': 0x25, 'collapsed': 0x26, 'gap': 0x27, 'text': 0x28,
}
NODE_U8_OPTS   = {0x22, 0x23, 0x24, 0x25, 0x27}
NODE_FLAG_OPTS = {0x26}
NODE_STYLES    = {'default': 0x00, 'surface': 0x01, 'inset': 0x02, 'toolbar': 0x03}
NODE_VARIANTS  = {'default': 0x00, 'card': 0x01, 'compact': 0x02, 'hero': 0x03, 'inline': 0x04}

ECB_MANIFEST_VERSION_4 = 0x04
MAX_COMMANDS = 32
MAX_NODES    = 64


# ── Validation ──────────────────────────────────────────────────────────────

def validate(manifest):
    errors = []

    commands = manifest.get('commands', [])
    nodes    = manifest.get('nodes', [])

    if len(commands) > MAX_COMMANDS:
        errors.append(f"Too many commands: {len(commands)} > {MAX_COMMANDS}")
    if len(nodes) > MAX_NODES:
        errors.append(f"Too many nodes: {len(nodes)} > {MAX_NODES}")

    cmd_ids = set()
    for cmd in commands:
        try:
            cid = int(cmd['id'], 16) if isinstance(cmd['id'], str) else int(cmd['id'])
        except (ValueError, TypeError):
            errors.append(f"Invalid command id '{cmd['id']}' (expected hex string like '0x01')")
            continue
        if cid in cmd_ids:
            errors.append(f"Duplicate command id: {cmd['id']}")
        cmd_ids.add(cid)
        if cmd['type'] not in CMD_TYPES:
            errors.append(f"Unknown command type '{cmd['type']}' for id {cmd['id']}")
        if cmd['type'] == 'range':
            if 'range' not in cmd:
                errors.append(f"Command {cmd['id']} type=range missing 'range' key")

    node_ids = set()
    for node in nodes:
        nid = node['id']
        if nid in node_ids:
            errors.append(f"Duplicate node id: {nid}")
        node_ids.add(nid)
        if node['kind'] not in NODE_KINDS:
            errors.append(f"Unknown node kind '{node['kind']}' for node {nid}")
        parent = node.get('parent')
        if parent is not None and parent not in node_ids:
            errors.append(f"Node {nid} references unknown parent {parent} (must be declared before)")
        opts = node.get('options', {})
        if 'variant' in opts and opts['variant'] not in NODE_VARIANTS:
            errors.append(f"Node {nid} has unknown variant '{opts['variant']}' (valid: {list(NODE_VARIANTS)})")
        if 'style' in opts and opts['style'] not in NODE_STYLES:
            errors.append(f"Node {nid} has unknown style '{opts['style']}' (valid: {list(NODE_STYLES)})")
        if node['kind'] == 'command':
            ref = node.get('ref')
            if ref is None:
                errors.append(f"Command node {nid} missing 'ref'")
            else:
                try:
                    ref_id = int(ref, 16) if isinstance(ref, str) else int(ref)
                except (ValueError, TypeError):
                    errors.append(f"Command node {nid} has invalid ref '{ref}'")
                    ref_id = -1
                if ref_id not in cmd_ids:
                    errors.append(f"Command node {nid} ref={ref} not found in commands")

    if errors:
        print("manifest.json validation errors:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        sys.exit(1)


# ── Sérialisation ───────────────────────────────────────────────────────────

def serialize_cmd_options(options):
    buf = bytearray()
    for key in options:
        if key not in CMD_OPTS:
            continue
        opt_type = CMD_OPTS[key]
        value    = options[key]
        if opt_type in CMD_FLAG_OPTS:
            if value:
                buf += bytes([opt_type, 0x00])
        elif opt_type in CMD_U16_OPTS:
            v = int(value)
            buf += bytes([opt_type, 0x02, (v >> 8) & 0xFF, v & 0xFF])
        else:
            encoded = str(value).encode('utf-8')[:255]
            buf += bytes([opt_type, len(encoded)]) + encoded
    return buf

def count_cmd_options(options):
    count = 0
    for key in options:
        if key not in CMD_OPTS:
            continue
        opt_type = CMD_OPTS[key]
        value    = options[key]
        if opt_type in CMD_FLAG_OPTS:
            if value:
                count += 1
        else:
            count += 1
    return count

def serialize_node_options(options):
    buf = bytearray()
    for key, value in options.items():
        if key not in NODE_OPTS:
            continue
        opt_type = NODE_OPTS[key]
        if opt_type in NODE_FLAG_OPTS:
            if value:
                buf += bytes([opt_type, 0x00])
        elif opt_type in NODE_U8_OPTS:
            if key == 'variant':
                v = NODE_VARIANTS.get(str(value), int(value) if isinstance(value, int) else 0)
            elif key == 'style':
                v = NODE_STYLES.get(str(value), int(value) if isinstance(value, int) else 0)
            else:
                v = int(value)
            buf += bytes([opt_type, 0x01, v & 0xFF])
        else:
            encoded = str(value).encode('utf-8')[:255]
            buf += bytes([opt_type, len(encoded)]) + encoded
    return buf

def count_node_options(options):
    count = 0
    for key, value in options.items():
        if key not in NODE_OPTS:
            continue
        ot = NODE_OPTS[key]
        if ot in NODE_FLAG_OPTS:
            if value:
                count += 1
        else:
            count += 1
    return count

def serialize(manifest):
    buf = bytearray()
    commands = manifest['commands']
    nodes    = manifest['nodes']

    # Header
    buf += bytes([ECB_MANIFEST_VERSION_4, 0x00, len(commands)])

    # Commands
    for cmd in commands:
        cid      = int(cmd['id'], 16) if isinstance(cmd['id'], str) else cmd['id']
        ctype    = CMD_TYPES[cmd['type']]
        name     = cmd['name'].encode('utf-8')[:255]
        opts     = cmd.get('options', {})
        opt_count = count_cmd_options(opts)
        opts_buf  = serialize_cmd_options(opts)

        buf += bytes([cid, ctype, len(name)]) + name
        if cmd['type'] == 'range':
            rng = cmd['range']
            mn = struct.pack('>h', rng['min'])
            mx = struct.pack('>h', rng['max'])
            buf += mn + mx
        buf += bytes([opt_count]) + opts_buf

    # Nodes
    buf += bytes([len(nodes)])

    for node in nodes:
        nid    = node['id']
        parent = node.get('parent')
        pid    = 0xFF if parent is None else parent
        kind   = NODE_KINDS[node['kind']]
        ref    = node.get('ref')
        ref_id = 0xFF if ref is None else (int(ref, 16) if isinstance(ref, str) else ref)
        opts      = node.get('options', {})
        opt_count = count_node_options(opts)
        opts_buf  = serialize_node_options(opts)

        buf += bytes([nid, pid, kind, ref_id, opt_count]) + opts_buf

    return bytes(buf)


# ── Génération header C ─────────────────────────────────────────────────────

def generate_header(data, source_path):
    timestamp = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    lines = [
        '// AUTO-GENERATED by tools/gen_manifest.py — do not edit',
        f'// Source: {source_path}',
        f'// Generated: {timestamp}',
        '#pragma once',
        '#include <pgmspace.h>',
        '',
        'static const uint8_t ECB_MANIFEST_DATA[] PROGMEM = {',
    ]

    hex_bytes = [f'0x{b:02X}' for b in data]

    for i in range(0, len(hex_bytes), 12):
        chunk = hex_bytes[i:i+12]
        lines.append('  ' + ', '.join(chunk) + ',')

    lines.append('};')
    lines.append(f'static constexpr uint16_t ECB_MANIFEST_LEN = {len(data)};')
    lines.append('')
    return '\n'.join(lines)


# ── Point d'entrée ──────────────────────────────────────────────────────────

def run(src_dir, dry_run=False):
    manifest_path = os.path.join(src_dir, 'manifest.json')
    output_path   = os.path.join(src_dir, 'manifest_data.h')

    if not os.path.exists(manifest_path):
        print(f"manifest.json not found: {manifest_path}", file=sys.stderr)
        sys.exit(1)

    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    validate(manifest)
    data   = serialize(manifest)
    header = generate_header(data, 'src/manifest.json')

    if dry_run:
        print(f"Manifest valid - {len(data)} bytes, "
              f"{len(manifest['commands'])} commands, "
              f"{len(manifest['nodes'])} nodes")
        print(header)
        return

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(header)

    print(f"[gen_manifest] {len(data)} bytes -> {output_path}")


# ── PlatformIO hook ─────────────────────────────────────────────────────────

def pio_hook(env=None):
    if env is not None:
        src_dir = env.subst('$PROJECT_SRC_DIR')
    else:
        src_dir = os.path.join(os.path.dirname(__file__), '..', 'src')
        src_dir = os.path.normpath(src_dir)
    run(src_dir)


try:
    Import('env')  # PlatformIO context
    pio_hook(env)
except NameError:
    # Standalone
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    src_dir = os.path.join(os.path.dirname(__file__), '..', 'src')
    run(os.path.normpath(src_dir), dry_run=args.dry_run)
