/**
 * Builder for SupervisionRequest messages
 * @module builders/supervision-request
 */

import type { ClinicalSnapshotPayload } from '../types/clinical-snapshot';
import type {
  CompositionMetadata,
  ContributingDomain,
  CrossDomainConflict,
} from '../types/composition';
import type { Mode, SubjectRef } from '../types/core';
import { CURRENT_HERMES_VERSION } from '../types/core';
import type { ProposedIntervention } from '../types/proposals';
import type { HealthStateSnapshotRef } from '../types/snapshot';
import type {
  FeedbackMetrics,
  InputRisk,
  OutputValidationResult,
  PriorOverride,
  SupervisionRequest,
  SupervisionRequestAuditRedaction,
  UnresolvedOverrideConflict,
} from '../types/supervision';
import { createTraceContext } from '../utils/trace';

/**
 * Options for creating a SupervisionRequest.
 */
export interface SupervisionRequestOptions {
  /** Operational mode */
  readonly mode: Mode;

  /** Patient subject reference */
  readonly subject: SubjectRef;

  /** Health state snapshot reference */
  readonly snapshot: HealthStateSnapshotRef;

  /** Proposed interventions (at least one required) */
  readonly proposals: readonly ProposedIntervention[];

  // Optional fields

  /** Inline clinical snapshot payload (v2.1: typed as ClinicalSnapshotPayload) */
  readonly snapshot_payload?: ClinicalSnapshotPayload;

  /** Idempotency key for replay protection */
  readonly idempotency_key?: string;

  /** PHI-minimized risk flags about the inputs */
  readonly input_risk?: InputRisk;

  /** Optional free-text notes */
  readonly notes?: string;

  /** Deutsch-side output validation result (v2.1: replaces hallucination_detection) */
  readonly output_validation?: OutputValidationResult;

  // Multi-domain composition fields

  /** Cross-domain conflicts */
  readonly cross_domain_conflicts?: readonly CrossDomainConflict[];

  /** Contributing domains */
  readonly contributing_domains?: readonly ContributingDomain[];

  /** Composition metadata */
  readonly composition_metadata?: CompositionMetadata;

  // Clinician feedback context

  /** Relevant prior overrides */
  readonly relevant_prior_overrides?: readonly PriorOverride[];

  /** Unresolved override conflicts */
  readonly unresolved_override_conflicts?: readonly UnresolvedOverrideConflict[];

  /** Feedback metrics */
  readonly feedback_metrics?: FeedbackMetrics;

  // Trace context options

  /** Service version for trace context */
  readonly service_version?: string;

  /** Ruleset version for trace context */
  readonly ruleset_version?: string;

  /** Model version for trace context */
  readonly model_version?: string;
}

/**
 * Creates a SupervisionRequest message.
 *
 * @param options - Request configuration
 * @returns A fully formed SupervisionRequest
 *
 * @example
 * ```typescript
 * const request = createSupervisionRequest({
 *   mode: 'advocate_clinical',
 *   subject: { subject_type: 'patient', subject_id: 'patient-123', organization_id: 'org-1' },
 *   snapshot: { snapshot_id: 'snap-1', created_at: createIsoDateTime(), sources: ['ehr'] },
 *   proposals: [medicationProposal],
 *   service_version: '1.0.0',
 * });
 * ```
 */
export function createSupervisionRequest(options: SupervisionRequestOptions): SupervisionRequest {
  const {
    mode,
    subject,
    snapshot,
    proposals,
    snapshot_payload,
    idempotency_key,
    input_risk,
    notes,
    output_validation,
    cross_domain_conflicts,
    contributing_domains,
    composition_metadata,
    relevant_prior_overrides,
    unresolved_override_conflicts,
    feedback_metrics,
    service_version = '1.0.0',
    ruleset_version,
    model_version,
  } = options;

  // Create trace context
  const trace = createTraceContext({
    system: 'deutsch',
    service_version,
    ...(ruleset_version && { ruleset_version }),
    ...(model_version && { model_version }),
  });

  // Build audit redaction
  const auditRedaction: SupervisionRequestAuditRedaction = {
    summary: `Supervision request with ${proposals.length} proposal(s)`,
    proposal_summaries: proposals.map((p) => p.audit_redaction.summary),
  };

  if (unresolved_override_conflicts && unresolved_override_conflicts.length > 0) {
    (auditRedaction as { has_unresolved_conflicts?: boolean }).has_unresolved_conflicts = true;
  }

  if (feedback_metrics?.alert_fatigue_indicators?.rapid_responses) {
    (auditRedaction as { alert_fatigue_warning?: boolean }).alert_fatigue_warning = true;
  }

  // Build request
  const request: SupervisionRequest = {
    hermes_version: CURRENT_HERMES_VERSION,
    message_type: 'supervision_request',
    trace,
    mode,
    subject,
    snapshot,
    proposals,
    audit_redaction: auditRedaction,
  };

  // Add optional fields
  if (snapshot_payload !== undefined) {
    (request as unknown as { snapshot_payload?: ClinicalSnapshotPayload }).snapshot_payload =
      snapshot_payload;
  }
  if (output_validation !== undefined) {
    (request as unknown as { output_validation?: OutputValidationResult }).output_validation =
      output_validation;
  }
  if (idempotency_key !== undefined) {
    (request as { idempotency_key?: string }).idempotency_key = idempotency_key;
  }
  if (input_risk !== undefined) {
    (request as { input_risk?: InputRisk }).input_risk = input_risk;
  }
  if (notes !== undefined) {
    (request as { notes?: string }).notes = notes;
  }
  if (cross_domain_conflicts !== undefined) {
    (
      request as { cross_domain_conflicts?: readonly CrossDomainConflict[] }
    ).cross_domain_conflicts = cross_domain_conflicts;
  }
  if (contributing_domains !== undefined) {
    (request as { contributing_domains?: readonly ContributingDomain[] }).contributing_domains =
      contributing_domains;
  }
  if (composition_metadata !== undefined) {
    (request as { composition_metadata?: CompositionMetadata }).composition_metadata =
      composition_metadata;
  }
  if (relevant_prior_overrides !== undefined) {
    (request as { relevant_prior_overrides?: readonly PriorOverride[] }).relevant_prior_overrides =
      relevant_prior_overrides;
  }
  if (unresolved_override_conflicts !== undefined) {
    (
      request as { unresolved_override_conflicts?: readonly UnresolvedOverrideConflict[] }
    ).unresolved_override_conflicts = unresolved_override_conflicts;
  }
  if (feedback_metrics !== undefined) {
    (request as { feedback_metrics?: FeedbackMetrics }).feedback_metrics = feedback_metrics;
  }

  return request;
}
