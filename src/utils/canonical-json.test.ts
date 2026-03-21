import { describe, expect, test } from 'bun:test';
import { canonicalJsonStringify, computeSnapshotHash } from './canonical-json';

describe('canonicalJsonStringify', () => {
  test('serializes primitives', () => {
    expect(canonicalJsonStringify(null)).toBe('null');
    expect(canonicalJsonStringify(42)).toBe('42');
    expect(canonicalJsonStringify('hello')).toBe('"hello"');
    expect(canonicalJsonStringify(true)).toBe('true');
  });

  test('serializes arrays preserving order', () => {
    expect(canonicalJsonStringify([3, 1, 2])).toBe('[3,1,2]');
    expect(canonicalJsonStringify([])).toBe('[]');
  });

  test('sorts object keys deterministically', () => {
    const a = { z: 1, a: 2, m: 3 };
    const b = { a: 2, m: 3, z: 1 };
    expect(canonicalJsonStringify(a)).toBe(canonicalJsonStringify(b));
    expect(canonicalJsonStringify(a)).toBe('{"a":2,"m":3,"z":1}');
  });

  test('handles nested objects', () => {
    const obj = { b: { z: 1, a: 2 }, a: 'first' };
    expect(canonicalJsonStringify(obj)).toBe('{"a":"first","b":{"a":2,"z":1}}');
  });

  test('handles mixed arrays and objects', () => {
    const obj = { items: [{ b: 1, a: 2 }] };
    expect(canonicalJsonStringify(obj)).toBe('{"items":[{"a":2,"b":1}]}');
  });
});

describe('computeSnapshotHash', () => {
  test('returns a 64-character hex string (SHA-256)', () => {
    const hash = computeSnapshotHash({ foo: 'bar' });
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  test('produces identical hashes for objects with different key order', () => {
    const hash1 = computeSnapshotHash({ z: 1, a: 2 });
    const hash2 = computeSnapshotHash({ a: 2, z: 1 });
    expect(hash1).toBe(hash2);
  });

  test('produces different hashes for different payloads', () => {
    const hash1 = computeSnapshotHash({ a: 1 });
    const hash2 = computeSnapshotHash({ a: 2 });
    expect(hash1).not.toBe(hash2);
  });
});
