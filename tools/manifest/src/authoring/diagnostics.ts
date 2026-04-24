export interface AuthoringDiagnostic {
  path: string;
  message: string;
}

interface ValueErrorLike {
  path: string;
  message: string;
  errors?: Iterable<Iterable<ValueErrorLike>>;
}

export interface AuthoringLoadSuccess<T> {
  ok: true;
  value: T;
}

export interface AuthoringLoadFailure {
  ok: false;
  errors: AuthoringDiagnostic[];
}

export type AuthoringLoadResult<T> = AuthoringLoadSuccess<T> | AuthoringLoadFailure;

export function diagnostic(path: string, message: string): AuthoringDiagnostic {
  return { path, message };
}

export function formatYamlPath(path: string): string {
  if (path === '' || path === '/') {
    return '/';
  }

  const parts = path.split('/').slice(1).filter(Boolean);
  let out = '';

  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      out += `[${part}]`;
      continue;
    }

    out += out === '' ? part : `.${part}`;
  }

  return out || '/';
}

export function collectSchemaDiagnostics(errors: Iterable<ValueErrorLike>): AuthoringDiagnostic[] {
  const diagnostics = flattenValueErrors(errors).map((error) =>
    diagnostic(formatYamlPath(error.path), formatSchemaMessage(error.message)),
  );
  const seen = new Set<string>();

  return diagnostics.filter((entry) => {
    const key = `${entry.path}\n${entry.message}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function flattenValueErrors(errors: Iterable<ValueErrorLike>): ValueErrorLike[] {
  const out: ValueErrorLike[] = [];

  for (const error of errors) {
    const nestedGroups = Array.from(error.errors ?? []);

    if (nestedGroups.length > 0) {
      for (const group of nestedGroups) {
        out.push(...flattenValueErrors(group));
      }

      continue;
    }

    out.push(error);
  }

  return out;
}

function formatSchemaMessage(message: string): string {
  if (message === 'Expected required property') {
    return 'is required';
  }

  return message.replace(/^Expected /, 'expected ');
}
