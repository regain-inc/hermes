/**
 * Multi-domain composition types for Hermes protocol
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.3.1
 * @see ../01-deutsch-specs/04-multi-domain-composition-spec.md
 * @module types/composition
 */

import type { AuditRedactionBase, SupervisionDecision } from './core';
import type { UncertaintyLevel } from './epistemology';
import type { EvidenceRef } from './evidence';

// =============================================================================
// Section 3.3.1: Domain Categories
// =============================================================================

/**
 * Domain categories for multi-domain composition.
 * Informational (NOT a priority hierarchy).
 * Deployments SHOULD prefer the core set for consistency.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.3.1
 * @see schema/hermes-message.schema.json — $defs.DomainCategory
 */
export type DomainCategory =
  | 'clinical'
  | 'lifestyle'
  | 'behavioral'
  | 'preventive'
  | 'rehabilitative'
  | 'other';

/**
 * All valid domain categories as a readonly array for runtime validation.
 */
export const DOMAIN_CATEGORIES: readonly DomainCategory[] = [
  'clinical',
  'lifestyle',
  'behavioral',
  'preventive',
  'rehabilitative',
  'other',
] as const;

// =============================================================================
// Section 3.3.1: Resolution Strategies
// =============================================================================

/**
 * Resolution strategies for cross-domain conflicts.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.3.1
 * @see schema/hermes-message.schema.json — $defs.ResolutionStrategy
 */
export type ResolutionStrategy =
  | 'override' // One domain's recommendation wins completely
  | 'constrain' // Modify recommendation with limits/adjustments
  | 'merge' // Combine compatible parts of recommendations
  | 'sequence' // Time-order the recommendations
  | 'escalate'; // Cannot auto-resolve; requires clinician

/**
 * All valid resolution strategies as a readonly array for runtime validation.
 */
export const RESOLUTION_STRATEGIES: readonly ResolutionStrategy[] = [
  'override',
  'constrain',
  'merge',
  'sequence',
  'escalate',
] as const;

/**
 * Confidence level in a resolution.
 */
export type ResolutionConfidence = 'low' | 'medium' | 'high';

// =============================================================================
// Section 3.3.1: Contributing Domain
// =============================================================================

/**
 * Domain contribution status.
 */
export type DomainStatus = 'success' | 'degraded' | 'failed';

/**
 * Data quality information for a domain.
 */
export interface DomainDataQuality {
  /** Staleness in seconds */
  readonly staleness_seconds: number;
  /** Signals that are missing */
  readonly missing_signals: readonly string[];
  /** Signals that have conflicting values */
  readonly conflicting_signals: readonly string[];
}

/**
 * Domain contribution tracking.
 * Every domain that attempted to participate MUST be included.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.3.1
 * @see schema/hermes-message.schema.json — $defs.ContributingDomain
 */
export interface ContributingDomain {
  /** Domain module identifier */
  readonly domain_id: string;
  /** Version of the domain module */
  readonly domain_version: string;
  /** Category of the domain */
  readonly domain_category: DomainCategory;
  /** Status of the domain's contribution */
  readonly status: DomainStatus;
  /** Reason for failure (if failed or degraded) */
  readonly failure_reason?: string;
  /** IDs of proposals from this domain */
  readonly proposal_ids: readonly string[];
  /** Data quality for this domain */
  readonly data_quality?: DomainDataQuality;
}

// =============================================================================
// Section 3.3.1: Cross-Domain Conflict
// =============================================================================

/**
 * Rule that triggered a conflict detection.
 */
export interface TriggeringRule {
  /** Rule identifier */
  readonly rule_id: string;
  /** Registry URI */
  readonly rule_source: string;
  /** Rule version */
  readonly rule_version: string;
}

/**
 * Uncertainty assessment for a conflict.
 */
export interface ConflictUncertainty {
  /** Categorical uncertainty level */
  readonly level: UncertaintyLevel;
  /** Additional notes */
  readonly notes?: string;
}

/**
 * Cross-domain conflict representation.
 * Surfaced by Deutsch for Popper's independent evaluation.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.3.1
 * @see schema/hermes-message.schema.json — $defs.CrossDomainConflict
 */
export interface CrossDomainConflict {
  /** Unique identifier for this conflict */
  readonly conflict_id: string;

  /**
   * Conflict classification (extensible, not a closed enum).
   * Core types: drug_nutrient_interaction, drug_activity_contraindication,
   * condition_nutrient_restriction, condition_activity_restriction,
   * temporal_scheduling, resource_competition, guideline_disagreement,
   * uncertainty_propagation
   */
  readonly conflict_type: string;

  /** Which rule detected this conflict */
  readonly triggering_rule: TriggeringRule;

  /** Which domains conflicted (domain_ids) */
  readonly conflicting_domains: readonly string[];

  /** Which proposals were involved */
  readonly conflicting_proposal_ids: readonly string[];

  /**
   * What each domain originally proposed (before resolution).
   * Maps domain_id to original recommendation.
   */
  readonly original_proposals: Record<string, string>;

  /** How the conflict was resolved */
  readonly resolution_strategy: ResolutionStrategy;

  /** The merged/modified proposal (absent if escalate) */
  readonly resolved_proposal_id?: string;

  /** Confidence in the resolution */
  readonly resolution_confidence: ResolutionConfidence;

  /** Evidence supporting the resolution */
  readonly evidence_refs: readonly EvidenceRef[];

  /** Uncertainty assessment */
  readonly uncertainty: ConflictUncertainty;

  /** PHI-safe audit form */
  readonly audit_redaction: AuditRedactionBase;
}

// =============================================================================
// Section 3.3.1: Composition Metadata
// =============================================================================

/**
 * Registry loaded for composition.
 */
export interface LoadedRegistry {
  /** Registry reference URI */
  readonly registry_ref: string;
  /** Registry version */
  readonly registry_version: string;
  /** Number of rules loaded */
  readonly rule_count: number;
}

/**
 * Rule engine health status.
 */
export type RuleEngineStatus = 'healthy' | 'degraded' | 'failed';

/**
 * Composition metadata for audit and reproducibility.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.3.1
 * @see schema/hermes-message.schema.json — $defs.CompositionMetadata
 */
export interface CompositionMetadata {
  /** Version of the composer module */
  readonly composer_version: string;

  /** Which registries were loaded */
  readonly registries_loaded: readonly LoadedRegistry[];

  /**
   * Computed priorities at time of composition.
   * Maps domain_id to priority (1-100).
   */
  readonly priority_snapshot: Record<string, number>;

  /** Rule engine health status */
  readonly rule_engine_status: RuleEngineStatus;
}

// =============================================================================
// Section 3.5: Conflict Evaluation
// =============================================================================

/**
 * Popper's evaluation of a cross-domain conflict resolution.
 * Explanatory only; any override MUST be reflected in the decision.
 *
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.5
 * @see schema/hermes-message.schema.json — $defs.ConflictEvaluation
 */
export interface ConflictEvaluation {
  /** Which conflict this evaluation applies to */
  readonly conflict_id: string;
  /** Whether Popper agrees with Deutsch's resolution */
  readonly popper_agrees_with_resolution: boolean;
  /** If Popper overrides, what decision */
  readonly override_decision?: SupervisionDecision;
  /** Reason for override */
  readonly override_reason?: string;
}
