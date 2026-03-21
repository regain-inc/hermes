/**
 * Canonical JSON serialization and snapshot hashing utilities.
 *
 * These functions produce deterministic JSON output suitable for hashing,
 * ensuring that two semantically identical objects always produce the same
 * hash regardless of property insertion order. Inspired by RFC 8785 (JCS).
 *
 * @module utils/canonical-json
 */

import { createHash } from 'node:crypto';

/**
 * Canonical JSON serialization (deterministic key order).
 *
 * JSON.stringify key order is not guaranteed by the spec — two semantically
 * identical objects could produce different hashes depending on insertion order.
 * This function recursively sorts object keys to produce a deterministic
 * serialization suitable for hashing (inspired by RFC 8785 / JCS).
 */
export function canonicalJsonStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(canonicalJsonStringify).join(',')}]`;
  const sorted = Object.keys(obj as Record<string, unknown>).sort();
  return `{${sorted.map((k) => `${JSON.stringify(k)}:${canonicalJsonStringify((obj as Record<string, unknown>)[k])}`).join(',')}}`;
}

/**
 * Compute a SHA-256 hex digest of the canonical JSON representation of a payload.
 *
 * Used to produce `snapshot_hash` values for `ClinicalSnapshotPayload` and
 * other wire payloads that require integrity verification.
 */
export function computeSnapshotHash(payload: unknown): string {
  const canonical = canonicalJsonStringify(payload);
  return createHash('sha256').update(canonical).digest('hex');
}
