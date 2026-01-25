# Фаза 3: Epistemology Types

> **Спецификации**:
> - `03-hermes-specs/04-hermes-epistemological-types.md` — Полный документ
> - `00-overall-specs/00-epistemology-foundations/` — Философские основы
> - `03-hermes-specs/02-hermes-contracts.md` — Section 4.3 (EvidenceRef)

## Цель

Реализовать Deutschian/Popperian epistemology types для клинических рекомендаций:
- ClaimType — классификация утверждений
- EvidenceGrade — иерархия доказательств (Hard-to-Vary)
- HTVScore — Hard-to-Vary scoring
- UncertaintyCalibration — калиброванная неопределённость
- FalsificationCriteria — критерии опровержения

---

## Задачи

### 3.1 Реализовать ClaimType

**Файл**: `src/types/epistemology.ts`

```typescript
/**
 * Classification of clinical claims by their epistemic nature.
 * Each type has different falsifiability conditions and risk profiles.
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 1
 * @see 00-overall-specs/00-epistemology-foundations/03-conjecture-and-refutation.md
 */
export type ClaimType =
  | 'observation'           // Directly observed data point
  | 'diagnosis'             // Explanatory hypothesis about patient state
  | 'prognosis'             // Prediction about future outcomes
  | 'treatment_rec'         // Recommendation for therapeutic action
  | 'lifestyle_rec'         // Recommendation for behavioral change
  | 'diagnostic_prompt'     // Suggestion to gather more information
  | 'escalation'            // Routing decision (clinician involvement)
  | 'administrative';       // Scheduling, logistics, non-clinical

/**
 * Risk characteristics by claim type.
 */
export const CLAIM_TYPE_RISK: Record<ClaimType, {
  riskLevel: 'low' | 'medium' | 'high';
  requiresPopper: boolean;
}> = {
  observation: { riskLevel: 'low', requiresPopper: false },
  diagnosis: { riskLevel: 'high', requiresPopper: true },
  prognosis: { riskLevel: 'medium', requiresPopper: true },
  treatment_rec: { riskLevel: 'high', requiresPopper: true },
  lifestyle_rec: { riskLevel: 'low', requiresPopper: false },
  diagnostic_prompt: { riskLevel: 'low', requiresPopper: false },
  escalation: { riskLevel: 'medium', requiresPopper: true },
  administrative: { riskLevel: 'low', requiresPopper: false },
};
```

**Ссылка**: `04-hermes-epistemological-types.md` — Section 1.1, 1.2

---

### 3.2 Реализовать EvidenceGrade

**Файл**: `src/types/epistemology.ts`

```typescript
/**
 * Evidence quality hierarchy, ordered from strongest to weakest.
 * Stronger grades indicate evidence that is "harder to vary" —
 * every methodological element is load-bearing.
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 2
 * @see 00-overall-specs/00-epistemology-foundations/01-hard-to-vary-explanations.md
 */
export type EvidenceGrade =
  | 'systematic_review'  // Meta-analysis of RCTs (hardest to vary)
  | 'rct'                // Randomized controlled trial
  | 'cohort'             // Observational cohort study
  | 'case_control'       // Retrospective case-control
  | 'case_series'        // Descriptive case series
  | 'case_report'        // Single case report
  | 'expert_opinion'     // Expert consensus without systematic evidence
  | 'policy'             // Organizational policy
  | 'patient_reported'   // Self-reported by patient
  | 'calculated';        // Derived from other data

/**
 * Evidence hierarchy strength ordering.
 * Lower number = stronger evidence.
 */
export const EVIDENCE_GRADE_STRENGTH: Record<EvidenceGrade, number> = {
  systematic_review: 1,
  rct: 2,
  cohort: 3,
  case_control: 4,
  case_series: 5,
  case_report: 6,
  expert_opinion: 7,
  policy: 3,            // Treat as cohort level
  patient_reported: 6,  // Treat as case_report level
  calculated: 3,        // Depends on inputs, default to cohort
};

/**
 * Compare evidence grades.
 * Returns negative if a is stronger, positive if b is stronger.
 */
export function compareEvidenceGrades(
  a: EvidenceGrade,
  b: EvidenceGrade
): number {
  return EVIDENCE_GRADE_STRENGTH[a] - EVIDENCE_GRADE_STRENGTH[b];
}

/**
 * Get the effective evidence grade for routing decisions.
 * Maps special grades to main hierarchy.
 */
export function getEffectiveEvidenceGrade(grade: EvidenceGrade): EvidenceGrade {
  switch (grade) {
    case 'policy':
      return 'cohort';
    case 'patient_reported':
      return 'case_report';
    case 'calculated':
      return 'cohort';
    default:
      return grade;
  }
}
```

**Ссылка**: `04-hermes-epistemological-types.md` — Section 2.1, 2.2

---

### 3.3 Реализовать HTVScore

**Файл**: `src/types/epistemology.ts`

```typescript
/**
 * Hard-to-Vary score measuring explanation quality.
 * Based on Deutsch's criterion: good explanations are those
 * where changing any detail would invalidate the explanation.
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 3
 * @see 00-overall-specs/00-epistemology-foundations/01-hard-to-vary-explanations.md
 */
export interface HTVScore {
  /**
   * How tightly coupled are the claim's components?
   * High: every piece of evidence connects to the conclusion.
   * Low: components could be swapped without affecting the claim.
   */
  readonly interdependence: number;  // 0.0-1.0

  /**
   * How precise are the predictions?
   * High: specific, measurable outcomes predicted.
   * Low: vague, unfalsifiable predictions.
   */
  readonly specificity: number;      // 0.0-1.0

  /**
   * Are all elements necessary?
   * High: minimal sufficient explanation.
   * Low: includes superfluous elements.
   */
  readonly parsimony: number;        // 0.0-1.0

  /**
   * What would refute this claim?
   * High: clear falsification conditions exist.
   * Low: claim is unfalsifiable or immune to counterevidence.
   */
  readonly falsifiability: number;   // 0.0-1.0

  /**
   * Composite score (weighted average of dimensions).
   */
  readonly composite: number;        // 0.0-1.0
}

/**
 * Default weights for HTV score dimensions.
 */
export const HTV_DEFAULT_WEIGHTS = {
  interdependence: 0.25,
  specificity: 0.25,
  parsimony: 0.25,
  falsifiability: 0.25,
} as const;

/**
 * Quality levels based on composite HTV score.
 */
export type HTVQualityLevel = 'good' | 'moderate' | 'poor' | 'refuted';

export function getHTVQualityLevel(composite: number): HTVQualityLevel {
  if (composite >= 0.7) return 'good';
  if (composite >= 0.4) return 'moderate';
  if (composite >= 0.3) return 'poor';
  return 'refuted';
}
```

**Ссылка**: `04-hermes-epistemological-types.md` — Section 3.1, 3.2, 3.3

---

### 3.4 Реализовать computeHTVScore

**Файл**: `src/utils/htv.ts`

```typescript
import type { HTVScore } from '../types/epistemology';
import { HTV_DEFAULT_WEIGHTS } from '../types/epistemology';

export interface HTVDimensions {
  interdependence: number;
  specificity: number;
  parsimony: number;
  falsifiability: number;
}

export interface HTVWeights {
  interdependence?: number;
  specificity?: number;
  parsimony?: number;
  falsifiability?: number;
}

/**
 * Compute HTV score from dimensions.
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 3.2
 */
export function computeHTVScore(
  dimensions: HTVDimensions,
  weights: HTVWeights = {}
): HTVScore {
  const w = {
    interdependence: weights.interdependence ?? HTV_DEFAULT_WEIGHTS.interdependence,
    specificity: weights.specificity ?? HTV_DEFAULT_WEIGHTS.specificity,
    parsimony: weights.parsimony ?? HTV_DEFAULT_WEIGHTS.parsimony,
    falsifiability: weights.falsifiability ?? HTV_DEFAULT_WEIGHTS.falsifiability,
  };

  const composite =
    w.interdependence * dimensions.interdependence +
    w.specificity * dimensions.specificity +
    w.parsimony * dimensions.parsimony +
    w.falsifiability * dimensions.falsifiability;

  return {
    ...dimensions,
    composite: Math.max(0, Math.min(1, composite)),
  };
}
```

---

### 3.5 Реализовать UncertaintyCalibration

**Файл**: `src/types/epistemology.ts`

```typescript
/**
 * A factor contributing to uncertainty in a recommendation.
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 4.1
 */
export interface UncertaintyDriver {
  readonly factor:
    | 'evidence_grade'      // Weak evidence
    | 'htv_score'           // Low HTV score
    | 'data_quality'        // Missing or conflicting snapshot signals
    | 'debate_consensus'    // Generator-Verifier disagreement
    | 'staleness'           // Old data or evidence
    | 'conflicting_evidence'; // Sources disagree

  readonly contribution: number;  // 0.0-1.0
  readonly details: string;       // Human-readable explanation
}

/**
 * Enhanced uncertainty representation with calibration details.
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 4.2
 */
export interface UncertaintyCalibration {
  readonly level: UncertaintyLevel;       // 'low' | 'medium' | 'high'
  readonly score: number;                 // 0.0-1.0 continuous
  readonly drivers: UncertaintyDriver[];  // Contributing factors
}
```

**Ссылка**: `04-hermes-epistemological-types.md` — Section 4.1, 4.2

---

### 3.6 Реализовать computeUncertainty

**Файл**: `src/utils/uncertainty.ts`

```typescript
import type {
  EvidenceGrade,
  UncertaintyCalibration,
  UncertaintyDriver,
  UncertaintyLevel,
} from '../types/epistemology';
import { getEffectiveEvidenceGrade } from '../types/epistemology';

export interface UncertaintyInputs {
  minEvidenceGrade: EvidenceGrade;
  htvScore: number;
  missingSignals: string[];
  conflictingSignals: string[];
  verifierAgreed: boolean;
  dataAgeDays: number;
}

/**
 * Compute calibrated uncertainty from inputs.
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 4.3
 */
export function computeUncertainty(
  inputs: UncertaintyInputs
): UncertaintyCalibration {
  const drivers: UncertaintyDriver[] = [];
  let score = 0;

  const effectiveGrade = getEffectiveEvidenceGrade(inputs.minEvidenceGrade);

  // Evidence quality factor (0-0.3)
  if (effectiveGrade === 'expert_opinion' || effectiveGrade === 'case_report') {
    score += 0.3;
    drivers.push({
      factor: 'evidence_grade',
      contribution: 0.3,
      details: `Weak evidence grade: ${inputs.minEvidenceGrade}`,
    });
  } else if (effectiveGrade === 'case_series' || effectiveGrade === 'case_control') {
    score += 0.2;
    drivers.push({
      factor: 'evidence_grade',
      contribution: 0.2,
      details: `Moderate evidence grade: ${inputs.minEvidenceGrade}`,
    });
  } else if (effectiveGrade === 'cohort') {
    score += 0.1;
    drivers.push({
      factor: 'evidence_grade',
      contribution: 0.1,
      details: `Observational evidence: ${inputs.minEvidenceGrade}`,
    });
  }

  // HTV factor (0-0.3)
  if (inputs.htvScore < 0.4) {
    score += 0.3;
    drivers.push({
      factor: 'htv_score',
      contribution: 0.3,
      details: `Low HTV score: ${inputs.htvScore.toFixed(2)}`,
    });
  } else if (inputs.htvScore < 0.7) {
    score += 0.15;
    drivers.push({
      factor: 'htv_score',
      contribution: 0.15,
      details: `Moderate HTV score: ${inputs.htvScore.toFixed(2)}`,
    });
  }

  // Data quality factor (0-0.2)
  if (inputs.missingSignals.length > 2) {
    score += 0.15;
    drivers.push({
      factor: 'data_quality',
      contribution: 0.15,
      details: `Multiple missing signals: ${inputs.missingSignals.join(', ')}`,
    });
  } else if (inputs.missingSignals.length > 0) {
    score += 0.08;
    drivers.push({
      factor: 'data_quality',
      contribution: 0.08,
      details: `Missing signal: ${inputs.missingSignals.join(', ')}`,
    });
  }

  if (inputs.conflictingSignals.length > 0) {
    score += 0.1;
    drivers.push({
      factor: 'conflicting_evidence',
      contribution: 0.1,
      details: `Conflicting signals: ${inputs.conflictingSignals.join(', ')}`,
    });
  }

  // Debate consensus factor (0-0.1)
  if (!inputs.verifierAgreed) {
    score += 0.1;
    drivers.push({
      factor: 'debate_consensus',
      contribution: 0.1,
      details: 'Generator-Verifier disagreement in ArgMed debate',
    });
  }

  // Staleness factor (0-0.1)
  if (inputs.dataAgeDays > 30) {
    score += 0.1;
    drivers.push({
      factor: 'staleness',
      contribution: 0.1,
      details: `Data age: ${inputs.dataAgeDays} days`,
    });
  } else if (inputs.dataAgeDays > 14) {
    score += 0.05;
    drivers.push({
      factor: 'staleness',
      contribution: 0.05,
      details: `Data age: ${inputs.dataAgeDays} days`,
    });
  }

  // Clamp score
  score = Math.min(1.0, Math.max(0.0, score));

  // Map to level
  let level: UncertaintyLevel;
  if (score >= 0.6) level = 'high';
  else if (score >= 0.3) level = 'medium';
  else level = 'low';

  return { level, score, drivers };
}
```

---

### 3.7 Реализовать FalsificationCriteria

**Файл**: `src/types/epistemology.ts`

```typescript
/**
 * Specifies what would refute a clinical claim.
 * Implements Popper's demarcation criterion: scientific claims
 * must be falsifiable.
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 5
 * @see 00-overall-specs/00-epistemology-foundations/03-conjecture-and-refutation.md
 */
export interface FalsificationCriteria {
  readonly claim_id: string;

  /**
   * Observable conditions that would refute the claim.
   * E.g., "If serum potassium > 5.5 mEq/L post-titration"
   */
  readonly refutation_conditions: string[];

  /**
   * Time window for observing outcomes (days).
   */
  readonly observation_window_days?: number;

  /**
   * Specific metrics to monitor for refutation.
   */
  readonly outcome_measures: string[];

  /**
   * What action to take if refutation conditions are met.
   */
  readonly refutation_action?:
    | 'route_to_clinician'
    | 'hard_stop'
    | 'modify_recommendation'
    | 'log_only';
}
```

**Ссылка**: `04-hermes-epistemological-types.md` — Section 5.1, 5.2

---

### 3.8 Создать builders для epistemology types

**Файл**: `src/builders/epistemology.ts`

```typescript
import type {
  HTVScore,
  FalsificationCriteria,
  UncertaintyCalibration,
} from '../types/epistemology';
import { computeHTVScore } from '../utils/htv';
import { computeUncertainty } from '../utils/uncertainty';

export { computeHTVScore, computeUncertainty };

export function createFalsificationCriteria(
  claimId: string,
  conditions: string[],
  measures: string[],
  options?: {
    observationWindowDays?: number;
    refutationAction?: FalsificationCriteria['refutation_action'];
  }
): FalsificationCriteria {
  return {
    claim_id: claimId,
    refutation_conditions: conditions,
    outcome_measures: measures,
    observation_window_days: options?.observationWindowDays,
    refutation_action: options?.refutationAction,
  };
}
```

---

### 3.9 Написать тесты для epistemology types

**Файл**: `src/types/epistemology.test.ts`

- Тесты для computeHTVScore с разными весами
- Тесты для computeUncertainty с разными inputs
- Тесты для EVIDENCE_GRADE_STRENGTH ordering
- Тесты для getHTVQualityLevel thresholds

**Файл**: `src/utils/htv.test.ts`

- Тесты HTV примеров из спецификации (Good HTV, Poor HTV)

**Файл**: `src/utils/uncertainty.test.ts`

- Тесты uncertainty thresholds
- Тесты edge cases (all zeros, all max)

---

## Чеклист

- [ ] 3.1 ClaimType реализован с CLAIM_TYPE_RISK
- [ ] 3.2 EvidenceGrade реализован с EVIDENCE_GRADE_STRENGTH
- [ ] 3.3 HTVScore реализован с quality levels
- [ ] 3.4 computeHTVScore реализован
- [ ] 3.5 UncertaintyCalibration реализован
- [ ] 3.6 computeUncertainty реализован
- [ ] 3.7 FalsificationCriteria реализован
- [ ] 3.8 Builders созданы
- [ ] 3.9 Тесты написаны и проходят

---

## Следующий шаг

После завершения Phase 3 переходим к [Phase 4: Clinical & Imaging](./PLAN-04-phase-4-clinical.md)
