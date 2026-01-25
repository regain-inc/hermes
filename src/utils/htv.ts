/**
 * Hard-to-Vary (HTV) score computation utilities
 *
 * Based on David Deutsch's criterion: good explanations are those
 * where changing any detail would invalidate the explanation.
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 3
 * @see 00-overall-specs/0A-epistemology/01-hard-to-vary-explanations.md
 * @module utils/htv
 */

import type { HTVScore } from '../types/epistemology';
import { HTV_DEFAULT_WEIGHTS } from '../types/epistemology';

/**
 * Input dimensions for HTV score calculation.
 * Each dimension should be a value between 0.0 and 1.0.
 */
export interface HTVDimensions {
  /** How tightly coupled are the claim's components? (0.0-1.0) */
  readonly interdependence: number;

  /** How precise are the predictions? (0.0-1.0) */
  readonly specificity: number;

  /** Are all elements necessary? (0.0-1.0) */
  readonly parsimony: number;

  /** What would refute this claim? (0.0-1.0) */
  readonly falsifiability: number;
}

/**
 * Optional custom weights for HTV score dimensions.
 * If not provided, defaults to equal weights (0.25 each).
 */
export interface HTVWeights {
  readonly interdependence?: number;
  readonly specificity?: number;
  readonly parsimony?: number;
  readonly falsifiability?: number;
}

/**
 * Clamp a value to the range [0, 1].
 */
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Validate that a dimension value is in the range [0, 1].
 * Throws if the value is invalid.
 */
function validateDimension(name: string, value: number): void {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`HTV dimension '${name}' must be a number, got: ${typeof value}`);
  }
  if (value < 0 || value > 1) {
    throw new Error(`HTV dimension '${name}' must be between 0 and 1, got: ${value}`);
  }
}

/**
 * Compute HTV score from dimensions.
 *
 * The composite score is a weighted average of the four dimensions.
 * By default, all dimensions are equally weighted (0.25 each).
 *
 * @example
 * ```typescript
 * const score = computeHTVScore({
 *   interdependence: 0.9,
 *   specificity: 0.9,
 *   parsimony: 0.8,
 *   falsifiability: 0.9,
 * });
 * // score.composite = 0.875
 * ```
 *
 * @param dimensions - The four HTV dimensions (each 0.0-1.0)
 * @param weights - Optional custom weights (defaults to equal weights)
 * @returns Complete HTVScore with composite
 * @throws Error if dimensions are invalid
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 3.2
 */
export function computeHTVScore(dimensions: HTVDimensions, weights: HTVWeights = {}): HTVScore {
  // Validate dimensions
  validateDimension('interdependence', dimensions.interdependence);
  validateDimension('specificity', dimensions.specificity);
  validateDimension('parsimony', dimensions.parsimony);
  validateDimension('falsifiability', dimensions.falsifiability);

  // Apply weights (use defaults if not provided)
  const w = {
    interdependence: weights.interdependence ?? HTV_DEFAULT_WEIGHTS.interdependence,
    specificity: weights.specificity ?? HTV_DEFAULT_WEIGHTS.specificity,
    parsimony: weights.parsimony ?? HTV_DEFAULT_WEIGHTS.parsimony,
    falsifiability: weights.falsifiability ?? HTV_DEFAULT_WEIGHTS.falsifiability,
  };

  // Compute weighted composite
  const composite =
    w.interdependence * dimensions.interdependence +
    w.specificity * dimensions.specificity +
    w.parsimony * dimensions.parsimony +
    w.falsifiability * dimensions.falsifiability;

  return {
    interdependence: dimensions.interdependence,
    specificity: dimensions.specificity,
    parsimony: dimensions.parsimony,
    falsifiability: dimensions.falsifiability,
    composite: clamp01(composite),
  };
}

/**
 * Create a "poor" HTV score (all dimensions at minimum).
 * Useful for default/fallback scenarios.
 */
export function createPoorHTVScore(): HTVScore {
  return computeHTVScore({
    interdependence: 0,
    specificity: 0,
    parsimony: 0,
    falsifiability: 0,
  });
}

/**
 * Check if an HTV score meets a minimum threshold.
 *
 * @param score - The HTV score to check
 * @param threshold - Minimum acceptable composite score (default: 0.4)
 * @returns True if composite >= threshold
 */
export function meetsHTVThreshold(score: HTVScore, threshold = 0.4): boolean {
  return score.composite >= threshold;
}
