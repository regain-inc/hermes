/**
 * Health State Snapshot types for Hermes protocol
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.5
 * @module types/snapshot
 */

import type { IsoDateTime } from './core';
import type { ClinicianOverrideHistory } from './feedback';
import type { DerivedImagingFinding, ImagingStudyRef } from './imaging';

// =============================================================================
// Section 2.5: Health State Snapshot Reference
// =============================================================================

/**
 * Data sources that can contribute to a health state snapshot.
 * @see schema/hermes-message.schema.json — $defs.HealthStateSnapshotRef.properties.sources
 */
export type SnapshotSource = 'ehr' | 'wearable' | 'patient_reported' | 'imaging' | 'other';

/**
 * All valid snapshot sources as a readonly array for runtime validation.
 */
export const SNAPSHOT_SOURCES: readonly SnapshotSource[] = [
  'ehr',
  'wearable',
  'patient_reported',
  'imaging',
  'other',
] as const;

/**
 * Quality flags for snapshot data.
 * Contains PHI-minimized quality indicators.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.5
 */
export interface SnapshotQuality {
  /** Signals that are missing from the snapshot (e.g., ["potassium", "creatinine"]) */
  readonly missing_signals?: readonly string[];
  /** Signals that have conflicting values (e.g., ["weight_trend"]) */
  readonly conflicting_signals?: readonly string[];
  /** Brief notes about quality; MUST NOT include direct identifiers */
  readonly notes?: string;
}

/**
 * Reference to patient health state snapshot.
 * Contains metadata without PHI.
 *
 * Both Deutsch and Popper reason over the *same snapshot* so decisions are reproducible.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.5
 * @see schema/hermes-message.schema.json — $defs.HealthStateSnapshotRef
 */
export interface HealthStateSnapshotRef {
  /** Unique identifier for this snapshot */
  readonly snapshot_id: string;

  /**
   * Base64-encoded SHA-256 hash of the canonical JSON snapshot payload.
   * Strongly recommended for reproducibility in advocate_clinical mode.
   * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.5.1
   */
  readonly snapshot_hash?: string;

  /** When the snapshot was created (ISO 8601 UTC) */
  readonly created_at: IsoDateTime;

  /**
   * Internal pointer to where the snapshot can be retrieved.
   * MUST NOT be a public URL.
   * Example: "phi://snapshots/<id>" or "http://internal/snapshots/<id>"
   */
  readonly snapshot_uri?: string;

  /** Data sources that contributed to this snapshot (at least one required) */
  readonly sources: readonly SnapshotSource[];

  /** Optional PHI-minimized quality flags for safe decision-making */
  readonly quality?: SnapshotQuality;

  /**
   * References to imaging studies (pointers, NOT raw pixels).
   * Raw imaging data MUST NEVER be included in the snapshot.
   * @see 03-hermes-specs/05-hermes-imaging-data.md
   */
  readonly imaging_studies?: readonly ImagingStudyRef[];

  /**
   * Derived findings extracted from imaging (KB-sized, safe to include).
   * These are outputs of radiologists or imaging AI pipelines.
   * @see 03-hermes-specs/05-hermes-imaging-data.md
   */
  readonly imaging_findings?: readonly DerivedImagingFinding[];

  /**
   * Estimated uncompressed size in bytes for validation.
   * Deployments SHOULD validate: estimated_size_bytes <= 1,000,000 (1 MB).
   * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.5.2
   */
  readonly estimated_size_bytes?: number;

  /**
   * Prior clinician overrides for this patient (PHI-minimized).
   * Populated by snapshot builder when relevant history exists.
   * Used by Deutsch for patient-specific case reassessment (NOT RLHF).
   * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.3
   */
  readonly prior_clinician_overrides?: ClinicianOverrideHistory;
}

/**
 * Maximum allowed snapshot size in bytes.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.5.2
 */
export const MAX_SNAPSHOT_SIZE_BYTES = 1_000_000;
