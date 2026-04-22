import type { ErrorObject } from 'ajv';

export interface Diagnostic {
  path: string;
  keyword: string;
  message: string;
  objectId?: string;
}

export function formatAjvError(err: ErrorObject): Diagnostic {
  return {
    path: err.instancePath || '/',
    keyword: err.keyword,
    message: `${err.keyword}: ${err.message ?? 'unknown failure'}`,
  };
}

export function formatAjvErrors(errors: ErrorObject[] | null | undefined): Diagnostic[] {     
  return (errors ?? []).map(formatAjvError);
}
