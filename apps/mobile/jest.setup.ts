// react-hook-form warns about missing performance measurement APIs in jsdom.
globalThis.performance ??= { now: () => Date.now() } as Performance;
