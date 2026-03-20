/**
 * Compliance observation types for accreditation workflows.
 * Used by the accreditation system to track facility compliance observations
 * from FHIR data extraction, attestations, and evaluations.
 *
 * @module types/compliance
 */

import type { IsoDateTime } from './core';

// =============================================================================
// Section 8.1: Compliance Observation
// =============================================================================

/**
 * Supported accrediting bodies.
 * @see schema/hermes-message.schema.json — $defs.Accreditor
 */
export type Accreditor = 'iac' | 'acr' | 'urac' | 'jc';

/**
 * All valid accreditors as a readonly array for runtime validation.
 */
export const ACCREDITORS: readonly Accreditor[] = ['iac', 'acr', 'urac', 'jc'] as const;

/**
 * How the observation was captured.
 * @see schema/hermes-message.schema.json — $defs.ObservationType
 */
export type ObservationType = 'automated' | 'attestation' | 'document';

/**
 * All valid observation types as a readonly array for runtime validation.
 */
export const OBSERVATION_TYPES: readonly ObservationType[] = [
  'automated',
  'attestation',
  'document',
] as const;

/**
 * Source system that produced the observation.
 * @see schema/hermes-message.schema.json — $defs.ObservationSource
 */
export type ObservationSourceType = 'fhir' | 'popper_audit' | 'human_input' | 'document_upload';

/**
 * All valid observation source types as a readonly array for runtime validation.
 */
export const OBSERVATION_SOURCE_TYPES: readonly ObservationSourceType[] = [
  'fhir',
  'popper_audit',
  'human_input',
  'document_upload',
] as const;

/**
 * Provenance of a compliance observation — where the data came from.
 */
export interface ObservationSource {
  readonly type: ObservationSourceType;
  readonly fhir_resource_type?: string;
  readonly fhir_resource_id?: string;
  readonly popper_trace_id?: string;
  readonly attester_id?: string;
}

/**
 * A single compliance data point observed at a facility.
 * These are the atomic units of evidence for accreditation evaluation.
 *
 * @see schema/hermes-message.schema.json — $defs.ComplianceObservation
 */
export interface ComplianceObservation {
  readonly observation_id: string;
  readonly facility_id: string;
  readonly accreditor: Accreditor;
  readonly modality: string;
  readonly standard_id: string;
  readonly requirement_id: string;
  readonly observation_type: ObservationType;
  readonly source: ObservationSource;
  readonly value: unknown;
  readonly timestamp: IsoDateTime;
  readonly evidence_hash?: string;
}

// =============================================================================
// Section 8.2: Compliance Levels and Findings
// =============================================================================

/**
 * Compliance assessment level for a standard or facility.
 * @see schema/hermes-message.schema.json — $defs.ComplianceLevel
 */
export type ComplianceLevel =
  | 'compliant'
  | 'non_compliant'
  | 'partial'
  | 'not_evaluated'
  | 'attestation_pending';

/**
 * All valid compliance levels as a readonly array for runtime validation.
 * Ordered by severity (worst first) for comparison logic.
 */
export const COMPLIANCE_LEVELS: readonly ComplianceLevel[] = [
  'non_compliant',
  'partial',
  'attestation_pending',
  'not_evaluated',
  'compliant',
] as const;

/**
 * A single finding within a compliance evaluation.
 */
export interface ComplianceFinding {
  readonly requirement_id: string;
  readonly level: ComplianceLevel;
  readonly message: string;
  readonly evidence_refs: readonly string[];
}

/**
 * Per-standard compliance status for a facility.
 */
export interface ComplianceStatus {
  readonly facility_id: string;
  readonly accreditor: Accreditor;
  readonly modality: string;
  readonly standard_id: string;
  readonly level: ComplianceLevel;
  readonly findings: readonly ComplianceFinding[];
  readonly evaluated_at: IsoDateTime;
}
