/**
 * Clinical Snapshot Payload types for Hermes v2.1
 *
 * Defines the structured clinical data that Deutsch populates in
 * snapshot_payload for Popper rule evaluation.
 *
 * @since Hermes v2.1
 * @see 06-hermes-clinical-supervision-contract.md
 * @module types/clinical-snapshot
 */

import type { IsoDateTime } from './core';
import type { StructuredDose } from './proposals';

// =============================================================================
// Clinical Snapshot Payload
// =============================================================================

/**
 * Clinical data for Popper rule evaluation.
 *
 * Fields accept null or array:
 *   null = data was not available (triggers Popper snapshot_field_missing safety gate)
 *   []   = data was retrieved and confirmed empty (no safety gate triggered)
 *
 * This distinction is safety-critical. A patient with no documented allergies ([])
 * is different from a patient whose allergy data was not retrieved (null).
 */
export interface ClinicalSnapshotPayload {
  /** Active medications at the time of the snapshot */
  readonly active_medications?: readonly ActiveMedication[] | null;

  /** Recent lab values relevant to the supervised domain */
  readonly recent_labs?: readonly LabValue[] | null;

  /** Documented conditions/problems relevant to the supervised domain */
  readonly active_conditions?: readonly Condition[] | null;

  /** Recent vital signs */
  readonly recent_vitals?: readonly VitalSign[] | null;

  /** Allergies and intolerances (medication-related) */
  readonly medication_allergies?: readonly MedicationAllergy[] | null;

  // ── C1: HF Assessment (GDMT alignment) ───────────────────────
  /**
   * Heart failure assessment for GDMT gap detection.
   * Required for GDMTAssessmentResult to return status: 'ok'.
   * When absent or null, GDMT detector returns 'insufficient_data'.
   * @since Hermes v2.2
   */
  readonly hf_assessment?: HFAssessment | null;

  // ── C4: Acute Status / Encounter Context ──────────────────────
  /**
   * Acute clinical status and encounter context.
   * Required for GlobalOpportunityGate evaluation.
   * When absent, opportunity gate defaults to eligible=true (permissive).
   * @since Hermes v2.2
   */
  readonly acute_status?: AcuteStatus | null;

  // ── C7: SDoH / Access Signals (optional, gated) ──────────────
  /**
   * Social determinants and access signals.
   * Optional — when absent, access-related workflows are disabled.
   * @since Hermes v2.2
   */
  readonly access_context?: AccessContext | null;
}

// =============================================================================
// Active Medication
// =============================================================================

/**
 * Medication status in the patient's active medication list.
 */
export type MedicationStatus = 'active' | 'on_hold' | 'discontinued';

/**
 * An active medication in the patient's medication list.
 */
export interface ActiveMedication {
  /** Normalized drug name (lowercase, generic, no salt forms) */
  readonly name: string;

  /** RxNorm CUI if available */
  readonly rxnorm_code?: string;

  /**
   * ATC 4th-level chemical subgroup code (e.g., "C09AA" for ACE inhibitors).
   * Required for class-level Popper rule matching.
   */
  readonly atc_class?: string;

  /** Current dose if known */
  readonly dose?: StructuredDose;

  /** Status of the medication */
  readonly status: MedicationStatus;

  // ── C3: Medication Exposure History ─────────────────────────
  /** When this medication was started. Required for ARNI washout and time-at-dose logic. @since v2.2 */
  readonly started_at?: IsoDateTime;
  /** When this medication was stopped (for discontinued/on_hold). Required for ACEi→ARNI 36h washout. @since v2.2 */
  readonly stopped_at?: IsoDateTime;
  /** When the last dose was administered/taken, if different from stopped_at. @since v2.2 */
  readonly last_dose_at?: IsoDateTime;
}

// =============================================================================
// Lab Value
// =============================================================================

/**
 * Lab value flag indicating abnormality status.
 */
export type LabFlag = 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high';

/**
 * A recent lab value in the clinical snapshot.
 *
 * lab_id uses normalized aliases (case-insensitive) or LOINC codes.
 * @see 06-hermes-clinical-supervision-contract.md §5.2 for the alias table
 */
export interface LabValue {
  /**
   * Canonical lab identifier.
   * Preferred: LOINC code.
   * Accepted normalized aliases: "egfr", "potassium", "creatinine",
   * "sodium", "hemoglobin", "hba1c", "ldl_c", "hdl_c",
   * "total_cholesterol", "triglycerides", "alt", "ast",
   * "bnp", "nt_probnp", "inr", "platelets"
   */
  readonly lab_id: string;

  /** LOINC code if available */
  readonly loinc_code?: string;

  /** Numeric value */
  readonly value: number;

  /** Unit (UCUM preferred) */
  readonly unit: string;

  /** When the lab was collected */
  readonly collected_at: IsoDateTime;

  /** Whether the value is flagged as abnormal */
  readonly flag?: LabFlag;
}

// =============================================================================
// Condition
// =============================================================================

/**
 * Clinical status of a condition.
 */
export type ConditionStatus = 'active' | 'resolved' | 'inactive';

/**
 * A documented condition in the clinical snapshot.
 *
 * condition_id uses normalized aliases or SNOMED CT/ICD-10 codes.
 * @see 06-hermes-clinical-supervision-contract.md §5.3 for the alias table
 */
export interface Condition {
  /**
   * Canonical condition identifier.
   * Preferred: SNOMED CT concept ID.
   * Accepted normalized aliases: "heart_failure", "hfref", "hfpef",
   * "hypertension", "atrial_fibrillation", "type_2_diabetes",
   * "ckd", "coronary_artery_disease", "hyperlipidemia",
   * "angioedema_history", "hyperkalemia"
   */
  readonly condition_id: string;

  /** SNOMED CT concept ID if available */
  readonly snomed_code?: string;

  /** ICD-10-CM code if available */
  readonly icd10_code?: string;

  /** When the condition was documented */
  readonly onset_date?: IsoDateTime;

  /** Clinical status */
  readonly status: ConditionStatus;
}

// =============================================================================
// Vital Sign
// =============================================================================

/**
 * Vital sign type.
 */
export type VitalSignType =
  | 'systolic_bp'
  | 'diastolic_bp'
  | 'heart_rate'
  | 'weight_kg'
  | 'bmi'
  | 'spo2'
  | 'other';

/**
 * A recent vital sign measurement.
 */
export interface VitalSign {
  /** Vital sign type */
  readonly type: VitalSignType;

  /** Numeric value */
  readonly value: number;

  /** Unit */
  readonly unit: string;

  /** When recorded */
  readonly recorded_at: IsoDateTime;
}

// =============================================================================
// Medication Allergy
// =============================================================================

/**
 * Reaction type for a medication allergy/intolerance.
 */
export type AllergyReactionType = 'allergy' | 'intolerance' | 'adverse_reaction';

/**
 * Allergy severity.
 */
export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening';

/**
 * A documented medication allergy or intolerance.
 */
export interface MedicationAllergy {
  /** Name of the medication or class */
  readonly substance: string;

  /** ATC class code if the allergy is class-level */
  readonly atc_class?: string;

  /** Reaction type */
  readonly reaction_type: AllergyReactionType;

  /** Severity if known */
  readonly severity?: AllergySeverity;

  /** Specific reaction (e.g., "angioedema", "rash", "anaphylaxis") */
  readonly reaction?: string;
}

// =============================================================================
// Native Evidence Grading
// =============================================================================

/**
 * Source-native evidence grading, preserving the grading system
 * used by the originating guideline or authority.
 *
 * Different societies use different grading systems. This type
 * stores the native representation rather than forcing normalization.
 *
 * Only one system's fields should be populated per instance.
 *
 * @since Hermes v2.1
 * @see 06-hermes-clinical-supervision-contract.md §4.2
 */
export interface NativeGrading {
  /** Which grading system this source uses */
  readonly system: 'AHA_ACC' | 'ADA' | 'KDIGO' | 'GRADE' | 'FDA_LABEL' | 'other';

  // ── AHA/ACC system (used by AHA, ACC, HRS, HFSA, SCAI, etc.) ──
  readonly aha_acc_cor?: 'I' | 'IIa' | 'IIb' | 'III_no_benefit' | 'III_harm';
  readonly aha_acc_loe?: 'A' | 'B_R' | 'B_NR' | 'C_LD' | 'C_EO';

  // ── ADA system (Standards of Care in Diabetes) ──
  readonly ada_grade?: 'A' | 'B' | 'C' | 'E';

  // ── KDIGO system ──
  readonly kdigo_strength?: '1' | '2';
  readonly kdigo_quality?: 'A' | 'B' | 'C' | 'D';
  readonly kdigo_practice_point?: boolean;

  // ── FDA label ──
  /** FDA label section number (e.g., "4" for Contraindications, "5" for Warnings) */
  readonly fda_label_section?: string;

  // ── Other/free-text ──
  readonly other_grade?: string;
}

// =============================================================================
// C1: HF Assessment (GDMT alignment)
// @since Hermes v2.2
// =============================================================================

/**
 * Heart failure phenotype for GDMT gap detection.
 * Only 'HFrEF' is supported for 4-pillar GDMT assessment in v1.
 */
export type HFPhenotype = 'HFrEF' | 'HFmrEF' | 'HFpEF';

/**
 * NYHA functional classification.
 */
export type NYHAClass = 'I' | 'II' | 'III' | 'IV';

/**
 * All valid HF phenotypes as a readonly array for runtime validation.
 */
export const HF_PHENOTYPES: readonly HFPhenotype[] = ['HFrEF', 'HFmrEF', 'HFpEF'] as const;

/**
 * All valid NYHA classes as a readonly array for runtime validation.
 */
export const NYHA_CLASSES: readonly NYHAClass[] = ['I', 'II', 'III', 'IV'] as const;

/**
 * Heart failure assessment for GDMT optimization.
 *
 * Required by the GDMT gap detector to produce a valid GDMTAssessmentResult.
 * When this is absent from the snapshot, the detector returns 'insufficient_data'.
 *
 * @since Hermes v2.2
 * @see 04-gdmt-impediment-mapping.md §2
 */
export interface HFAssessment {
  /** Confirmed HF phenotype */
  readonly phenotype: HFPhenotype;

  /** Most recent LVEF value (percentage, 0-100) */
  readonly lvef: number;

  /** When the LVEF was measured — stale LVEF is unreliable */
  readonly lvef_date: IsoDateTime;

  /** NYHA functional classification */
  readonly nyha_class?: NYHAClass;
}

// =============================================================================
// C4: Acute Status / Encounter Context
// @since Hermes v2.2
// =============================================================================

/**
 * Acute clinical status and encounter context.
 *
 * Required by GlobalOpportunityGate to determine whether GDMT
 * intensification is appropriate right now.
 *
 * @since Hermes v2.2
 * @see 04-gdmt-impediment-mapping.md §2 (GlobalOpportunityGate)
 */
export interface AcuteStatus {
  /** Patient is in decompensated HF (acute exacerbation) */
  readonly decompensated_hf?: boolean;

  /** Recent hospitalization — when discharged. Null/absent = no recent hospitalization. */
  readonly last_discharge_date?: IsoDateTime;

  /** Post-operative status — when surgery occurred. Null/absent = not post-op. */
  readonly last_surgery_date?: IsoDateTime;

  /** Clinician placed a blanket hold on all GDMT intensification */
  readonly blanket_clinical_hold?: boolean;

  /** Date of the most recent medication change (any class). Used for titration-interval gating. */
  readonly last_medication_change_date?: IsoDateTime;
}

// =============================================================================
// C7: SDoH / Access Context (optional, gated)
// @since Hermes v2.2
// =============================================================================

/**
 * Social determinants and access signals.
 *
 * Optional. When absent, access-related GDMT workflows are disabled.
 * When present, operational_barrier deferrals can trigger access-support
 * workflows instead of just being recorded as metrics.
 *
 * @since Hermes v2.2
 */
export interface AccessContext {
  /** Insurance coverage status */
  readonly insurance_status?: 'commercial' | 'medicare' | 'medicaid' | 'uninsured' | 'other';

  /** Whether copay assistance programs are available for this patient */
  readonly copay_assistance_available?: boolean;

  /** Known formulary restrictions (list of ATC classes with access barriers) */
  readonly formulary_restrictions?: readonly string[];

  /** Pharmacy access indicator */
  readonly pharmacy_accessible?: boolean;

  /** Free-text social determinant flags (e.g., "housing_instability", "food_insecurity") */
  readonly sdoh_flags?: readonly string[];
}
