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
  VendorIdentifier,
  VendorRiskTier,
} from './types/core';

export {
  MODES,
  REASON_CODES,
  SUPERVISION_DECISIONS,
  PROPOSED_INTERVENTION_KINDS,
  VENDOR_RISK_TIERS,
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
  // SAL-508: Auto-Refutation types
  ExpectedDirection,
  ObservedTrend,
  PredictionFailureReason,
  FailedPrediction,
  RefutationTrigger,
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
// Clinical Snapshot Types (v2.2)
// =============================================================================

export type {
  ClinicalSnapshotPayload,
  ActiveMedication,
  MedicationStatus,
  LabValue,
  LabFlag,
  Condition as SnapshotCondition,
  ConditionStatus,
  VitalSign,
  VitalSignType,
  MedicationAllergy,
  AllergyReactionType,
  AllergySeverity,
  NativeGrading,
  HFAssessment,
  HFPhenotype,
  NYHAClass,
  AcuteStatus,
  AccessContext,
} from './types/clinical-snapshot';

export { HF_PHENOTYPES, NYHA_CLASSES } from './types/clinical-snapshot';

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

export { canonicalJsonStringify, computeSnapshotHash } from './utils/canonical-json';

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

// =============================================================================
// Control v2 Types
// =============================================================================

export type {
  ControlCommandV2Kind,
  CommandPriority,
  OperationalMode,
  SettingValue,
  ControlCommandSource,
  ControlCommandTarget,
  OperationalSettingChange,
  SafeModeConfigV2,
  ModeTransition,
  ControlCommandV2,
  ControlCommandStatus,
  SettingApplicationResult,
  OperationalStateSnapshot,
  DeferredInfo,
  ControlResponseSource,
  ControlCommandResponse,
} from './types/control-v2';

export {
  CONTROL_COMMAND_V2_KINDS,
  COMMAND_PRIORITIES,
  OPERATIONAL_MODES,
  CONTROL_COMMAND_STATUSES,
} from './types/control-v2';

// =============================================================================
// Operational Settings Catalog
// =============================================================================

export type {
  SettingAffectsPoint,
  SettingType,
  OperationalSettingDefinition,
} from './types/operational-settings-catalog';

export {
  SETTING_AFFECTS_POINTS,
  SETTING_TYPES,
  OPERATIONAL_SETTINGS_CATALOG,
  SETTINGS_CATALOG_VERSION,
  getSettingDefinition,
  getCoreSettings,
  getExtensionSettings,
  getTA1ControlSettings,
  getAllSettingKeys,
  getDefaultSettings,
  getSafeModeLockValues,
  validateSettingValue,
} from './types/operational-settings-catalog';

// =============================================================================
// Control v2 Builders
// =============================================================================

export { createControlCommandV2 } from './builders/control-command-v2';
export type { ControlCommandV2Options } from './builders/control-command-v2';
export { createControlCommandResponse } from './builders/control-command-response';
export type { ControlCommandResponseOptions } from './builders/control-command-response';

// =============================================================================
// Migration Helpers
// =============================================================================

export {
  mapV1ToV2,
  mapV2SettingToV1,
  V1_TO_V2_KEY_MAP,
  V1_REMOVED_KEYS,
} from './utils/control-migration';

// =============================================================================
// Governance Types (v2.3.0)
// =============================================================================

export type {
  ApprovalStatus,
  ApprovalMethod,
  GovernanceApproval,
} from './types/governance';

export {
  APPROVAL_STATUSES,
  APPROVAL_METHODS,
} from './types/governance';
