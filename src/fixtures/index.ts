/**
 * Fixtures module - Test fixtures and examples for Hermes messages.
 * @module fixtures
 */

// SupervisionRequest fixtures
export {
  minimalSupervisionRequest,
  fullSupervisionRequest,
  medicationSupervisionRequest,
  triageSupervisionRequest,
  requestWithPriorOverrides,
  wellnessSupervisionRequest,
} from './supervision-request';

// SupervisionResponse fixtures
export {
  approvedSupervisionResponse,
  approvedWithConstraintsResponse,
  routeSupervisionResponse,
  hardStopSupervisionResponse,
  requestMoreInfoResponse,
  partialApprovalResponse,
  responseWithControlCommands,
} from './supervision-response';

// ClinicianFeedback fixtures
export {
  acceptedFeedback,
  rejectedPermanentFeedback,
  modifiedFeedback,
  deferredFeedback,
  conflictingFeedback,
} from './clinician-feedback';

// AuditEvent fixtures
export {
  supervisionRequestSentEvent,
  supervisionRequestReceivedEvent,
  supervisionResponseDecidedEvent,
  controlCommandIssuedEvent,
  safeModeEnabledEvent,
  validationFailedEvent,
  outputReturnedEvent,
  otherAuditEvent,
} from './audit-event';

// Evidence fixtures
export {
  systematicReviewEvidence,
  rctEvidence,
  cohortEvidence,
  expertOpinionEvidence,
  patientReportedEvidence,
  calculatedEvidence,
  policyEvidence,
  drugInteractionEvidence,
  imagingEvidence,
} from './evidence';

// HTV Score fixtures
export {
  excellentHTVScore,
  goodHTVScore,
  moderateHTVScore,
  poorHTVScore,
  borderlineGoodHTVScore,
  borderlinePoorHTVScore,
  refutedHTVScore,
  weakFalsifiabilityHTVScore,
  weakSpecificityHTVScore,
} from './htv-score';

// Control v2 conformance fixtures
export { coreSettingsFixture, coreSettingsCommand } from './control-v2-core-settings.fixture';
export { emergencyModeFixture, emergencyModeCommand } from './control-v2-emergency-mode.fixture';
export {
  atomicRejectionFixture,
  atomicRejectionCommand,
} from './control-v2-atomic-rejection.fixture';
