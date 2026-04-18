declare function require(path: string): any;

const { applyFormat, formatValue } = require('../formatValue');

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`  PASS: ${message}`);
}

assert(applyFormat('%.2f', 23.5) === '23.50', 'applyFormat %.2f');
assert(applyFormat('%d', 23.9) === '23', 'applyFormat %d truncates');
assert(applyFormat('%f', 1.5) === '1.500000', 'applyFormat %f default 6 places');
assert(applyFormat('%s', 42) === '42', 'applyFormat %s');
assert(applyFormat('%xyz', 1) === '1', 'applyFormat unknown falls back');

assert(
  formatValue(2350, { scale: 100, format: '%.2f', unit: 'C' }) === '23.50 C',
  'scale+format+unit',
);
assert(formatValue(75, { unit: '%' }) === '75 %', 'no scale, unit');
assert(formatValue(3, { format: '%d' }) === '3', 'format only');
assert(formatValue(100, {}) === '100', 'bare integer');
assert(formatValue(1.5, {}) === '1.5', 'fractional no trailing zeros');
assert(formatValue(1.5, { scale: 1 }) === '1.5', 'scale 1 preserved');

console.log('\nAll formatValue tests passed.');
