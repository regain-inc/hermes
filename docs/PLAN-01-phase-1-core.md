# Фаза 1: Core Types

> **Спецификации**:
> - `03-hermes-specs/02-hermes-contracts.md` — Section 1-3
> - `03-hermes-specs/schema/hermes-message.schema.json` — `$defs` section

## Цель

Реализовать базовые типы, используемые во всех Hermes сообщениях.

---

## Задачи

### 1.1 Создать структуру директорий

**Файл**: `src/types/`

```
src/types/
├── index.ts          # Re-exports
├── core.ts           # Базовые типы
├── branded.ts        # Branded types для type safety
└── guards.ts         # Type guards
```

**Ссылка**: `03-hermes-specs/02-hermes-contracts.md` — Section 1 (Primitives)

---

### 1.2 Реализовать HermesVersion

**Файл**: `src/types/core.ts`

```typescript
/**
 * Hermes protocol version in semver format.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 1.1
 */
export type HermesVersion = `${number}.${number}.${number}`;

export const CURRENT_HERMES_VERSION: HermesVersion = '1.6.0';
```

**Тест**: Проверить regex pattern `^\d+\.\d+\.\d+$`

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.HermesVersion`

---

### 1.3 Реализовать IsoDateTime

**Файл**: `src/types/core.ts`

```typescript
/**
 * ISO 8601 datetime string with timezone.
 * Pattern: YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DDTHH:mm:ss±HH:MM
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 1.2
 */
export type IsoDateTime = string & { readonly __brand: 'IsoDateTime' };
```

**Утилита**: `src/utils/datetime.ts`
- `isIsoDateTime(value: string): value is IsoDateTime`
- `createIsoDateTime(date?: Date): IsoDateTime`
- `parseIsoDateTime(value: IsoDateTime): Date`

**Тест**: Проверить pattern `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$`

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.IsoDateTime`

---

### 1.4 Реализовать Mode

**Файл**: `src/types/core.ts`

```typescript
/**
 * Operational mode determines clinical supervision requirements.
 * - 'wellness': Lifestyle/wellness guidance, lower supervision
 * - 'advocate_clinical': Clinical recommendations, strict supervision
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.1
 */
export type Mode = 'wellness' | 'advocate_clinical';
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.Mode`

---

### 1.5 Реализовать TraceContext

**Файл**: `src/types/core.ts`

```typescript
/**
 * Distributed tracing context for observability.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.2
 */
export interface TraceProducer {
  readonly system: 'deutsch' | 'popper' | 'gateway' | 'other';
  readonly service_version: string;
  readonly ruleset_version?: string;
  readonly model_version?: string;
}

export interface TraceSignature {
  readonly alg: 'hmac-sha256' | 'jws';
  readonly key_id: string;
  readonly value: string;
}

export interface TraceContext {
  readonly trace_id: string;
  readonly span_id?: string;
  readonly parent_span_id?: string;
  readonly created_at: IsoDateTime;
  readonly producer: TraceProducer;
  readonly signature?: TraceSignature;
}
```

**Утилита**: `src/utils/trace.ts`
- `createTraceContext(producer: TraceProducer): TraceContext`
- `createSpan(parent: TraceContext): TraceContext`
- `generateTraceId(): string`
- `generateSpanId(): string`

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.TraceContext`

---

### 1.6 Реализовать SubjectRef

**Файл**: `src/types/core.ts`

```typescript
/**
 * Reference to the patient subject.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.3
 */
export interface SubjectRef {
  readonly subject_type: 'patient';
  readonly subject_id: string;
  readonly organization_id?: string;
}
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.SubjectRef`

---

### 1.7 Реализовать AuditRedactionBase

**Файл**: `src/types/core.ts`

```typescript
/**
 * Base type for audit redaction summaries.
 * Contains PHI-free summary for logging.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 2.4
 */
export interface AuditRedactionBase {
  readonly summary: string;
}
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.AuditRedactionBase`

---

### 1.8 Реализовать ReasonCode enum

**Файл**: `src/types/core.ts`

```typescript
/**
 * Reason codes for supervision decisions.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.2
 */
export type ReasonCode =
  | 'schema_invalid'
  | 'policy_violation'
  | 'insufficient_evidence'
  | 'high_uncertainty'
  | 'data_quality_warning'
  | 'patient_acuity_high'
  | 'risk_too_high'
  | 'drift_suspected'
  | 'needs_human_review'
  | 'approved_with_constraints'
  | 'low_htv_score'
  | 'weak_evidence_grade'
  | 'other';
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.ReasonCode`

---

### 1.9 Реализовать SupervisionDecision enum

**Файл**: `src/types/core.ts`

```typescript
/**
 * Decision outcomes from Popper supervision.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 3.1
 */
export type SupervisionDecision =
  | 'APPROVED'
  | 'HARD_STOP'
  | 'ROUTE_TO_CLINICIAN'
  | 'REQUEST_MORE_INFO';
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.SupervisionDecision`

---

### 1.10 Реализовать ProposedInterventionKind enum

**Файл**: `src/types/core.ts`

```typescript
/**
 * Types of proposed interventions.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.1
 */
export type ProposedInterventionKind =
  | 'CARE_NAVIGATION'
  | 'TRIAGE_ROUTE'
  | 'MEDICATION_ORDER_PROPOSAL'
  | 'PATIENT_MESSAGE'
  | 'LIFESTYLE_MODIFICATION_PROPOSAL'
  | 'NUTRITION_PLAN_PROPOSAL'
  | 'BEHAVIORAL_INTERVENTION_PROPOSAL'
  | 'OTHER';
```

**Ссылка**: `schema/hermes-message.schema.json` — `$defs.ProposedInterventionKind`

---

### 1.11 Создать index.ts для types

**Файл**: `src/types/index.ts`

```typescript
export * from './core';
export * from './branded';
export * from './guards';
```

---

### 1.12 Реализовать type guards

**Файл**: `src/types/guards.ts`

```typescript
import type { IsoDateTime, HermesVersion, Mode } from './core';

export function isIsoDateTime(value: unknown): value is IsoDateTime { ... }
export function isHermesVersion(value: unknown): value is HermesVersion { ... }
export function isMode(value: unknown): value is Mode { ... }
export function isReasonCode(value: unknown): value is ReasonCode { ... }
```

---

### 1.13 Написать тесты для core types

**Файл**: `src/types/core.test.ts`

- Тест для каждого type guard
- Тест для каждой утилиты
- Snapshot тесты для type definitions

---

## Чеклист

- [ ] 1.1 Структура директорий создана
- [ ] 1.2 HermesVersion реализован
- [ ] 1.3 IsoDateTime реализован + утилиты
- [ ] 1.4 Mode реализован
- [ ] 1.5 TraceContext реализован + утилиты
- [ ] 1.6 SubjectRef реализован
- [ ] 1.7 AuditRedactionBase реализован
- [ ] 1.8 ReasonCode реализован
- [ ] 1.9 SupervisionDecision реализован
- [ ] 1.10 ProposedInterventionKind реализован
- [ ] 1.11 index.ts создан
- [ ] 1.12 Type guards реализованы
- [ ] 1.13 Тесты написаны и проходят

---

## Следующий шаг

После завершения Phase 1 переходим к [Phase 2: Supervision Contract](./PLAN-02-phase-2-supervision.md)
