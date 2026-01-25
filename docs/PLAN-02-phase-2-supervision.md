# Фаза 2: Supervision Contract

> **Спецификации**:
> - `03-hermes-specs/02-hermes-contracts.md` — Section 4-7
> - `03-hermes-specs/01-hermes-system-spec.md` — Section 3 (Supervision Flow)
> - `03-hermes-specs/schema/hermes-message.schema.json`

## Цель

Реализовать основной контракт Deutsch ↔ Popper: SupervisionRequest и SupervisionResponse.

---

## Задачи

### 2.1 Реализовать HealthStateSnapshotRef

**Файл**: `src/types/snapshot.ts`

```typescript
/**
 * Reference to patient health state snapshot.
 * Contains metadata without PHI.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.2
 */
export interface SnapshotQuality {
  readonly missing_signals?: string[];
  readonly conflicting_signals?: string[];
  readonly notes?: string;
}

export interface HealthStateSnapshotRef {
  readonly snapshot_id: string;
  readonly snapshot_hash?: string;
  readonly created_at: IsoDateTime;
  readonly snapshot_uri?: string;
  readonly sources: Array<'ehr' | 'wearable' | 'patient_reported' | 'imaging' | 'other'>;
  readonly quality?: SnapshotQuality;
  readonly imaging_studies?: ImagingStudyRef[];
  readonly imaging_findings?: DerivedImagingFinding[];
  readonly estimated_size_bytes?: number;
  readonly prior_clinician_overrides?: ClinicianOverrideHistory;
}
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.HealthStateSnapshotRef`

---

### 2.2 Реализовать EvidenceRef

**Файл**: `src/types/evidence.ts`

```typescript
/**
 * Reference to supporting evidence.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.3
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 2.4
 */
export type EvidenceType =
  | 'guideline'
  | 'study'
  | 'patient_data'
  | 'clinical_policy'
  | 'prior_decision'
  | 'other';

export interface EvidenceRef {
  readonly evidence_id: string;
  readonly evidence_type: EvidenceType;
  readonly citation: string;
  readonly uri?: string;
  readonly excerpt?: string;
  readonly content_hash?: string;

  // Epistemological enhancement (Phase 3)
  readonly evidence_grade?: EvidenceGrade;
  readonly confidence?: number;
  readonly publication_date?: string;
  readonly falsification_condition?: string;
}
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.EvidenceRef`

---

### 2.3 Реализовать DisclosureBundle

**Файл**: `src/types/disclosure.ts`

```typescript
/**
 * Transparency disclosures for patient communication.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.4
 */
export type UncertaintyLevel = 'low' | 'medium' | 'high';

export interface DisclosureBundle {
  readonly patient_facing_summary: string;
  readonly uncertainty: {
    readonly level: UncertaintyLevel;
    readonly notes?: string;
  };
  readonly ai_involvement_disclosed: boolean;
  readonly limitations?: string[];
}
```

---

### 2.4 Реализовать ProposedInterventionBase

**Файл**: `src/types/proposals.ts`

```typescript
/**
 * Base type for all proposed interventions.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 5
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 6
 */
export interface ProposedInterventionBase {
  readonly proposal_id: string;
  readonly kind: ProposedInterventionKind;
  readonly created_at: IsoDateTime;
  readonly interdependency_group_id?: string;
  readonly deutsch_risk_estimate?: {
    readonly level: 'low' | 'medium' | 'high' | 'critical';
    readonly notes?: string;
  };
  readonly evidence_refs?: EvidenceRef[];
  readonly disclosure?: DisclosureBundle;
  readonly audit_redaction: AuditRedactionBase;

  // Epistemological fields (Phase 3)
  readonly claim_type?: ClaimType;
  readonly htv_score?: HTVScore;
  readonly falsification_criteria?: FalsificationCriteria;
  readonly uncertainty_calibration?: UncertaintyCalibration;
}
```

**Ссылка**: `schema/hermes-message.schema.json` — proposals section

---

### 2.5 Реализовать конкретные ProposedIntervention варианты

**Файл**: `src/types/proposals.ts`

```typescript
export interface MedicationOrderProposal extends ProposedInterventionBase {
  readonly kind: 'MEDICATION_ORDER_PROPOSAL';
  readonly medication: {
    readonly name: string;
    readonly dose?: string;
    readonly route?: string;
    readonly frequency?: string;
  };
}

export interface PatientMessageProposal extends ProposedInterventionBase {
  readonly kind: 'PATIENT_MESSAGE';
  readonly message_content: string;
  readonly channel?: 'app' | 'sms' | 'email';
}

export interface TriageRouteProposal extends ProposedInterventionBase {
  readonly kind: 'TRIAGE_ROUTE';
  readonly urgency: 'routine' | 'urgent' | 'emergent';
  readonly destination?: string;
}

// ... остальные варианты

export type ProposedIntervention =
  | MedicationOrderProposal
  | PatientMessageProposal
  | TriageRouteProposal
  | LifestyleModificationProposal
  | NutritionPlanProposal
  | BehavioralInterventionProposal
  | CareNavigationProposal
  | OtherProposal;
```

---

### 2.6 Реализовать InputRisk

**Файл**: `src/types/supervision.ts`

```typescript
/**
 * Risk assessment of input data.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 6.1
 */
export interface InputRisk {
  readonly attachments_present?: boolean;
  readonly flags?: Array<
    | 'phi_detected'
    | 'prompt_injection_suspected'
    | 'malware_suspected'
    | 'other'
  >;
  readonly notes?: string;
}
```

---

### 2.7 Реализовать SupervisionRequest

**Файл**: `src/types/supervision.ts`

```typescript
/**
 * Request from Deutsch to Popper for supervision.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 6
 * @see 03-hermes-specs/01-hermes-system-spec.md — Section 3.1
 */
export interface SupervisionRequestAuditRedaction extends AuditRedactionBase {
  readonly proposal_summaries: string[];
  readonly has_unresolved_conflicts?: boolean;
  readonly alert_fatigue_warning?: boolean;
  readonly override_rate_bucket?: string;
}

export interface SupervisionRequest {
  readonly hermes_version: HermesVersion;
  readonly message_type: 'supervision_request';
  readonly trace: TraceContext;
  readonly mode: Mode;
  readonly subject: SubjectRef;
  readonly snapshot: HealthStateSnapshotRef;
  readonly snapshot_payload?: object;
  readonly idempotency_key?: string;
  readonly request_timestamp?: IsoDateTime;
  readonly input_risk?: InputRisk;
  readonly proposals: ProposedIntervention[];
  readonly notes?: string;
  readonly cross_domain_conflicts?: CrossDomainConflict[];
  readonly contributing_domains?: ContributingDomain[];
  readonly composition_metadata?: CompositionMetadata;
  readonly relevant_prior_overrides?: PriorOverride[];
  readonly unresolved_override_conflicts?: UnresolvedOverrideConflict[];
  readonly feedback_metrics?: FeedbackMetrics;
  readonly audit_redaction: SupervisionRequestAuditRedaction;
}
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.SupervisionRequest`

---

### 2.8 Реализовать ApprovedConstraints

**Файл**: `src/types/supervision.ts`

```typescript
/**
 * Constraints on approved proposals.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 7.1
 */
export interface ApprovedConstraints {
  readonly must_route_after?: IsoDateTime;
  readonly allowed_actions?: string[];
}
```

---

### 2.9 Реализовать PerProposalDecision

**Файл**: `src/types/supervision.ts`

```typescript
/**
 * Decision for individual proposal.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 7.2
 */
export interface PerProposalDecision {
  readonly proposal_id: string;
  readonly decision: SupervisionDecision;
  readonly reason_codes: ReasonCode[];
  readonly explanation?: string;
}
```

---

### 2.10 Реализовать SupervisionResponse

**Файл**: `src/types/supervision.ts`

```typescript
/**
 * Response from Popper to Deutsch with supervision decision.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 7
 * @see 03-hermes-specs/01-hermes-system-spec.md — Section 3.2
 */
export interface SupervisionResponseAuditRedaction extends AuditRedactionBase {
  readonly decision: SupervisionDecision;
  readonly reason_codes: ReasonCode[];
}

export interface SupervisionResponse {
  readonly hermes_version: HermesVersion;
  readonly message_type: 'supervision_response';
  readonly trace: TraceContext;
  readonly mode: Mode;
  readonly subject: SubjectRef;
  readonly snapshot: HealthStateSnapshotRef;
  readonly request_idempotency_key?: string;
  readonly response_timestamp?: IsoDateTime;
  readonly decision: SupervisionDecision;
  readonly reason_codes: ReasonCode[];
  readonly explanation: string;
  readonly approved_constraints?: ApprovedConstraints;
  readonly control_commands?: ControlCommand[];
  readonly safe_mode_state_used?: SafeModeStateUsed;
  readonly per_proposal_decisions?: PerProposalDecision[];
  readonly conflict_evaluations?: ConflictEvaluation[];
  readonly audit_redaction: SupervisionResponseAuditRedaction;
}
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.SupervisionResponse`

---

### 2.11 Реализовать ControlCommand

**Файл**: `src/types/control.ts`

```typescript
/**
 * Control commands from Popper to Deutsch.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 8
 */
export type ControlCommandKind = 'SET_SAFE_MODE' | 'SET_OPERATIONAL_SETTING';

export interface SafeModeConfig {
  readonly enabled: boolean;
  readonly reason: string;
  readonly effective_at?: IsoDateTime;
  readonly effective_until?: IsoDateTime;
}

export interface OperationalSetting {
  readonly key: string;
  readonly value: string;
}

export interface ControlCommand {
  readonly command_id: string;
  readonly kind: ControlCommandKind;
  readonly created_at: IsoDateTime;
  readonly safe_mode?: SafeModeConfig;
  readonly setting?: OperationalSetting;
  readonly audit_redaction: AuditRedactionBase;
}

export interface SafeModeStateUsed {
  readonly enabled: boolean;
  readonly effective_at?: IsoDateTime;
  readonly effective_until?: IsoDateTime;
}
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.ControlCommand`

---

### 2.12 Реализовать Multi-Domain Composition types

**Файл**: `src/types/composition.ts`

```typescript
/**
 * Multi-domain composition types.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 9
 */
export type DomainCategory =
  | 'clinical'
  | 'lifestyle'
  | 'behavioral'
  | 'preventive'
  | 'rehabilitative'
  | 'other';

export type ResolutionStrategy =
  | 'override'
  | 'constrain'
  | 'merge'
  | 'sequence'
  | 'escalate';

export interface ContributingDomain {
  readonly domain_id: string;
  readonly domain_version: string;
  readonly domain_category: DomainCategory;
  readonly status: 'success' | 'degraded' | 'failed';
  readonly failure_reason?: string;
  readonly proposal_ids: string[];
  readonly data_quality?: {
    readonly staleness_seconds?: number;
    readonly missing_signals?: string[];
    readonly conflicting_signals?: string[];
  };
}

export interface CrossDomainConflict {
  readonly conflict_id: string;
  readonly conflict_type: string;
  readonly triggering_rule: {
    readonly rule_id: string;
    readonly rule_source: string;
    readonly rule_version: string;
  };
  readonly conflicting_domains: string[];
  readonly conflicting_proposal_ids: string[];
  readonly original_proposals: Record<string, string>;
  readonly resolution_strategy: ResolutionStrategy;
  readonly resolved_proposal_id?: string;
  readonly resolution_confidence: 'low' | 'medium' | 'high';
  readonly evidence_refs: object[];
  readonly uncertainty: {
    readonly level: UncertaintyLevel;
    readonly notes?: string;
  };
  readonly audit_redaction: AuditRedactionBase;
}

export interface CompositionMetadata {
  readonly composer_version: string;
  readonly registries_loaded: Array<{
    readonly registry_ref: string;
    readonly registry_version: string;
    readonly rule_count: number;
  }>;
  readonly priority_snapshot: Record<string, number>;
  readonly rule_engine_status: 'healthy' | 'degraded' | 'failed';
}

export interface ConflictEvaluation {
  readonly conflict_id: string;
  readonly popper_agrees_with_resolution: boolean;
  readonly override_decision?: SupervisionDecision;
  readonly override_reason?: string;
}
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.CrossDomainConflict`, `$defs.ContributingDomain`

---

### 2.13 Создать builders для сообщений

**Файл**: `src/builders/index.ts`

```typescript
export { createSupervisionRequest } from './supervision-request';
export { createSupervisionResponse } from './supervision-response';
```

**Файл**: `src/builders/supervision-request.ts`

```typescript
import type { SupervisionRequest } from '../types';

export interface SupervisionRequestOptions {
  mode: Mode;
  subject: SubjectRef;
  snapshot: HealthStateSnapshotRef;
  proposals: ProposedIntervention[];
  // ... optional fields
}

export function createSupervisionRequest(
  options: SupervisionRequestOptions
): SupervisionRequest {
  return {
    hermes_version: CURRENT_HERMES_VERSION,
    message_type: 'supervision_request',
    trace: createTraceContext({ system: 'deutsch', service_version: '1.0.0' }),
    ...options,
    audit_redaction: {
      summary: `Supervision request with ${options.proposals.length} proposals`,
      proposal_summaries: options.proposals.map(p => p.audit_redaction.summary),
    },
  };
}
```

---

### 2.14 Написать тесты для supervision types

**Файл**: `src/types/supervision.test.ts`

- Тесты создания SupervisionRequest
- Тесты создания SupervisionResponse
- Тесты валидации required fields
- Тесты совместимости с JSON Schema

---

## Чеклист

- [ ] 2.1 HealthStateSnapshotRef реализован
- [ ] 2.2 EvidenceRef реализован
- [ ] 2.3 DisclosureBundle реализован
- [ ] 2.4 ProposedInterventionBase реализован
- [ ] 2.5 Конкретные ProposedIntervention варианты реализованы
- [ ] 2.6 InputRisk реализован
- [ ] 2.7 SupervisionRequest реализован
- [ ] 2.8 ApprovedConstraints реализован
- [ ] 2.9 PerProposalDecision реализован
- [ ] 2.10 SupervisionResponse реализован
- [ ] 2.11 ControlCommand реализован
- [ ] 2.12 Multi-Domain Composition types реализованы
- [ ] 2.13 Builders созданы
- [ ] 2.14 Тесты написаны и проходят

---

## Следующий шаг

После завершения Phase 2 переходим к [Phase 3: Epistemology](./PLAN-03-phase-3-epistemology.md)
