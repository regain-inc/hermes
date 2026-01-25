/**
 * Transparency disclosure types for Hermes protocol
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.7
 * @module types/disclosure
 */

import type { UncertaintyLevel } from './epistemology';

// =============================================================================
// Section 2.7: Disclosure Bundle
// =============================================================================

/**
 * Standard "glass box" explanation for clinicians and patients.
 * Provides transparency about AI reasoning and limitations.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.7
 */
export interface DisclosureBundle {
  /** Plain language summary for patients */
  readonly patient_summary: string;

  /** More technical summary for clinicians */
  readonly clinician_summary: string;

  /** Brief bullets of reasoning */
  readonly rationale_bullets: readonly string[];

  /** What could change the decision */
  readonly key_unknowns: readonly string[];

  /** Uncertainty assessment */
  readonly uncertainty: {
    readonly level: UncertaintyLevel;
    readonly notes?: string;
  };
}
