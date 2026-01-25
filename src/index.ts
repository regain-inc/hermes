/**
 * @regain/hermes - Main entry point
 */

export { version } from './version';

// Export types
export type { HermesConfig, HermesOptions } from './types';

// Export core functionality
export { Hermes } from './hermes';

// Export epistemology types
export type {
  ClaimType,
  ClaimRiskLevel,
  ClaimTypeRiskProfile,
  EvidenceGrade,
  HTVScore,
  HTVQualityLevel,
  UncertaintyLevel,
  UncertaintyFactorType,
  UncertaintyDriver,
  UncertaintyCalibration,
  RefutationAction,
  FalsificationCriteria,
} from './types/epistemology';

export {
  CLAIM_TYPE_RISK,
  CLAIM_TYPES,
  EVIDENCE_GRADE_STRENGTH,
  EVIDENCE_GRADES,
  compareEvidenceGrades,
  getEffectiveEvidenceGrade,
  HTV_DEFAULT_WEIGHTS,
  getHTVQualityLevel,
  REFUTATION_ACTIONS,
} from './types/epistemology';

// Export epistemology utilities
export { computeHTVScore, createPoorHTVScore, meetsHTVThreshold } from './utils/htv';
export type { HTVDimensions, HTVWeights } from './utils/htv';

export {
  computeUncertainty,
  createLowUncertainty,
  isUncertaintyAcceptable,
  UNCERTAINTY_THRESHOLDS,
} from './utils/uncertainty';
export type { UncertaintyInputs } from './utils/uncertainty';

// Export builders
export {
  createFalsificationCriteria,
  createUniformHTVScore,
  HTVScoreBuilder,
  htvScore,
} from './builders/epistemology';
export type { FalsificationCriteriaOptions } from './builders/epistemology';
