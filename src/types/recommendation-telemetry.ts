/**
 * Recommendation Lifecycle Telemetry types for Hermes v2.2
 *
 * C6: Stable identifiers and events for tracking GDMT recommendations
 * from gap detection through clinician action to medication execution.
 *
 * @since Hermes v2.2
 * @see 04-gdmt-impediment-mapping.md §8 (C6)
 * @see 05-popper-measurement-protocols.md §10.3
 * @module types/recommendation-telemetry
 */

import type { IsoDateTime } from './core';
import type { ClinicianAction } from './feedback';
import type { DeferralReason } from './feedback';

// =============================================================================
// Recommendation Identity
// =============================================================================

/**
 * Stable identifier for a GDMT gap/recommendation that persists
 * across sessions. Used for tracking missed opportunities, deferral
 * counts, and time-to-optimization metrics.
 *
 * Format: `gdmt:{pillar}:{action_type}:{patient_pseudo_id}`
 * Example: `gdmt:mra:initiate:patient_abc123`
 */
export type RecommendationId = string & { readonly __brand: 'RecommendationId' };

// =============================================================================
// Recommendation Lifecycle Events
// =============================================================================

/**
 * Outcome of a recommendation surfacing.
 */
export type RecommendationOutcome =
  | 'accepted' // clinician accepted
  | 'modified' // clinician modified (still counts as actioned)
  | 'rejected' // clinician rejected
  | 'deferred' // clinician deferred — see deferral_reason
  | 'not_surfaced' // gap existed but was not surfaced (opportunity gate blocked)
  | 'expired'; // recommendation window closed without action

/**
 * A single lifecycle event for a tracked recommendation.
 * Emitted by Deutsch when a GDMT gap is surfaced to a clinician
 * and the clinician responds (or doesn't).
 *
 * @since Hermes v2.2
 */
export interface RecommendationLifecycleEvent {
  /** Stable recommendation identifier (persists across sessions) */
  readonly recommendation_id: RecommendationId;

  /** Which GDMT pillar this recommendation targets */
  readonly pillar: 'beta_blocker' | 'raasi' | 'mra' | 'sglt2i';

  /** What type of action was recommended */
  readonly action_type: 'initiate' | 'titrate' | 'grouped_transition';

  /** When the recommendation was first surfaced to a clinician */
  readonly surfaced_at: IsoDateTime;

  /** The proposal_id(s) that carried this recommendation (for audit trail linkage) */
  readonly proposal_ids: readonly string[];

  /** What happened */
  readonly outcome: RecommendationOutcome;

  /** Clinician action if the recommendation was surfaced and acted on */
  readonly clinician_action?: ClinicianAction;

  /** Deferral reason if outcome is 'deferred' */
  readonly deferral_reason?: DeferralReason;

  /** When the outcome was recorded */
  readonly outcome_at: IsoDateTime;

  /** Patient pseudonymous ID */
  readonly patient_id: string;

  /** Organization scope */
  readonly organization_id?: string;
}

// =============================================================================
// Medication Order Confirmation
// =============================================================================

/**
 * Confirmation that a medication order was actually executed in the
 * clinical system (EHR/pharmacy). This closes the loop between
 * "clinician accepted a recommendation" and "medication was actually ordered."
 *
 * Source: MISS or EHR integration (not Deutsch or Popper).
 *
 * @since Hermes v2.2
 */
export interface MedicationOrderConfirmation {
  /** Links to the original proposal_id that was accepted/modified */
  readonly original_proposal_id: string;

  /** Links to the recommendation_id for longitudinal tracking */
  readonly recommendation_id?: RecommendationId;

  /** The medication that was actually ordered */
  readonly medication_name: string;

  /** RxNorm code if available */
  readonly rxnorm_code?: string;

  /** What was ordered (start, stop, titrate, hold) */
  readonly order_type: 'start' | 'stop' | 'titrate' | 'hold';

  /** The dose that was actually ordered (may differ from proposal) */
  readonly ordered_dose?: {
    readonly value: number;
    readonly unit: string;
    readonly frequency?: string;
  };

  /** When the order was placed */
  readonly ordered_at: IsoDateTime;

  /** Whether the order was successfully transmitted to pharmacy/EHR */
  readonly confirmed: boolean;

  /** Patient pseudonymous ID */
  readonly patient_id: string;
}
