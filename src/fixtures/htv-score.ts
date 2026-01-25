/**
 * HTVScore fixtures for testing and examples.
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 3.4
 * @module fixtures/htv-score
 */

import type { HTVScore } from '../types/epistemology';

/**
 * Excellent HTV score example.
 * Represents a hard-to-vary explanation with high quality on all dimensions.
 * Composite >= 0.9 indicates excellent quality.
 *
 * Example use case: Medication recommendation based on multiple RCTs,
 * with specific dosing, clear monitoring parameters, and documented
 * contraindication conditions.
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 3.3
 */
export const excellentHTVScore: HTVScore = {
  interdependence: 0.95,
  specificity: 0.95,
  parsimony: 0.9,
  falsifiability: 0.95,
  composite: 0.9375,
};

/**
 * Good HTV score example.
 * Represents a solid hard-to-vary explanation.
 * Composite >= 0.7 indicates good quality suitable for autonomous action.
 *
 * Example use case: Lifestyle recommendation supported by cohort studies,
 * with measurable targets and defined evaluation criteria.
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 3.3
 */
export const goodHTVScore: HTVScore = {
  interdependence: 0.9,
  specificity: 0.9,
  parsimony: 0.8,
  falsifiability: 0.9,
  composite: 0.875,
};

/**
 * Moderate HTV score example.
 * Indicates explanation with room for improvement.
 * Composite 0.4-0.7 suggests uncertainty disclosure and conservative action.
 *
 * Example use case: Diagnostic hypothesis based on pattern recognition
 * but missing confirmatory tests or clear refutation conditions.
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 3.3
 */
export const moderateHTVScore: HTVScore = {
  interdependence: 0.6,
  specificity: 0.5,
  parsimony: 0.6,
  falsifiability: 0.5,
  composite: 0.55,
};

/**
 * Poor HTV score example (triggers IDK protocol).
 * Indicates an easy-to-vary explanation that should be rejected.
 * Composite 0.3-0.4 triggers IDK Protocol or routes to clinician.
 *
 * Example use case: Vague recommendation without specific evidence,
 * unclear falsification conditions, or excessive ad-hoc elements.
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 3.3
 */
export const poorHTVScore: HTVScore = {
  interdependence: 0.2,
  specificity: 0.1,
  parsimony: 0.3,
  falsifiability: 0.1,
  composite: 0.175,
};

/**
 * Borderline HTV score at the good/moderate threshold.
 * Useful for testing threshold behavior.
 */
export const borderlineGoodHTVScore: HTVScore = {
  interdependence: 0.7,
  specificity: 0.7,
  parsimony: 0.7,
  falsifiability: 0.7,
  composite: 0.7,
};

/**
 * Borderline HTV score at the moderate/poor threshold.
 * Useful for testing IDK Protocol trigger.
 */
export const borderlinePoorHTVScore: HTVScore = {
  interdependence: 0.4,
  specificity: 0.4,
  parsimony: 0.4,
  falsifiability: 0.4,
  composite: 0.4,
};

/**
 * Refuted HTV score (below 0.3).
 * Indicates failed hypothesis that should not proceed.
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 3.3
 */
export const refutedHTVScore: HTVScore = {
  interdependence: 0.2,
  specificity: 0.15,
  parsimony: 0.25,
  falsifiability: 0.1,
  composite: 0.175,
};

/**
 * Unbalanced HTV score with weak falsifiability.
 * Demonstrates a claim that is otherwise solid but lacks clear refutation conditions.
 * This pattern should trigger additional scrutiny even with high composite.
 */
export const weakFalsifiabilityHTVScore: HTVScore = {
  interdependence: 0.9,
  specificity: 0.85,
  parsimony: 0.85,
  falsifiability: 0.3,
  composite: 0.725,
};

/**
 * Unbalanced HTV score with weak specificity.
 * Demonstrates a claim with vague predictions despite strong other dimensions.
 */
export const weakSpecificityHTVScore: HTVScore = {
  interdependence: 0.85,
  specificity: 0.3,
  parsimony: 0.9,
  falsifiability: 0.85,
  composite: 0.725,
};
