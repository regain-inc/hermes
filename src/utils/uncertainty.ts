/**
 * Uncertainty calibration utilities
 *
 * Implements quantified fallibilism: all knowledge is provisional.
 * Uncertainty is computed based on multiple factors including evidence grade,
 * HTV score, data quality, and staleness.
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 4
 * @see 00-overall-specs/0A-epistemology/04-fallibilism-and-error-correction.md
 * @module utils/uncertainty
 */

import type {
  EvidenceGrade,
  UncertaintyCalibration,
  UncertaintyDriver,
  UncertaintyLevel,
} from '../types/epistemology';
import { getEffectiveEvidenceGrade } from '../types/epistemology';

/**
 * Input parameters for uncertainty computation.
 */
export interface UncertaintyInputs {
  /** The minimum evidence grade supporting the recommendation */
  readonly minEvidenceGrade: EvidenceGrade;

  /** The HTV composite score (0.0-1.0) */
  readonly htvScore: number;

  /** List of missing signals in the patient snapshot */
  readonly missingSignals: readonly string[];

  /** List of conflicting signals in the patient snapshot */
  readonly conflictingSignals: readonly string[];

  /** Whether the Verifier agreed with the Generator in ArgMed debate */
  readonly verifierAgreed: boolean;

  /** Age of the data in days */
  readonly dataAgeDays: number;
}

/**
 * Thresholds for uncertainty level classification.
 */
export const UNCERTAINTY_THRESHOLDS = {
  /** Score >= this is considered high uncertainty */
  HIGH: 0.6,
  /** Score >= this is considered medium uncertainty */
  MEDIUM: 0.3,
} as const;

/**
 * Map a numeric score to an uncertainty level.
 */
function scoreToLevel(score: number): UncertaintyLevel {
  if (score >= UNCERTAINTY_THRESHOLDS.HIGH) return 'high';
  if (score >= UNCERTAINTY_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
}

/**
 * Compute evidence grade contribution to uncertainty.
 */
function computeEvidenceGradeContribution(
  grade: EvidenceGrade,
  originalGrade: EvidenceGrade
): UncertaintyDriver | null {
  const effectiveGrade = getEffectiveEvidenceGrade(grade);

  if (effectiveGrade === 'expert_opinion' || effectiveGrade === 'case_report') {
    return {
      factor: 'evidence_grade',
      contribution: 0.3,
      details: `Weak evidence grade: ${originalGrade}`,
    };
  }
  if (effectiveGrade === 'case_series' || effectiveGrade === 'case_control') {
    return {
      factor: 'evidence_grade',
      contribution: 0.2,
      details: `Moderate evidence grade: ${originalGrade}`,
    };
  }
  if (effectiveGrade === 'cohort') {
    return {
      factor: 'evidence_grade',
      contribution: 0.1,
      details: `Observational evidence: ${originalGrade}`,
    };
  }
  return null;
}

/**
 * Compute HTV score contribution to uncertainty.
 */
function computeHTVContribution(htvScore: number): UncertaintyDriver | null {
  if (htvScore < 0.4) {
    return {
      factor: 'htv_score',
      contribution: 0.3,
      details: `Low HTV score: ${htvScore.toFixed(2)}`,
    };
  }
  if (htvScore < 0.7) {
    return {
      factor: 'htv_score',
      contribution: 0.15,
      details: `Moderate HTV score: ${htvScore.toFixed(2)}`,
    };
  }
  return null;
}

/**
 * Compute data quality contribution to uncertainty.
 */
function computeDataQualityContribution(
  missingSignals: readonly string[]
): UncertaintyDriver | null {
  if (missingSignals.length > 2) {
    return {
      factor: 'data_quality',
      contribution: 0.15,
      details: `Multiple missing signals: ${missingSignals.join(', ')}`,
    };
  }
  if (missingSignals.length > 0) {
    return {
      factor: 'data_quality',
      contribution: 0.08,
      details: `Missing signal: ${missingSignals.join(', ')}`,
    };
  }
  return null;
}

/**
 * Compute staleness contribution to uncertainty.
 */
function computeStalenessContribution(dataAgeDays: number): UncertaintyDriver | null {
  if (dataAgeDays > 30) {
    return {
      factor: 'staleness',
      contribution: 0.1,
      details: `Data age: ${dataAgeDays} days`,
    };
  }
  if (dataAgeDays > 14) {
    return {
      factor: 'staleness',
      contribution: 0.05,
      details: `Data age: ${dataAgeDays} days`,
    };
  }
  return null;
}

/**
 * Compute calibrated uncertainty from inputs.
 *
 * The algorithm accumulates uncertainty contributions from multiple factors:
 * - Evidence quality (0-0.3)
 * - HTV score (0-0.3)
 * - Data quality (0-0.2)
 * - Debate consensus (0-0.1)
 * - Data staleness (0-0.1)
 *
 * @example
 * ```typescript
 * const uncertainty = computeUncertainty({
 *   minEvidenceGrade: 'expert_opinion',
 *   htvScore: 0.35,
 *   missingSignals: ['ejection_fraction'],
 *   conflictingSignals: [],
 *   verifierAgreed: true,
 *   dataAgeDays: 7,
 * });
 * // uncertainty.level = 'high', score = 0.68
 * ```
 *
 * @param inputs - The uncertainty input factors
 * @returns Calibrated uncertainty with level, score, and drivers
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 4.3
 */
export function computeUncertainty(inputs: UncertaintyInputs): UncertaintyCalibration {
  const drivers: UncertaintyDriver[] = [];

  // Evidence quality factor
  const evidenceDriver = computeEvidenceGradeContribution(
    inputs.minEvidenceGrade,
    inputs.minEvidenceGrade
  );
  if (evidenceDriver) drivers.push(evidenceDriver);

  // HTV factor
  const htvDriver = computeHTVContribution(inputs.htvScore);
  if (htvDriver) drivers.push(htvDriver);

  // Data quality factor
  const dataQualityDriver = computeDataQualityContribution(inputs.missingSignals);
  if (dataQualityDriver) drivers.push(dataQualityDriver);

  // Conflicting evidence factor
  if (inputs.conflictingSignals.length > 0) {
    drivers.push({
      factor: 'conflicting_evidence',
      contribution: 0.1,
      details: `Conflicting signals: ${inputs.conflictingSignals.join(', ')}`,
    });
  }

  // Debate consensus factor
  if (!inputs.verifierAgreed) {
    drivers.push({
      factor: 'debate_consensus',
      contribution: 0.1,
      details: 'Generator-Verifier disagreement in ArgMed debate',
    });
  }

  // Staleness factor
  const stalenessDriver = computeStalenessContribution(inputs.dataAgeDays);
  if (stalenessDriver) drivers.push(stalenessDriver);

  // Sum contributions and clamp to [0, 1]
  const score = Math.min(
    1.0,
    Math.max(
      0.0,
      drivers.reduce((sum, d) => sum + d.contribution, 0)
    )
  );

  return {
    level: scoreToLevel(score),
    score,
    drivers,
  };
}

/**
 * Create a "low" uncertainty calibration (no uncertainty drivers).
 * Useful for default/fallback scenarios.
 */
export function createLowUncertainty(): UncertaintyCalibration {
  return {
    level: 'low',
    score: 0,
    drivers: [],
  };
}

/**
 * Check if uncertainty is acceptable for autonomous action.
 *
 * @param uncertainty - The uncertainty calibration
 * @param maxLevel - Maximum acceptable level (default: 'medium')
 * @returns True if uncertainty level is at or below maxLevel
 */
export function isUncertaintyAcceptable(
  uncertainty: UncertaintyCalibration,
  maxLevel: UncertaintyLevel = 'medium'
): boolean {
  const levelOrder: Record<UncertaintyLevel, number> = {
    low: 0,
    medium: 1,
    high: 2,
  };
  return levelOrder[uncertainty.level] <= levelOrder[maxLevel];
}
