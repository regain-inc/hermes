/**
 * @regain/hermes - Main entry point
 * Hermes protocol types, validation, and utilities.
 *
 * @module @regain/hermes
 */

// Version
export { version } from './version';
export { CURRENT_HERMES_VERSION } from './types/core';

// Export types
export type { HermesConfig, HermesOptions } from './types';

// Export core functionality
export { Hermes } from './hermes';

// =============================================================================
// Schema Validation
// =============================================================================

export {
  validateHermesMessage,
  parseHermesMessage,
  isValidHermesMessage,
  HermesValidationError,
} from './schema/validator';

export type { ValidationResult, ValidationErrorDetail } from './schema/validator';

// =============================================================================
// Core Types
// =============================================================================

export type {
  HermesVersion,
  IsoDateTime,
  Mode,
  TraceProducer,
  TraceSignature,
  TraceContext,
  SubjectRef,
  AuditRedactionBase,
  ReasonCode,
  SupervisionDecision,
  ProposedInterventionKind,
} from './types/core';

export {
  MODES,
  REASON_CODES,
  SUPERVISION_DECISIONS,
  PROPOSED_INTERVENTION_KINDS,
} from './types/core';

// =============================================================================
// Epistemology Types
// =============================================================================

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

// =============================================================================
// Message Types
// =============================================================================

export type { HermesMessage, HermesMessageType } from './types/messages';

export type {
  SupervisionRequest,
  SupervisionResponse,
  PerProposalDecision,
  ApprovedConstraints,
} from './types/supervision';

export type { AuditEvent, AuditEventType } from './types/audit';
export type { ClinicianFeedbackEvent } from './types/feedback';
export type { HermesError, HermesErrorCode } from './types/errors';
export type { BiasDetectionEvent } from './types/bias';

// =============================================================================
// Proposal Types
// =============================================================================

export type {
  ProposedIntervention,
  ProposedInterventionBase,
  CareNavigationProposal,
  TriageRouteProposal,
  MedicationOrderProposal,
  PatientMessageProposal,
  LifestyleModificationProposal,
  NutritionPlanProposal,
  BehavioralInterventionProposal,
  OtherProposal,
} from './types/proposals';

// =============================================================================
// Utilities
// =============================================================================

export { computeHTVScore, createPoorHTVScore, meetsHTVThreshold } from './utils/htv';
export type { HTVDimensions, HTVWeights } from './utils/htv';

export {
  computeUncertainty,
  createLowUncertainty,
  isUncertaintyAcceptable,
  UNCERTAINTY_THRESHOLDS,
} from './utils/uncertainty';
export type { UncertaintyInputs } from './utils/uncertainty';

// =============================================================================
// Builders
// =============================================================================

export {
  createFalsificationCriteria,
  createUniformHTVScore,
  HTVScoreBuilder,
  htvScore,
} from './builders/epistemology';
export type { FalsificationCriteriaOptions } from './builders/epistemology';
