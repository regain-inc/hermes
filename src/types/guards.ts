/**
 * Type guards for runtime type checking
 * @module types/guards
 */

import type {
  HermesVersion,
  Mode,
  ReasonCode,
  SupervisionDecision,
  ProposedInterventionKind,
  TraceProducer,
  SubjectRef,
} from './core';

import {
  MODES,
  REASON_CODES,
  SUPERVISION_DECISIONS,
  PROPOSED_INTERVENTION_KINDS,
} from './core';

// Re-export isIsoDateTime from datetime utils for convenience
export { isIsoDateTime } from '../utils/datetime';

/**
 * Pattern for HermesVersion validation (semver format).
 */
export const HERMES_VERSION_PATTERN: RegExp = /^\d+\.\d+\.\d+$/;

/**
 * Type guard to check if a value is a valid HermesVersion.
 * @param value - The value to check
 * @returns True if the value matches semver format
 */
export function isHermesVersion(value: unknown): value is HermesVersion {
  if (typeof value !== 'string') {
    return false;
  }
  return HERMES_VERSION_PATTERN.test(value);
}

/**
 * Type guard to check if a value is a valid Mode.
 * @param value - The value to check
 * @returns True if the value is a valid Mode
 */
export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && MODES.includes(value as Mode);
}

/**
 * Type guard to check if a value is a valid ReasonCode.
 * @param value - The value to check
 * @returns True if the value is a valid ReasonCode
 */
export function isReasonCode(value: unknown): value is ReasonCode {
  return typeof value === 'string' && REASON_CODES.includes(value as ReasonCode);
}

/**
 * Type guard to check if a value is a valid SupervisionDecision.
 * @param value - The value to check
 * @returns True if the value is a valid SupervisionDecision
 */
export function isSupervisionDecision(
  value: unknown
): value is SupervisionDecision {
  return (
    typeof value === 'string' &&
    SUPERVISION_DECISIONS.includes(value as SupervisionDecision)
  );
}

/**
 * Type guard to check if a value is a valid ProposedInterventionKind.
 * @param value - The value to check
 * @returns True if the value is a valid ProposedInterventionKind
 */
export function isProposedInterventionKind(
  value: unknown
): value is ProposedInterventionKind {
  return (
    typeof value === 'string' &&
    PROPOSED_INTERVENTION_KINDS.includes(value as ProposedInterventionKind)
  );
}

/**
 * Type guard to check if a value is a valid TraceProducer.
 * @param value - The value to check
 * @returns True if the value is a valid TraceProducer
 */
export function isTraceProducer(value: unknown): value is TraceProducer {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  const validSystems = ['deutsch', 'popper', 'gateway', 'other'];
  return (
    typeof obj.system === 'string' &&
    validSystems.includes(obj.system) &&
    typeof obj.service_version === 'string' &&
    (obj.ruleset_version === undefined ||
      typeof obj.ruleset_version === 'string') &&
    (obj.model_version === undefined || typeof obj.model_version === 'string')
  );
}

/**
 * Type guard to check if a value is a valid SubjectRef.
 * @param value - The value to check
 * @returns True if the value is a valid SubjectRef
 */
export function isSubjectRef(value: unknown): value is SubjectRef {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    obj.subject_type === 'patient' &&
    typeof obj.subject_id === 'string' &&
    (obj.organization_id === undefined ||
      typeof obj.organization_id === 'string')
  );
}
