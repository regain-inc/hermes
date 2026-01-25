/**
 * Bias detection types for Hermes protocol
 * First-class message type for demographic bias detection per FDA AI/ML
 * post-market surveillance requirements.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.4
 * @module types/bias
 */

import type {
  AuditRedactionBase,
  HermesVersion,
  IsoDateTime,
  Mode,
  ProposedInterventionKind,
  TraceContext,
} from './core';
import type { RationaleCategory } from './feedback';

// =============================================================================
// Section 4.4: Bias Detection Types
// =============================================================================

/**
 * Type of bias detected.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.4
 */
export type BiasDetectionType =
  | 'demographic_override_disparity'
  | 'intervention_type_bias'
  | 'clinician_specialty_bias'
  | 'other';

/**
 * All valid bias detection types as a readonly array for runtime validation.
 */
export const BIAS_DETECTION_TYPES: readonly BiasDetectionType[] = [
  'demographic_override_disparity',
  'intervention_type_bias',
  'clinician_specialty_bias',
  'other',
] as const;

/**
 * Severity level for bias detection.
 */
export type BiasSeverity = 'info' | 'warning' | 'critical';

/**
 * All valid bias severity levels as a readonly array for runtime validation.
 */
export const BIAS_SEVERITIES: readonly BiasSeverity[] = ['info', 'warning', 'critical'] as const;

/**
 * Analysis period for bias detection.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.4
 */
export interface BiasAnalysisPeriod {
  /** Start of analysis period (ISO datetime) */
  readonly start: IsoDateTime;
  /** End of analysis period (ISO datetime) */
  readonly end: IsoDateTime;
  /** Number of days in the analysis period */
  readonly days: number;
}

/**
 * Dimension type for affected dimension.
 */
export type BiasDimensionType =
  | 'age_group'
  | 'intervention_kind'
  | 'medication_class'
  | 'clinician_specialty'
  | 'other';

/**
 * All valid bias dimension types as a readonly array for runtime validation.
 */
export const BIAS_DIMENSION_TYPES: readonly BiasDimensionType[] = [
  'age_group',
  'intervention_kind',
  'medication_class',
  'clinician_specialty',
  'other',
] as const;

/**
 * What dimension showed bias.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.4
 */
export interface BiasAffectedDimension {
  /** Type of dimension */
  readonly dimension_type: BiasDimensionType;
  /** Value of the dimension (e.g., "geriatric", "ACE_INHIBITOR") */
  readonly dimension_value: string;
}

/**
 * Statistical significance for bias metrics.
 */
export interface BiasStatisticalSignificance {
  /** P-value of the statistical test */
  readonly p_value?: number;
  /** 95% confidence interval [lower, upper] */
  readonly confidence_interval_95?: readonly [number, number];
  /** Whether the result is statistically significant */
  readonly is_significant: boolean;
}

/**
 * Statistical metrics for bias detection.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.4
 */
export interface BiasMetrics {
  /** Overall override rate (0.0-1.0) */
  readonly overall_override_rate: number;
  /** Override rate for the affected group (0.0-1.0) */
  readonly affected_group_override_rate: number;
  /** Override rate for the control group (0.0-1.0) */
  readonly control_group_override_rate: number;
  /** Absolute difference in rates */
  readonly rate_difference: number;
  /** Ratio of rates (affected / control) */
  readonly rate_ratio: number;
  /** Sample size for affected group */
  readonly sample_size_affected: number;
  /** Sample size for control group */
  readonly sample_size_control: number;
  /** Statistical significance details */
  readonly statistical_significance?: BiasStatisticalSignificance;
}

/**
 * Minimum sample size for statistical validity.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.4
 */
export const MIN_BIAS_SAMPLE_SIZE = 30;

/**
 * Breakdown by rationale category.
 */
export interface BiasCategoryBreakdown {
  /** Rationale category */
  readonly rationale_category: RationaleCategory;
  /** Number of overrides in this category */
  readonly override_count: number;
  /** Percentage of total (0.0-1.0) */
  readonly percentage: number;
}

/**
 * Affected intervention kind breakdown.
 */
export interface BiasInterventionBreakdown {
  /** Intervention kind */
  readonly kind: ProposedInterventionKind;
  /** Override rate for this intervention kind (0.0-1.0) */
  readonly override_rate: number;
}

/**
 * Priority level for recommendations.
 */
export type BiasRecommendationPriority = 'high' | 'medium' | 'low';

/**
 * Recommended action for bias remediation.
 */
export type BiasRecommendationAction =
  | 'review_proposal_logic'
  | 'increase_clinician_routing'
  | 'model_recalibration'
  | 'training_data_review'
  | 'other';

/**
 * All valid recommendation actions as a readonly array for runtime validation.
 */
export const BIAS_RECOMMENDATION_ACTIONS: readonly BiasRecommendationAction[] = [
  'review_proposal_logic',
  'increase_clinician_routing',
  'model_recalibration',
  'training_data_review',
  'other',
] as const;

/**
 * Recommendation for bias remediation.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.4
 */
export interface BiasRecommendation {
  /** Priority of this recommendation */
  readonly priority: BiasRecommendationPriority;
  /** Recommended action */
  readonly action: BiasRecommendationAction;
  /** Human-readable description */
  readonly description: string;
}

/**
 * Regulatory context for bias detection.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.4
 */
export interface BiasRegulatoryContext {
  /** FDA requirement reference (e.g., "Post-market surveillance for demographic bias") */
  readonly fda_requirement?: string;
  /** Guidance reference (e.g., "FDA AI/ML Guidance 2025, Section 4.3") */
  readonly guidance_reference?: string;
  /** Whether reporting is required */
  readonly reporting_required: boolean;
  /** Deadline for reporting in days */
  readonly reporting_deadline_days?: number;
}

/**
 * Audit redaction for bias detection event.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.4
 */
export interface BiasDetectionAuditRedaction extends AuditRedactionBase {
  /** Type of bias detected */
  readonly detection_type: string;
  /** Severity of the bias */
  readonly severity: string;
  /** Affected dimension (e.g., "age_group:geriatric") */
  readonly affected_dimension: string;
  /** Rate difference (e.g., "18%") */
  readonly rate_difference: string;
  /** Sample sizes (e.g., "affected: 150, control: 200") */
  readonly sample_sizes?: string;
  /** Number of recommendations */
  readonly recommendations_count: number;
}

/**
 * Bias detection event for demographic bias reporting.
 * Organization-scoped, NOT patient-specific.
 *
 * Enables:
 * - FDA AI/ML post-market surveillance
 * - Demographic disparity monitoring
 * - Intervention type bias analysis
 * - Clinician specialty bias detection
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.4
 * @see schema/hermes-message.schema.json — $defs.BiasDetectionEvent
 */
export interface BiasDetectionEvent {
  /** Hermes protocol version */
  readonly hermes_version: HermesVersion;
  /** Message type discriminator */
  readonly message_type: 'bias_detection';

  /** Distributed tracing context */
  readonly trace: TraceContext;
  /** Operational mode */
  readonly mode: Mode;

  /** Organization scope (NOT patient-specific) */
  readonly organization_id: string;

  /** Unique identifier for this detection */
  readonly detection_id: string;
  /** Type of bias detected */
  readonly detection_type: BiasDetectionType;
  /** Severity of the bias */
  readonly severity: BiasSeverity;
  /** When the bias was detected */
  readonly detected_at: IsoDateTime;

  /** Analysis period */
  readonly analysis_period: BiasAnalysisPeriod;

  /** What dimension showed bias */
  readonly affected_dimension: BiasAffectedDimension;

  /** Statistical metrics */
  readonly metrics: BiasMetrics;

  /** Breakdown by rationale category */
  readonly breakdown_by_category?: readonly BiasCategoryBreakdown[];

  /** Affected intervention types */
  readonly affected_intervention_kinds?: readonly BiasInterventionBreakdown[];

  /** Recommendations for remediation */
  readonly recommendations: readonly BiasRecommendation[];

  /** Regulatory context */
  readonly regulatory_context?: BiasRegulatoryContext;

  /** PHI-minimized audit form */
  readonly audit_redaction: BiasDetectionAuditRedaction;
}

// =============================================================================
// Bias Detection Thresholds (Informational)
// =============================================================================

/**
 * Recommended detection thresholds for bias (deployments MAY adjust per policy).
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.4.1
 */
export const BIAS_DETECTION_THRESHOLDS = {
  /** Rate difference for warning severity */
  rate_difference_warning: 0.15,
  /** Rate difference for critical severity */
  rate_difference_critical: 0.25,
  /** Rate ratio for warning severity */
  rate_ratio_warning: 1.5,
  /** Rate ratio for critical severity */
  rate_ratio_critical: 2.0,
} as const;
