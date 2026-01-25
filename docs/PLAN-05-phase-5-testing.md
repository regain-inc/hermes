# Фаза 5: Testing, Validation & CI

> **Спецификации**:
> - `03-hermes-specs/02-hermes-contracts.md` — Section 14 (Conformance)
> - `03-hermes-specs/schema/hermes-message.schema.json` — JSON Schema
> - `03-hermes-specs/04-hermes-epistemological-types.md` — Section 8 (Fixtures)

## Цель

Реализовать:
- JSON Schema валидацию
- Test fixtures
- Conformance tests
- CI/CD pipeline

---

## Задачи

### 5.1 Установить зависимости для валидации

**Файл**: `package.json`

```json
{
  "devDependencies": {
    "ajv": "^8.17.0",
    "ajv-formats": "^3.0.0"
  }
}
```

**Команда**: `bun add -d ajv ajv-formats`

---

### 5.2 Скопировать JSON Schema

**Файл**: `src/schema/hermes-message.schema.json`

Скопировать из: `03-hermes-specs/schema/hermes-message.schema.json`

**Примечание**: Schema должна быть частью пакета для runtime валидации.

---

### 5.3 Реализовать Validator

**Файл**: `src/schema/validator.ts`

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import hermesSchema from './hermes-message.schema.json';
import type { HermesMessage } from '../types/messages';

/**
 * Validation result.
 */
export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Create AJV instance with Hermes schema.
 */
function createAjv(): Ajv {
  const ajv = new Ajv({
    allErrors: true,
    strict: true,
    strictSchema: true,
  });
  addFormats(ajv);
  ajv.addSchema(hermesSchema);
  return ajv;
}

const ajv = createAjv();

/**
 * Validate a Hermes message against the schema.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 14
 */
export function validateHermesMessage(message: unknown): ValidationResult {
  const validate = ajv.getSchema(hermesSchema.$id);
  if (!validate) {
    throw new Error('Hermes schema not found');
  }

  const valid = validate(message);

  if (valid) {
    return { valid: true };
  }

  return {
    valid: false,
    errors: (validate.errors ?? []).map(err => ({
      path: err.instancePath || '/',
      message: err.message ?? 'Unknown error',
    })),
  };
}

/**
 * Validate and parse a Hermes message.
 * Throws if validation fails.
 */
export function parseHermesMessage(message: unknown): HermesMessage {
  const result = validateHermesMessage(message);
  if (!result.valid) {
    throw new HermesValidationError(result.errors ?? []);
  }
  return message as HermesMessage;
}

/**
 * Validation error with details.
 */
export class HermesValidationError extends Error {
  constructor(
    public readonly errors: Array<{ path: string; message: string }>
  ) {
    super(`Hermes validation failed: ${errors.map(e => `${e.path}: ${e.message}`).join(', ')}`);
    this.name = 'HermesValidationError';
  }
}
```

---

### 5.4 Создать base fixtures

**Файл**: `src/fixtures/index.ts`

```typescript
export * from './supervision-request';
export * from './supervision-response';
export * from './clinician-feedback';
export * from './audit-event';
export * from './evidence';
export * from './htv-score';
```

---

### 5.5 Создать SupervisionRequest fixtures

**Файл**: `src/fixtures/supervision-request.ts`

```typescript
import type { SupervisionRequest } from '../types';
import { CURRENT_HERMES_VERSION } from '../types/core';

/**
 * Minimal valid SupervisionRequest fixture.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 6
 */
export const minimalSupervisionRequest: SupervisionRequest = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'supervision_request',
  trace: {
    trace_id: 'tr-001',
    created_at: '2026-01-25T10:00:00.000Z',
    producer: {
      system: 'deutsch',
      service_version: '1.0.0',
    },
  },
  mode: 'advocate_clinical',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-12345',
  },
  snapshot: {
    snapshot_id: 'snap-001',
    created_at: '2026-01-25T09:55:00.000Z',
    sources: ['ehr'],
  },
  proposals: [
    {
      proposal_id: 'prop-001',
      kind: 'PATIENT_MESSAGE',
      created_at: '2026-01-25T10:00:00.000Z',
      message_content: 'Please check your blood pressure today.',
      audit_redaction: {
        summary: 'Patient message about blood pressure check',
      },
    },
  ],
  audit_redaction: {
    summary: 'Supervision request with 1 proposal',
    proposal_summaries: ['Patient message about blood pressure check'],
  },
};

/**
 * Full SupervisionRequest with all optional fields.
 */
export const fullSupervisionRequest: SupervisionRequest = {
  ...minimalSupervisionRequest,
  snapshot_payload: { /* ... */ },
  idempotency_key: 'idem-001',
  request_timestamp: '2026-01-25T10:00:00.000Z',
  input_risk: {
    attachments_present: false,
    flags: [],
  },
  notes: 'Routine check',
  // ... остальные поля
};

/**
 * SupervisionRequest with medication proposal.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 5 (Proposals)
 */
export const medicationSupervisionRequest: SupervisionRequest = {
  ...minimalSupervisionRequest,
  proposals: [
    {
      proposal_id: 'prop-med-001',
      kind: 'MEDICATION_ORDER_PROPOSAL',
      created_at: '2026-01-25T10:00:00.000Z',
      medication: {
        name: 'Lisinopril',
        dose: '10mg',
        route: 'oral',
        frequency: 'once daily',
      },
      claim_type: 'treatment_rec',
      htv_score: {
        interdependence: 0.9,
        specificity: 0.85,
        parsimony: 0.8,
        falsifiability: 0.9,
        composite: 0.8625,
      },
      evidence_refs: [
        {
          evidence_id: 'ev-001',
          evidence_type: 'guideline',
          citation: 'AHA/ACC HF Guidelines 2024',
          evidence_grade: 'systematic_review',
        },
      ],
      audit_redaction: {
        summary: 'ACE-I titration proposal',
      },
    },
  ],
  audit_redaction: {
    summary: 'Medication supervision request',
    proposal_summaries: ['ACE-I titration proposal'],
  },
};
```

---

### 5.6 Создать SupervisionResponse fixtures

**Файл**: `src/fixtures/supervision-response.ts`

```typescript
import type { SupervisionResponse } from '../types';
import { CURRENT_HERMES_VERSION } from '../types/core';

/**
 * Approved response fixture.
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 7
 */
export const approvedSupervisionResponse: SupervisionResponse = {
  hermes_version: CURRENT_HERMES_VERSION,
  message_type: 'supervision_response',
  trace: {
    trace_id: 'tr-001',
    span_id: 'sp-002',
    parent_span_id: 'sp-001',
    created_at: '2026-01-25T10:00:05.000Z',
    producer: {
      system: 'popper',
      service_version: '1.0.0',
      ruleset_version: '2.3.0',
    },
  },
  mode: 'advocate_clinical',
  subject: {
    subject_type: 'patient',
    subject_id: 'pt-12345',
  },
  snapshot: {
    snapshot_id: 'snap-001',
    created_at: '2026-01-25T09:55:00.000Z',
    sources: ['ehr'],
  },
  decision: 'APPROVED',
  reason_codes: [],
  explanation: 'All proposals meet safety criteria.',
  audit_redaction: {
    summary: 'Supervision approved',
    decision: 'APPROVED',
    reason_codes: [],
  },
};

/**
 * Route to clinician response.
 */
export const routeSupervisionResponse: SupervisionResponse = {
  ...approvedSupervisionResponse,
  decision: 'ROUTE_TO_CLINICIAN',
  reason_codes: ['high_uncertainty', 'weak_evidence_grade'],
  explanation: 'Evidence grade below threshold for autonomous approval.',
  per_proposal_decisions: [
    {
      proposal_id: 'prop-001',
      decision: 'ROUTE_TO_CLINICIAN',
      reason_codes: ['weak_evidence_grade'],
      explanation: 'Expert opinion only; requires clinician review.',
    },
  ],
  audit_redaction: {
    summary: 'Routed to clinician due to weak evidence',
    decision: 'ROUTE_TO_CLINICIAN',
    reason_codes: ['high_uncertainty', 'weak_evidence_grade'],
  },
};

/**
 * Hard stop response.
 */
export const hardStopSupervisionResponse: SupervisionResponse = {
  ...approvedSupervisionResponse,
  decision: 'HARD_STOP',
  reason_codes: ['policy_violation', 'risk_too_high'],
  explanation: 'Proposed medication contraindicated per current records.',
  audit_redaction: {
    summary: 'Hard stop due to contraindication',
    decision: 'HARD_STOP',
    reason_codes: ['policy_violation', 'risk_too_high'],
  },
};
```

---

### 5.7 Создать HTV Score fixtures

**Файл**: `src/fixtures/htv-score.ts`

```typescript
import type { HTVScore } from '../types/epistemology';

/**
 * Good HTV score example.
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 3.4
 */
export const goodHTVScore: HTVScore = {
  interdependence: 0.9,
  specificity: 0.9,
  parsimony: 0.8,
  falsifiability: 0.9,
  composite: 0.875,
};

/**
 * Poor HTV score example (avoid).
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 3.4
 */
export const poorHTVScore: HTVScore = {
  interdependence: 0.2,
  specificity: 0.1,
  parsimony: 0.3,
  falsifiability: 0.1,
  composite: 0.175,
};

/**
 * Moderate HTV score.
 */
export const moderateHTVScore: HTVScore = {
  interdependence: 0.6,
  specificity: 0.5,
  parsimony: 0.6,
  falsifiability: 0.5,
  composite: 0.55,
};
```

---

### 5.8 Написать conformance tests

**Файл**: `src/schema/validator.test.ts`

```typescript
import { describe, expect, it } from 'bun:test';
import { validateHermesMessage, parseHermesMessage, HermesValidationError } from './validator';
import {
  minimalSupervisionRequest,
  fullSupervisionRequest,
  medicationSupervisionRequest,
} from '../fixtures/supervision-request';
import {
  approvedSupervisionResponse,
  routeSupervisionResponse,
  hardStopSupervisionResponse,
} from '../fixtures/supervision-response';

describe('Hermes Schema Validation', () => {
  describe('SupervisionRequest', () => {
    it('should validate minimal request', () => {
      const result = validateHermesMessage(minimalSupervisionRequest);
      expect(result.valid).toBe(true);
    });

    it('should validate full request', () => {
      const result = validateHermesMessage(fullSupervisionRequest);
      expect(result.valid).toBe(true);
    });

    it('should validate medication request', () => {
      const result = validateHermesMessage(medicationSupervisionRequest);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid request (missing required field)', () => {
      const invalid = { ...minimalSupervisionRequest };
      delete (invalid as any).proposals;

      const result = validateHermesMessage(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid request (wrong message_type)', () => {
      const invalid = {
        ...minimalSupervisionRequest,
        message_type: 'invalid_type',
      };

      const result = validateHermesMessage(invalid);
      expect(result.valid).toBe(false);
    });
  });

  describe('SupervisionResponse', () => {
    it('should validate approved response', () => {
      const result = validateHermesMessage(approvedSupervisionResponse);
      expect(result.valid).toBe(true);
    });

    it('should validate route response', () => {
      const result = validateHermesMessage(routeSupervisionResponse);
      expect(result.valid).toBe(true);
    });

    it('should validate hard stop response', () => {
      const result = validateHermesMessage(hardStopSupervisionResponse);
      expect(result.valid).toBe(true);
    });
  });

  describe('parseHermesMessage', () => {
    it('should parse valid message', () => {
      const msg = parseHermesMessage(minimalSupervisionRequest);
      expect(msg.message_type).toBe('supervision_request');
    });

    it('should throw on invalid message', () => {
      expect(() => parseHermesMessage({})).toThrow(HermesValidationError);
    });
  });
});
```

---

### 5.9 Создать CI pipeline

**Файл**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Lint
        run: bun run lint

      - name: Type check
        run: bun run build:types

      - name: Test
        run: bun test

      - name: Build
        run: bun run build

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build
        run: bun run build

      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

### 5.10 Добавить pre-commit hooks

**Файл**: `package.json` (добавить scripts)

```json
{
  "scripts": {
    "prepare": "git config core.hooksPath .githooks || true",
    "check": "bun run lint && bun run build:types && bun test"
  }
}
```

**Файл**: `.githooks/pre-commit`

```bash
#!/bin/sh
bun run check
```

---

### 5.11 Обновить package.json exports

**Файл**: `package.json`

```json
{
  "exports": {
    ".": {
      "bun": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./schema": {
      "bun": "./src/schema/index.ts",
      "types": "./dist/schema/index.d.ts",
      "import": "./dist/schema/index.js"
    },
    "./fixtures": {
      "bun": "./src/fixtures/index.ts",
      "types": "./dist/fixtures/index.d.ts",
      "import": "./dist/fixtures/index.js"
    },
    "./package.json": "./package.json"
  }
}
```

---

### 5.12 Создать финальный index.ts

**Файл**: `src/index.ts`

```typescript
// Version
export { CURRENT_HERMES_VERSION, version } from './version';

// Core types
export * from './types';

// Schema validation
export {
  validateHermesMessage,
  parseHermesMessage,
  HermesValidationError,
} from './schema/validator';

// Utilities
export * from './utils';

// Builders
export * from './builders';
```

---

## Чеклист

- [ ] 5.1 Зависимости установлены (ajv, ajv-formats)
- [ ] 5.2 JSON Schema скопирована
- [ ] 5.3 Validator реализован
- [ ] 5.4 Base fixtures созданы
- [ ] 5.5 SupervisionRequest fixtures созданы
- [ ] 5.6 SupervisionResponse fixtures созданы
- [ ] 5.7 HTV Score fixtures созданы
- [ ] 5.8 Conformance tests написаны
- [ ] 5.9 CI pipeline настроен
- [ ] 5.10 Pre-commit hooks добавлены
- [ ] 5.11 Package exports обновлены
- [ ] 5.12 Финальный index.ts создан

---

## Критерии завершения проекта

После выполнения всех фаз:

- [ ] `bun run build` успешно
- [ ] `bun test` — все тесты проходят
- [ ] `bun run lint` — нет ошибок
- [ ] Все fixtures валидируются против JSON Schema
- [ ] CI pipeline зелёный
- [ ] Package опубликован в npm

---

## Ссылки на спецификации

Все реализованные типы должны соответствовать:

1. `03-hermes-specs/02-hermes-contracts.md` — основной контракт
2. `03-hermes-specs/04-hermes-epistemological-types.md` — epistemology
3. `03-hermes-specs/schema/hermes-message.schema.json` — JSON Schema
4. `00-overall-specs/00-epistemology-foundations/` — философские основы
