/**
 * Evidence reference types for Hermes protocol
 * @module types/evidence
 */

import type { EvidenceGrade } from './epistemology';

// =============================================================================
// Section 2.6: Evidence Reference
// =============================================================================

/**
 * Type of evidence supporting a claim or recommendation.
 */
export type EvidenceType =
  | 'guideline'
  | 'study'
  | 'patient_data'
  | 'calculation'
  | 'policy'
  | 'other';

/**
 * All valid evidence types as a readonly array for runtime validation.
 */
export const EVIDENCE_TYPES: readonly EvidenceType[] = [
  'guideline',
  'study',
  'patient_data',
  'calculation',
  'policy',
  'other',
] as const;

/**
 * Reference to supporting evidence.
 * Provides "why" without copying large documents into messages.
 *
 */
export interface EvidenceRef {
  /** Unique identifier for this evidence reference */
  readonly evidence_id: string;

  /** Type of evidence */
  readonly evidence_type: EvidenceType;

  /**
   * Human-readable citation string.
   * Example: "ACC/AHA HF Guideline 2024, Section 7.2"
   */
  readonly citation: string;

  /** Optional pointer to full evidence text or stored "evidence pack" */
  readonly uri?: string;

  /**
   * Optional short excerpt.
   * MUST be brief to avoid payload bloat (<= ~500 chars recommended).
   */
  readonly excerpt?: string;

  /** Optional content hash for immutability */
  readonly content_hash?: string;

  // === EPISTEMOLOGICAL ENHANCEMENT ===

  /**
   * Evidence strength grade.
   * SHOULD be populated for all evidence refs in advocate_clinical mode.
   * SHOULD be populated for evidence supporting MEDICATION_ORDER_PROPOSAL.
   * If absent on medication proposals, Popper SHOULD treat as below threshold.
   */
  readonly evidence_grade?: EvidenceGrade;

  /**
   * Calibrated confidence (0.0-1.0), accounting for grade and recency.
   */
  readonly confidence?: number;

  /**
   * Publication date for confidence decay calculation.
   * ISO 8601 date string.
   */
  readonly publication_date?: string;

  /**
   * What would refute this evidence?
   * Supports Popperian falsificationism.
   */
  readonly falsification_condition?: string;
}

/**
 * Maximum recommended excerpt length in characters.
 */
export const MAX_EXCERPT_LENGTH = 500;
