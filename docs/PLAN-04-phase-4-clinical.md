# Фаза 4: Clinical, Imaging & Bias Detection

> **Спецификации**:
> - `03-hermes-specs/02-hermes-contracts.md` — Section 10-12
> - `03-hermes-specs/03-hermes-imaging-data.md` — Imaging types
> - `03-hermes-specs/schema/hermes-message.schema.json`

## Цель

Реализовать типы для:
- Clinician Feedback — обратная связь от клиницистов
- Imaging Data — данные медицинской визуализации
- Bias Detection — обнаружение предвзятости
- Audit Events — события аудита

---

## Задачи

### 4.1 Реализовать ClinicianAction и RationaleCategory

**Файл**: `src/types/feedback.ts`

```typescript
/**
 * Actions clinician can take on a proposal.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 10.1
 */
export type ClinicianAction =
  | 'accepted'
  | 'modified'
  | 'rejected'
  | 'deferred';

/**
 * Categories for clinician rationale.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 10.2
 */
export type RationaleCategory =
  | 'contraindication'
  | 'drug_interaction'
  | 'patient_preference'
  | 'clinical_judgment'
  | 'missing_context'
  | 'protocol_not_applicable'
  | 'demographic_consideration'
  | 'recent_adverse_event'
  | 'comorbidity_conflict'
  | 'insurance_formulary'
  | 'other';

/**
 * Clinician role types.
 */
export type ClinicianRole =
  | 'attending'
  | 'specialist'
  | 'primary_care'
  | 'nurse_practitioner'
  | 'physician_assistant'
  | 'other';
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.ClinicianAction`, `$defs.RationaleCategory`

---

### 4.2 Реализовать ClinicianOverrideHistory

**Файл**: `src/types/feedback.ts`

```typescript
/**
 * Active override record.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 10.3
 */
export interface ActiveOverride {
  readonly original_trace_id: string;
  readonly action: ClinicianAction;
  readonly occurred_at: IsoDateTime;
  readonly clinician_role?: ClinicianRole;
  readonly clinician_specialty?: string;
  readonly rationale_summary: string;
  readonly rationale_category: RationaleCategory;
  readonly confidence?: 'low' | 'medium' | 'high';
  readonly applies_to?: {
    readonly medication_class?: string;
    readonly medication_specific?: string;
    readonly intervention_kind?: ProposedInterventionKind;
  };
  readonly valid_until?: IsoDateTime;
  readonly is_permanent?: boolean;
  readonly re_evaluation_trigger?: string;
  readonly has_conflicting_feedback?: boolean;
  readonly most_recent_wins?: boolean;
}

/**
 * Unresolved override conflict.
 */
export interface UnresolvedOverrideConflict {
  readonly conflict_id: string;
  readonly override_trace_ids: string[];
  readonly conflict_type: 'reversal' | 'disagreement';
  readonly requires_resolution: boolean;
  readonly recommended_action?: string;
}

/**
 * History of clinician overrides for a patient.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 10.3
 */
export interface ClinicianOverrideHistory {
  readonly total_overrides: number;
  readonly recent_overrides_30d: number;
  readonly override_rate_trend?: 'increasing' | 'stable' | 'decreasing';
  readonly active_overrides: ActiveOverride[];
  readonly unresolved_conflicts?: Array<{
    readonly conflict_id: string;
    readonly override_trace_ids: string[];
    readonly conflict_type: 'reversal' | 'disagreement';
    readonly requires_resolution: boolean;
    readonly recommended_action?: string;
  }>;
  readonly last_handoff?: {
    readonly occurred_at: IsoDateTime;
    readonly from_organization_id?: string;
    readonly to_organization_id?: string;
    readonly overrides_transferred: number;
    readonly notes?: string;
  };
}
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.ClinicianOverrideHistory`

---

### 4.3 Реализовать ClinicianFeedbackEvent

**Файл**: `src/types/feedback.ts`

```typescript
/**
 * Event recording clinician feedback on a proposal.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 10.4
 */
export interface ClinicianRef {
  readonly clinician_id: string;
  readonly role: ClinicianRole;
  readonly specialty?: string;
}

export interface ClinicianRationale {
  readonly summary: string;
  readonly category: RationaleCategory;
  readonly subcategory?: string;
  readonly confidence: 'low' | 'medium' | 'high';
  readonly guideline_refs?: object[];
  readonly contraindication_details?: {
    readonly condition_code?: string;
    readonly severity?: 'relative' | 'absolute';
  };
}

export interface ModifiedAction {
  readonly intervention_kind: ProposedInterventionKind;
  readonly summary: string;
  readonly medication_change?: {
    readonly original_proposal_summary?: string;
    readonly actual_action_summary?: string;
    readonly reason_for_alternative?: string;
  };
}

export interface ClinicianFeedbackAuditRedaction extends AuditRedactionBase {
  readonly action: ClinicianAction;
  readonly category: RationaleCategory;
  readonly response_time_bucket?: '<1min' | '1-5min' | '5-15min' | '15-60min' | '>60min';
}

export interface ClinicianFeedbackEvent {
  readonly hermes_version: HermesVersion;
  readonly message_type: 'clinician_feedback';
  readonly trace: TraceContext;
  readonly mode: Mode;
  readonly subject: SubjectRef;
  readonly original_trace_id: string;
  readonly original_proposal_id: string;
  readonly snapshot_ref: HealthStateSnapshotRef;
  readonly action: ClinicianAction;
  readonly occurred_at: IsoDateTime;
  readonly response_time_seconds?: number;
  readonly clinician_ref: ClinicianRef;
  readonly rationale: ClinicianRationale;
  readonly modified_action?: ModifiedAction;
  readonly applies_to?: {
    readonly medication_class?: string;
    readonly medication_specific?: string;
    readonly intervention_kind?: ProposedInterventionKind;
    readonly valid_until?: IsoDateTime;
    readonly is_permanent?: boolean;
    readonly re_evaluation_trigger?: string;
  };
  readonly conflicts_with_prior_feedback?: {
    readonly prior_trace_id: string;
    readonly prior_action: ClinicianAction;
    readonly conflict_type: 'reversal' | 'escalation' | 'disagreement';
    readonly resolution_note?: string;
  };
  readonly demographic_context?: {
    readonly age_group?: 'pediatric' | 'adult' | 'geriatric';
    readonly relevant_demographics?: string[];
  };
  readonly audit_redaction: ClinicianFeedbackAuditRedaction;
}
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.ClinicianFeedbackEvent`

---

### 4.4 Реализовать FeedbackMetrics

**Файл**: `src/types/feedback.ts`

```typescript
/**
 * Aggregate metrics about clinician feedback.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 10.5
 */
export interface AlertFatigueIndicators {
  readonly rapid_responses?: boolean;
  readonly low_confidence_rejections?: boolean;
  readonly pattern_detected?: string;
}

export interface FeedbackMetrics {
  readonly override_rate_30d: number;
  readonly override_rate_trend: 'increasing' | 'stable' | 'decreasing';
  readonly avg_response_time_seconds?: number;
  readonly alert_fatigue_indicators?: AlertFatigueIndicators;
}

export interface PriorOverride {
  readonly original_trace_id: string;
  readonly action: ClinicianAction;
  readonly rationale_summary: string;
  readonly rationale_category: RationaleCategory;
  readonly confidence?: 'low' | 'medium' | 'high';
  readonly clinician_role?: ClinicianRole;
  readonly applies_to?: {
    readonly medication_class?: string;
    readonly medication_specific?: string;
    readonly intervention_kind?: ProposedInterventionKind;
  };
  readonly age_days: number;
  readonly is_permanent?: boolean;
}
```

---

### 4.5 Реализовать Imaging types

**Файл**: `src/types/imaging.ts`

```typescript
/**
 * Imaging modality types.
 * @see 03-hermes-specs/03-hermes-imaging-data.md — Section 1
 */
export type ImagingModality =
  | 'MR'   // MRI
  | 'CT'   // CT scan
  | 'XR'   // X-ray
  | 'US'   // Ultrasound
  | 'MG'   // Mammography
  | 'PT'   // PET
  | 'NM'   // Nuclear medicine
  | 'ECG'  // ECG/EKG
  | 'DX'   // Digital radiography
  | 'CR'   // Computed radiography
  | 'OT';  // Other

/**
 * Type of imaging finding.
 */
export type ImagingFindingType =
  | 'measurement'
  | 'classification'
  | 'abnormality_flag'
  | 'comparison'
  | 'structured_report';

/**
 * Clinical significance of finding.
 */
export type ClinicalSignificance =
  | 'normal'
  | 'abnormal'
  | 'critical'
  | 'indeterminate';

/**
 * Reference to an imaging study.
 * @see 03-hermes-specs/03-hermes-imaging-data.md — Section 2
 */
export interface ImagingStudyRef {
  readonly study_id: string;
  readonly storage_endpoint: string;
  readonly modality: ImagingModality;
  readonly study_date: IsoDateTime;
  readonly study_group_id?: string;
  readonly multi_modality_type?: string;
  readonly series_count?: number;
  readonly instance_count?: number;
  readonly description_redacted: string;
  readonly body_part_examined?: string;
  readonly metadata_hash?: string;
  readonly last_updated: IsoDateTime;
}

/**
 * Measurement from imaging.
 */
export interface ImagingMeasurement {
  readonly value: number;
  readonly unit: string;
  readonly reference_range?: {
    readonly low?: number;
    readonly high?: number;
    readonly population?: string;
  };
  readonly method?: string;
}

/**
 * AI/radiologist classification.
 */
export interface ImagingClassification {
  readonly label: string;
  readonly confidence: number;
  readonly model_id?: string;
  readonly alternative_labels?: Array<{
    readonly label: string;
    readonly confidence: number;
  }>;
}

/**
 * Comparison with prior study.
 */
export interface ImagingComparison {
  readonly prior_study_id: string;
  readonly comparison_type: 'improved' | 'stable' | 'worsened' | 'new_finding' | 'resolved';
  readonly delta_value?: number;
  readonly delta_unit?: string;
  readonly notes?: string;
}

/**
 * Who/what extracted the finding.
 */
export interface ImagingExtractor {
  readonly type: 'radiologist' | 'ai_model' | 'automated';
  readonly provider_id?: string;
  readonly model_id?: string;
  readonly model_version?: string;
  readonly system_id?: string;
}

/**
 * Derived finding from imaging study.
 * @see 03-hermes-specs/03-hermes-imaging-data.md — Section 3
 */
export interface DerivedImagingFinding {
  readonly finding_id: string;
  readonly source_study: ImagingStudyRef;
  readonly finding_type: ImagingFindingType;
  readonly measurement?: ImagingMeasurement;
  readonly classification?: ImagingClassification;
  readonly body_site?: string;
  readonly laterality?: 'left' | 'right' | 'bilateral';
  readonly clinical_significance: ClinicalSignificance;
  readonly comparison?: ImagingComparison;
  readonly extracted_at: IsoDateTime;
  readonly extractor: ImagingExtractor;
  readonly evidence_grade: EvidenceGrade;
  readonly confidence: number;
  readonly notes_redacted?: string;
}
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.ImagingStudyRef`, `$defs.DerivedImagingFinding`

---

### 4.6 Реализовать BiasDetectionEvent

**Файл**: `src/types/bias.ts`

```typescript
/**
 * Bias detection event types.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 11
 */
export type BiasDetectionType =
  | 'demographic_override_disparity'
  | 'intervention_type_bias'
  | 'clinician_specialty_bias'
  | 'other';

export type BiasSeverity = 'info' | 'warning' | 'critical';

export interface BiasAnalysisPeriod {
  readonly start: IsoDateTime;
  readonly end: IsoDateTime;
  readonly days: number;
}

export interface BiasAffectedDimension {
  readonly dimension_type:
    | 'age_group'
    | 'intervention_kind'
    | 'medication_class'
    | 'clinician_specialty'
    | 'other';
  readonly dimension_value: string;
}

export interface BiasMetrics {
  readonly overall_override_rate: number;
  readonly affected_group_override_rate: number;
  readonly control_group_override_rate: number;
  readonly rate_difference: number;
  readonly rate_ratio: number;
  readonly sample_size_affected: number;
  readonly sample_size_control: number;
  readonly statistical_significance?: {
    readonly p_value?: number;
    readonly confidence_interval_95?: [number, number];
    readonly is_significant: boolean;
  };
}

export interface BiasRecommendation {
  readonly priority: 'high' | 'medium' | 'low';
  readonly action:
    | 'review_proposal_logic'
    | 'increase_clinician_routing'
    | 'model_recalibration'
    | 'training_data_review'
    | 'other';
  readonly description: string;
}

export interface BiasDetectionAuditRedaction extends AuditRedactionBase {
  readonly detection_type: string;
  readonly severity: string;
  readonly affected_dimension: string;
  readonly rate_difference: string;
  readonly sample_sizes?: string;
  readonly recommendations_count: number;
}

export interface BiasDetectionEvent {
  readonly hermes_version: HermesVersion;
  readonly message_type: 'bias_detection';
  readonly trace: TraceContext;
  readonly mode: Mode;
  readonly organization_id: string;
  readonly detection_id: string;
  readonly detection_type: BiasDetectionType;
  readonly severity: BiasSeverity;
  readonly detected_at: IsoDateTime;
  readonly analysis_period: BiasAnalysisPeriod;
  readonly affected_dimension: BiasAffectedDimension;
  readonly metrics: BiasMetrics;
  readonly breakdown_by_category?: Array<{
    readonly rationale_category: RationaleCategory;
    readonly override_count: number;
    readonly percentage: number;
  }>;
  readonly affected_intervention_kinds?: Array<{
    readonly kind: ProposedInterventionKind;
    readonly override_rate: number;
  }>;
  readonly recommendations: BiasRecommendation[];
  readonly regulatory_context?: {
    readonly fda_requirement?: string;
    readonly guidance_reference?: string;
    readonly reporting_required: boolean;
    readonly reporting_deadline_days?: number;
  };
  readonly audit_redaction: BiasDetectionAuditRedaction;
}
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.BiasDetectionEvent`

---

### 4.7 Реализовать AuditEvent

**Файл**: `src/types/audit.ts`

```typescript
/**
 * Audit event types.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 12
 */
export type AuditEventType =
  | 'SUPERVISION_REQUEST_SENT'
  | 'SUPERVISION_REQUEST_RECEIVED'
  | 'SUPERVISION_RESPONSE_DECIDED'
  | 'SUPERVISION_RESPONSE_RECEIVED'
  | 'CONTROL_COMMAND_ISSUED'
  | 'CONTROL_COMMAND_APPLIED'
  | 'SAFE_MODE_ENABLED'
  | 'SAFE_MODE_DISABLED'
  | 'OUTPUT_RETURNED'
  | 'VALIDATION_FAILED'
  | 'OTHER';

/**
 * Audit event for observability.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 12.1
 */
export interface AuditEvent {
  readonly hermes_version: HermesVersion;
  readonly message_type: 'audit_event';
  readonly event_type: AuditEventType;
  readonly other_event_type?: string;
  readonly occurred_at: IsoDateTime;
  readonly trace: TraceContext;
  readonly mode: Mode;
  readonly subject: SubjectRef;
  readonly summary: string;
  readonly tags?: Record<string, string>;
}
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.AuditEvent`

---

### 4.8 Реализовать HermesError

**Файл**: `src/types/errors.ts`

```typescript
/**
 * Error codes for Hermes protocol.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 13
 */
export type HermesErrorCode =
  | 'invalid_schema'
  | 'unsupported_version'
  | 'unauthorized'
  | 'rate_limited'
  | 'internal_error';

/**
 * Hermes protocol error.
 */
export interface HermesError {
  readonly hermes_version: HermesVersion;
  readonly message_type: 'error';
  readonly trace?: TraceContext;
  readonly code: HermesErrorCode;
  readonly message: string;
  readonly details?: object;
}
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.HermesError`

---

### 4.9 Создать union type для всех сообщений

**Файл**: `src/types/messages.ts`

```typescript
import type { SupervisionRequest, SupervisionResponse } from './supervision';
import type { ClinicianFeedbackEvent } from './feedback';
import type { BiasDetectionEvent } from './bias';
import type { AuditEvent } from './audit';
import type { HermesError } from './errors';
import type { CrossDomainConflict } from './composition';

/**
 * Union of all Hermes message types.
 */
export type HermesMessage =
  | SupervisionRequest
  | SupervisionResponse
  | AuditEvent
  | HermesError
  | CrossDomainConflict
  | ClinicianFeedbackEvent
  | BiasDetectionEvent;

/**
 * Type guard for message types.
 */
export function isSupervisionRequest(msg: HermesMessage): msg is SupervisionRequest {
  return msg.message_type === 'supervision_request';
}

export function isSupervisionResponse(msg: HermesMessage): msg is SupervisionResponse {
  return msg.message_type === 'supervision_response';
}

// ... остальные type guards
```

---

### 4.10 Написать тесты для clinical types

**Файл**: `src/types/feedback.test.ts`
**Файл**: `src/types/imaging.test.ts`
**Файл**: `src/types/bias.test.ts`
**Файл**: `src/types/audit.test.ts`

---

## Чеклист

- [ ] 4.1 ClinicianAction и RationaleCategory реализованы
- [ ] 4.2 ClinicianOverrideHistory реализован
- [ ] 4.3 ClinicianFeedbackEvent реализован
- [ ] 4.4 FeedbackMetrics реализован
- [ ] 4.5 Imaging types реализованы
- [ ] 4.6 BiasDetectionEvent реализован
- [ ] 4.7 AuditEvent реализован
- [ ] 4.8 HermesError реализован
- [ ] 4.9 Union type и type guards созданы
- [ ] 4.10 Тесты написаны и проходят

---

## Следующий шаг

После завершения Phase 4 переходим к [Phase 5: Testing & CI](./PLAN-05-phase-5-testing.md)
