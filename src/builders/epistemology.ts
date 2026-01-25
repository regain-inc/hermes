/**
 * Builder functions for epistemology types
 *
 * Provides factory functions for creating epistemological types
 * with validation and sensible defaults.
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md
 * @module builders/epistemology
 */

import type { FalsificationCriteria, HTVScore, RefutationAction } from '../types/epistemology';
import { type HTVWeights, computeHTVScore } from '../utils/htv';
import { computeUncertainty, createLowUncertainty } from '../utils/uncertainty';

// Re-export computation functions for convenience
export { computeHTVScore, computeUncertainty, createLowUncertainty };

/**
 * Options for creating falsification criteria.
 */
export interface FalsificationCriteriaOptions {
  /** Time window for observing outcomes (days) */
  readonly observationWindowDays?: number;

  /** Action to take if refutation conditions are met */
  readonly refutationAction?: RefutationAction;
}

/**
 * Create falsification criteria for a clinical claim.
 *
 * Per Popperian epistemology, every scientific claim must specify
 * what would refute it. This function helps create properly structured
 * falsification criteria.
 *
 * @example
 * ```typescript
 * const criteria = createFalsificationCriteria(
 *   'proposal-123',
 *   ['If serum potassium > 5.5 mEq/L post-titration'],
 *   ['serum_potassium', 'serum_creatinine'],
 *   {
 *     observationWindowDays: 14,
 *     refutationAction: 'route_to_clinician',
 *   }
 * );
 * ```
 *
 * @param claimId - The ID of the claim/proposal
 * @param conditions - Observable conditions that would refute the claim
 * @param measures - Specific metrics to monitor for refutation
 * @param options - Additional options (observation window, action)
 * @returns Complete falsification criteria
 */
export function createFalsificationCriteria(
  claimId: string,
  conditions: readonly string[],
  measures: readonly string[],
  options?: FalsificationCriteriaOptions
): FalsificationCriteria {
  if (!claimId || claimId.trim() === '') {
    throw new Error('claimId is required');
  }
  if (conditions.length === 0) {
    throw new Error('At least one refutation condition is required');
  }
  if (measures.length === 0) {
    throw new Error('At least one outcome measure is required');
  }

  const result: FalsificationCriteria = {
    claim_id: claimId,
    refutation_conditions: conditions,
    outcome_measures: measures,
  };

  if (options?.observationWindowDays !== undefined) {
    (result as { observation_window_days?: number }).observation_window_days =
      options.observationWindowDays;
  }
  if (options?.refutationAction !== undefined) {
    (result as { refutation_action?: RefutationAction }).refutation_action =
      options.refutationAction;
  }

  return result;
}

/**
 * Create an HTV score with all dimensions set to the same value.
 * Useful for testing or creating baseline scores.
 *
 * @param value - The value for all dimensions (0.0-1.0)
 * @returns HTVScore with uniform dimensions
 */
export function createUniformHTVScore(value: number): HTVScore {
  return computeHTVScore({
    interdependence: value,
    specificity: value,
    parsimony: value,
    falsifiability: value,
  });
}

/**
 * Builder class for creating HTVScore with a fluent interface.
 */
export class HTVScoreBuilder {
  private interdependence = 0;
  private specificity = 0;
  private parsimony = 0;
  private falsifiability = 0;
  private weights: HTVWeights = {};

  /** Set the interdependence dimension */
  withInterdependence(value: number): this {
    this.interdependence = value;
    return this;
  }

  /** Set the specificity dimension */
  withSpecificity(value: number): this {
    this.specificity = value;
    return this;
  }

  /** Set the parsimony dimension */
  withParsimony(value: number): this {
    this.parsimony = value;
    return this;
  }

  /** Set the falsifiability dimension */
  withFalsifiability(value: number): this {
    this.falsifiability = value;
    return this;
  }

  /** Set custom weights */
  withWeights(weights: HTVWeights): this {
    this.weights = weights;
    return this;
  }

  /** Build the final HTVScore */
  build(): HTVScore {
    return computeHTVScore(
      {
        interdependence: this.interdependence,
        specificity: this.specificity,
        parsimony: this.parsimony,
        falsifiability: this.falsifiability,
      },
      this.weights
    );
  }
}

/**
 * Create a new HTV score builder.
 *
 * @example
 * ```typescript
 * const score = htvScore()
 *   .withInterdependence(0.9)
 *   .withSpecificity(0.9)
 *   .withParsimony(0.8)
 *   .withFalsifiability(0.9)
 *   .build();
 * ```
 */
export function htvScore(): HTVScoreBuilder {
  return new HTVScoreBuilder();
}
