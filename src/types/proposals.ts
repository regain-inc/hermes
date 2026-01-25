/**
 * Proposed intervention types for Hermes protocol
 * @module types/proposals
 */

import type { AuditRedactionBase, IsoDateTime, ProposedInterventionKind } from './core';
import type { DisclosureBundle } from './disclosure';
import type {
  ClaimType,
  FalsificationCriteria,
  HTVScore,
  UncertaintyCalibration,
} from './epistemology';
import type { EvidenceRef } from './evidence';

// =============================================================================
// Section 3.3: Proposed Interventions
// =============================================================================

/**
 * Risk level assessed by Deutsch.
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * All valid risk levels as a readonly array for runtime validation.
 */
export const RISK_LEVELS: readonly RiskLevel[] = ['low', 'medium', 'high', 'critical'] as const;

/**
 * Deutsch's self-assessment of proposal risk.
 * Popper does not have to trust it.
 */
export interface DeutschRiskEstimate {
  readonly level: RiskLevel;
  readonly notes?: string;
}

/**
 * Base type for all proposed interventions.
 * Hermes defines structured proposals so Popper can evaluate them quickly.
 *
 */
export interface ProposedInterventionBase {
  /** Unique identifier for this proposal */
  readonly proposal_id: string;

  /** Type of intervention */
  readonly kind: ProposedInterventionKind;

  /** When this proposal was created */
  readonly created_at: IsoDateTime;

  /**
   * Proposals that share a group ID MUST be treated atomically.
   * Popper MUST NOT partially approve within a group.
   * Deutsch MUST NOT execute a partial group.
   */
  readonly interdependency_group_id?: string;

  /** Deutsch's self-assessment (Popper does not have to trust it) */
  readonly deutsch_risk_estimate?: DeutschRiskEstimate;

  /** Supporting evidence references */
  readonly evidence_refs?: readonly EvidenceRef[];

  /** Transparency disclosure for clinicians and patients */
  readonly disclosure?: DisclosureBundle;

  // === EPISTEMOLOGICAL ENHANCEMENT ===

  /**
   * Classification of the underlying claim.
   * MUST be populated in advocate_clinical mode for all proposals.
   */
  readonly claim_type?: ClaimType;

  /**
   * Hard-to-Vary score measuring explanation quality.
   * MUST be populated in advocate_clinical mode for high-risk proposal types:
   *   - MEDICATION_ORDER_PROPOSAL
   *   - TRIAGE_ROUTE with urgency 'urgent'
   *   - Any proposal with deutsch_risk_estimate.level in ['high', 'critical']
   * SHOULD be populated for all other proposals in advocate_clinical mode.
   */
  readonly htv_score?: HTVScore;

  /**
   * What would refute this recommendation?
   * SHOULD be populated for high-risk claim types (treatment_rec, diagnosis, prognosis).
   */
  readonly falsification_criteria?: FalsificationCriteria;

  /**
   * Calibrated uncertainty with algorithm-based scoring.
   * SHOULD be populated; if absent, Popper SHOULD treat as 'high' uncertainty.
   */
  readonly uncertainty_calibration?: UncertaintyCalibration;

  /**
   * REQUIRED: redacted representation safe for most logs.
   * MUST NOT include direct identifiers (name, email, phone, address).
   */
  readonly audit_redaction: AuditRedactionBase;
}

// =============================================================================
// Concrete Proposal Types
// =============================================================================

/**
 * Care navigation action types.
 */
export type CareNavigationAction =
  | 'schedule_appointment'
  | 'reschedule_appointment'
  | 'send_reminder'
  | 'other';

/**
 * Care navigation proposal (scheduling, logistics, reminders).
 */
export interface CareNavigationProposal extends ProposedInterventionBase {
  readonly kind: 'CARE_NAVIGATION';
  readonly action: CareNavigationAction;
  readonly details?: {
    /** Brief note; avoid PHI if possible */
    readonly note?: string;
  };
}

/**
 * Urgency level for triage routing.
 */
export type TriageUrgency = 'routine' | 'soon' | 'urgent';

/**
 * Destination for triage routing.
 */
export type TriageDestination = 'care_team' | 'cardiologist' | 'primary_care' | 'emergency';

/**
 * Triage route proposal (route to care team/clinician with a reason).
 */
export interface TriageRouteProposal extends ProposedInterventionBase {
  readonly kind: 'TRIAGE_ROUTE';
  readonly urgency: TriageUrgency;
  readonly route_to: TriageDestination;
  readonly reason: string;
}

/**
 * Medication change type.
 */
export type MedicationChangeType = 'start' | 'stop' | 'titrate' | 'hold';

/**
 * Medication order proposal (clinical mode only).
 * NOTE: Contains PHI; implementations MUST NOT log without explicit redaction.
 *
 */
export interface MedicationOrderProposal extends ProposedInterventionBase {
  readonly kind: 'MEDICATION_ORDER_PROPOSAL';

  readonly medication: {
    /** Medication name (e.g., "lisinopril") */
    readonly name: string;
    /** RxNorm code if available */
    readonly rxnorm_code?: string;
  };

  readonly change: {
    /** Type of medication change */
    readonly change_type: MedicationChangeType;
    /** Current dose (e.g., "10 mg daily") */
    readonly from_dose?: string;
    /** Target dose (e.g., "20 mg daily") */
    readonly to_dose?: string;
  };

  /**
   * Governance constraint: required for regulated mode actions.
   * Pointer to approved protocol/order set.
   */
  readonly clinician_protocol_ref?: string;
}

/**
 * Patient message proposal (what will be shown to the patient).
 */
export interface PatientMessageProposal extends ProposedInterventionBase {
  readonly kind: 'PATIENT_MESSAGE';
  /** Markdown-formatted message content */
  readonly message_markdown: string;
}

/**
 * Lifestyle modification proposal (physical activity, sleep, stress management).
 */
export interface LifestyleModificationProposal extends ProposedInterventionBase {
  readonly kind: 'LIFESTYLE_MODIFICATION_PROPOSAL';
  /** Type of lifestyle modification */
  readonly modification_type: string;
  /** Specific recommendations */
  readonly recommendations: readonly string[];
  /** Target goals */
  readonly goals?: readonly string[];
}

/**
 * Nutrition plan proposal (dietary modifications, meal planning).
 */
export interface NutritionPlanProposal extends ProposedInterventionBase {
  readonly kind: 'NUTRITION_PLAN_PROPOSAL';
  /** Dietary restrictions */
  readonly restrictions?: readonly string[];
  /** Target nutrient limits */
  readonly nutrient_limits?: Record<string, number>;
  /** General recommendations */
  readonly recommendations: readonly string[];
}

/**
 * Behavioral intervention proposal (behavioral health, adherence support).
 */
export interface BehavioralInterventionProposal extends ProposedInterventionBase {
  readonly kind: 'BEHAVIORAL_INTERVENTION_PROPOSAL';
  /** Type of behavioral intervention */
  readonly intervention_type: string;
  /** Specific techniques or approaches */
  readonly techniques?: readonly string[];
  /** Target behaviors to address */
  readonly target_behaviors?: readonly string[];
}

/**
 * Other proposal (escape hatch for future types without breaking the contract).
 */
export interface OtherProposal extends ProposedInterventionBase {
  readonly kind: 'OTHER';
  /** Specific kind (e.g., "NUTRITION_SUPPORT", "VIRTUAL_PT", "DOC_AUTOMATION") */
  readonly other_kind: string;
  /**
   * Optional extension payload.
   * Treat as potentially sensitive; do not log without redaction.
   */
  readonly payload?: Record<string, unknown>;
}

/**
 * Union type of all concrete proposal types.
 */
export type ProposedIntervention =
  | CareNavigationProposal
  | TriageRouteProposal
  | MedicationOrderProposal
  | PatientMessageProposal
  | LifestyleModificationProposal
  | NutritionPlanProposal
  | BehavioralInterventionProposal
  | OtherProposal;
