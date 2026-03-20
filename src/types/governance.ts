/**
 * Governance types for Hermes protocol (v2.3.0)
 *
 * Canonical governance approval, change control, risk classification,
 * source relationship, and verification evidence types.
 *
 * Regulatory grounding:
 * - FDA QMSR (eff. Feb 2, 2026) — incorporates ISO 13485:2016
 * - FDA PCCP Final Guidance (Dec 4, 2024) — 3 required components
 * - IEC 62304 — software lifecycle, safety classification A/B/C
 * - ISO 14971:2019 — risk management, severity/probability/detectability
 *
 * Replaces ad-hoc GovernanceApproval in Popper and Accreditation repos.
 * All 5 repos consume these types via @regain/hermes.
 *
 * @module types/governance
 * @since v2.3.0
 */

import type { IsoDateTime } from './core';

// =============================================================================
// Section 9.1: Approval Status & Method
// =============================================================================

/**
 * Lifecycle status of a governance approval.
 * Ordered by progression: draft → evidence_reviewed → clinical_review_pending →
 * conditionally_approved → approved → suspended → retired.
 */
export type ApprovalStatus =
  | 'draft' // Written, not yet reviewed
  | 'evidence_reviewed' // Evidence basis validated (literature review)
  | 'clinical_review_pending' // Awaiting clinical board/reviewer sign-off
  | 'conditionally_approved' // Approved with conditions (time-limited, site-specific)
  | 'approved' // Fully approved by clinical governance
  | 'suspended' // Temporarily suspended pending re-review
  | 'retired'; // No longer active

export const APPROVAL_STATUSES: readonly ApprovalStatus[] = [
  'draft',
  'evidence_reviewed',
  'clinical_review_pending',
  'conditionally_approved',
  'approved',
  'suspended',
  'retired',
] as const;

/**
 * Method used to validate or approve a rule/threshold.
 */
export type ApprovalMethod =
  | 'literature_review' // PubMed/guideline-based evidence review
  | 'clinical_board_vote' // Formal clinical governance board decision
  | 'individual_sign_off' // Single clinician sign-off (e.g., medical director)
  | 'regulatory_mandate' // FDA label, accreditor requirement — no discretion
  | 'statistical_derivation' // Threshold derived from statistical methodology
  | 'operational_default'; // Pragmatic default, no external evidence

export const APPROVAL_METHODS: readonly ApprovalMethod[] = [
  'literature_review',
  'clinical_board_vote',
  'individual_sign_off',
  'regulatory_mandate',
  'statistical_derivation',
  'operational_default',
] as const;

// =============================================================================
// Section 9.2: Verification Evidence (IEC 62304 §5.7, ISO 13485 §7.3.6)
// =============================================================================

/**
 * Type of verification test performed.
 */
export type VerificationTestType =
  | 'unit_test'
  | 'integration_test'
  | 'system_test'
  | 'regression_test'
  | 'clinical_scenario_test'
  | 'adversarial_test'
  | 'manual_review';

export const VERIFICATION_TEST_TYPES: readonly VerificationTestType[] = [
  'unit_test',
  'integration_test',
  'system_test',
  'regression_test',
  'clinical_scenario_test',
  'adversarial_test',
  'manual_review',
] as const;

/**
 * Result of a verification test.
 */
export type VerificationResult = 'pass' | 'fail' | 'inconclusive' | 'not_run';

export const VERIFICATION_RESULTS: readonly VerificationResult[] = [
  'pass',
  'fail',
  'inconclusive',
  'not_run',
] as const;

/**
 * Evidence that a change or rule was verified.
 * Maps to IEC 62304 §5.7 (software verification) and ISO 13485 §7.3.6 (design verification).
 */
export interface VerificationEvidence {
  /** Unique test identifier (e.g., "VE-2026-0042") */
  readonly test_id: string;
  /** Type of test performed */
  readonly test_type: VerificationTestType;
  /** Test result */
  readonly result: VerificationResult;
  /** When the test was executed */
  readonly executed_at: IsoDateTime;
  /** Path to test artifact (test file, report, screenshot) */
  readonly artifact_path?: string;
  /** Human-readable description of what was tested */
  readonly description?: string;
}

// =============================================================================
// Section 9.3: Risk Classification (IEC 62304 §4.3, ISO 14971)
// =============================================================================

/**
 * IEC 62304 software safety classification.
 * - A: No contribution to hazardous situation
 * - B: Can contribute to hazardous situation, not class C
 * - C: Can cause or contribute to death or serious injury
 */
export type SafetyClass = 'A' | 'B' | 'C';

export const SAFETY_CLASSES: readonly SafetyClass[] = ['A', 'B', 'C'] as const;

/**
 * ISO 14971 severity level.
 */
export type RiskSeverity = 'negligible' | 'minor' | 'serious' | 'critical' | 'catastrophic';

export const RISK_SEVERITIES: readonly RiskSeverity[] = [
  'negligible',
  'minor',
  'serious',
  'critical',
  'catastrophic',
] as const;

/**
 * ISO 14971 probability of occurrence.
 */
export type RiskProbability = 'improbable' | 'remote' | 'occasional' | 'probable' | 'frequent';

export const RISK_PROBABILITIES: readonly RiskProbability[] = [
  'improbable',
  'remote',
  'occasional',
  'probable',
  'frequent',
] as const;

/**
 * Detectability of a hazardous situation before harm occurs.
 */
export type RiskDetectability = 'high' | 'moderate' | 'low' | 'undetectable';

export const RISK_DETECTABILITIES: readonly RiskDetectability[] = [
  'high',
  'moderate',
  'low',
  'undetectable',
] as const;

/**
 * Risk classification for a rule, change, or software component.
 * Combines IEC 62304 safety class with ISO 14971 risk dimensions.
 */
export interface RiskClassification {
  /** IEC 62304 software safety class */
  readonly safety_class: SafetyClass;
  /** ISO 14971 severity of harm */
  readonly severity: RiskSeverity;
  /** ISO 14971 probability of occurrence */
  readonly probability: RiskProbability;
  /** Ability to detect before harm */
  readonly detectability: RiskDetectability;
  /** Reference to the risk management file entry */
  readonly risk_file_ref?: string;
  /** Residual risk acceptable? (ISO 14971 §7) */
  readonly residual_risk_acceptable?: boolean;
}

// =============================================================================
// Section 9.4: Source Relationship (FDA 510(k) multi-source)
// =============================================================================

/**
 * Relationship between evidence sources when multiple sources
 * inform the same rule or threshold.
 *
 * FDA 510(k) and PCCP require documenting when sources conflict.
 */
export type SourceRelationship =
  | 'supporting' // Sources agree
  | 'contradicting' // Sources disagree on threshold/recommendation
  | 'qualifying' // One source narrows the applicability of another
  | 'superseding'; // Newer source replaces older

export const SOURCE_RELATIONSHIPS: readonly SourceRelationship[] = [
  'supporting',
  'contradicting',
  'qualifying',
  'superseding',
] as const;

// =============================================================================
// Section 9.5: Governance Approval (expanded, replaces v2.2 GovernanceApproval)
// =============================================================================

/**
 * Expanded governance approval record.
 * Backward-compatible with v2.2 GovernanceApproval (all new fields optional).
 *
 * New fields address:
 * - FDA QMSR change control requirements (change_request_id, rationale, impact_assessment)
 * - IEC 62304 verification requirements (verification_evidence)
 * - ISO 13485 design review linkage (design_review_ref)
 * - Traceability requirements (requirement_ids)
 * - Risk-aware governance (risk_classification)
 *
 * @since v2.3.0
 */
export interface GovernanceApproval {
  /** Current lifecycle status */
  readonly status: ApprovalStatus;
  /** How the threshold/rule was validated */
  readonly method: ApprovalMethod;
  /** Who approved (person or body name) */
  readonly approver?: string;
  /** Approver's role/credentials (e.g., "Cardiologist, FASE") */
  readonly approver_role?: string;
  /** Date of approval decision (ISO 8601) */
  readonly approved_at?: string;
  /** Conditions attached to a conditional approval */
  readonly conditions?: string;
  /** When the approval expires and must be re-reviewed */
  readonly expires_at?: string;
  /** Free-text notes (e.g., "Board voted 5-0 to approve") */
  readonly notes?: string;

  // ── New in v2.3.0 ──────────────────────────────────────────────

  /** Link to formal change request (FDA QMSR / ISO 13485 §7.3.9) */
  readonly change_request_id?: string;
  /** Why this change was made — required for change control */
  readonly rationale?: string;
  /** Impact assessment summary — what could break */
  readonly impact_assessment?: string;
  /** Verification evidence for this approval (IEC 62304 §5.7) */
  readonly verification_evidence?: readonly VerificationEvidence[];
  /** Traceability: requirement IDs this approval covers */
  readonly requirement_ids?: readonly string[];
  /** Link to design review record (ISO 13485 §7.3.5) */
  readonly design_review_ref?: string;
  /** Risk classification of the governed artifact */
  readonly risk_classification?: RiskClassification;
}

// =============================================================================
// Section 9.6: Change Control Record (FDA QMSR + PCCP)
// =============================================================================

/**
 * PCCP change scope: which of the 3 PCCP components does this change affect?
 * FDA PCCP Final Guidance (Dec 4, 2024) requires documenting scope.
 */
export type PCCPScope =
  | 'sps' // SPS: Software as a Medical Device Pre-Specifications
  | 'acp' // ACP: Algorithm Change Protocol
  | 'itp'; // ITP: Impact and Transparency Plan

export const PCCP_SCOPES: readonly PCCPScope[] = ['sps', 'acp', 'itp'] as const;

/**
 * Formal change control record per FDA QMSR (ISO 13485 §7.3.9)
 * and PCCP requirements.
 *
 * Every rule change, threshold update, or pack modification that
 * affects clinical behavior MUST have a ChangeControlRecord.
 */
export interface ChangeControlRecord {
  /** Unique change request identifier (e.g., "CR-2026-0015") */
  readonly change_request_id: string;
  /** What changed and why */
  readonly rationale: string;
  /** Impact assessment — downstream effects, risk delta */
  readonly impact_assessment: string;
  /** Verification evidence proving the change is safe */
  readonly verification_evidence: readonly VerificationEvidence[];
  /** Version before this change */
  readonly previous_version: string;
  /** Version after this change */
  readonly new_version: string;
  /** Which PCCP components are affected (empty = not PCCP-scoped) */
  readonly pccp_scope?: readonly PCCPScope[];
  /** Governance approval for this change */
  readonly approval: GovernanceApproval;
  /** When the change was submitted */
  readonly submitted_at: IsoDateTime;
  /** When the change was implemented */
  readonly implemented_at?: IsoDateTime;
}

// =============================================================================
// Section 9.7: Review Enforcement (runtime review-due alerting)
// =============================================================================

/**
 * Alert level for review enforcement.
 */
export type ReviewAlertLevel = 'overdue' | 'due_soon' | 'upcoming' | 'current';

export const REVIEW_ALERT_LEVELS: readonly ReviewAlertLevel[] = [
  'overdue',
  'due_soon',
  'upcoming',
  'current',
] as const;

/**
 * A review enforcement alert emitted when a rule or source
 * approaches or passes its review_due date.
 */
export interface ReviewAlert {
  /** What needs review (rule_id, source_id, pack_id) */
  readonly subject_id: string;
  /** Type of subject */
  readonly subject_type: 'rule' | 'source' | 'pack' | 'approval';
  /** Alert urgency */
  readonly alert_level: ReviewAlertLevel;
  /** When review is/was due */
  readonly review_due: string;
  /** Days until/since due (negative = overdue) */
  readonly days_delta: number;
  /** Human-readable message */
  readonly message: string;
}

// =============================================================================
// Section 9.8: Governance Event (for audit trail)
// =============================================================================

/**
 * Types of governance events for the audit trail.
 */
export type GovernanceEventType =
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_REVOKED'
  | 'APPROVAL_EXPIRED'
  | 'CHANGE_REQUEST_SUBMITTED'
  | 'CHANGE_REQUEST_APPROVED'
  | 'CHANGE_REQUEST_REJECTED'
  | 'REVIEW_ALERT_EMITTED'
  | 'RISK_CLASSIFICATION_UPDATED';

export const GOVERNANCE_EVENT_TYPES: readonly GovernanceEventType[] = [
  'APPROVAL_GRANTED',
  'APPROVAL_REVOKED',
  'APPROVAL_EXPIRED',
  'CHANGE_REQUEST_SUBMITTED',
  'CHANGE_REQUEST_APPROVED',
  'CHANGE_REQUEST_REJECTED',
  'REVIEW_ALERT_EMITTED',
  'RISK_CLASSIFICATION_UPDATED',
] as const;

/**
 * A governance audit event — emitted when governance state changes.
 * Extends the standard AuditEvent pattern with governance-specific fields.
 */
export interface GovernanceEvent {
  /** Event type discriminator */
  readonly event_type: GovernanceEventType;
  /** When the event occurred */
  readonly occurred_at: IsoDateTime;
  /** Subject of the governance action */
  readonly subject_id: string;
  /** Actor who triggered the event */
  readonly actor: string;
  /** Actor's role */
  readonly actor_role?: string;
  /** The approval record (for approval events) */
  readonly approval?: GovernanceApproval;
  /** The change control record (for change events) */
  readonly change_control?: ChangeControlRecord;
  /** The review alert (for alert events) */
  readonly review_alert?: ReviewAlert;
  /** PHI-minimized summary */
  readonly summary: string;
}
