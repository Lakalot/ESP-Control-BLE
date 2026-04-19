export class StringTable {
  private readonly index = new Map<string, number>();
  private readonly list: string[] = [];

  constructor() {
    this.intern('');
  }

  intern(value: string): number {
    const existing = this.index.get(value);
    if (existing !== undefined) return existing;

    const next = this.list.length;
    this.list.push(value);
    this.index.set(value, next);
    return next;
  }

  internOptional(value: string | undefined | null): number {
    if (value === undefined || value === null || value === '') return 0;
    return this.intern(value);
  }

  toArray(): readonly string[] {
    return this.list;
  }
}
