/**
 * Tests for uncertainty calibration
 *
 * @see 00-overall-specs/0A-epistemology/04-fallibilism-and-error-correction.md
 */

import { describe, expect, it } from 'bun:test';
import {
  UNCERTAINTY_THRESHOLDS,
  computeUncertainty,
  createLowUncertainty,
  isUncertaintyAcceptable,
} from './uncertainty';

describe('computeUncertainty', () => {
  describe('evidence grade factor', () => {
    it('should add 0.3 for expert_opinion', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'expert_opinion',
        htvScore: 0.8, // high, no contribution
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.3);
      expect(result.drivers).toHaveLength(1);
      expect(result.drivers[0].factor).toBe('evidence_grade');
      expect(result.drivers[0].contribution).toBe(0.3);
    });

    it('should add 0.3 for case_report', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'case_report',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.3);
    });

    it('should add 0.2 for case_series', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'case_series',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.2);
    });

    it('should add 0.1 for cohort', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'cohort',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.1);
    });

    it('should add 0 for rct', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'rct',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0);
    });

    it('should add 0 for systematic_review', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'systematic_review',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0);
    });

    it('should map patient_reported to case_report (0.3)', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'patient_reported',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.3);
    });

    it('should map policy to cohort (0.1)', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'policy',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.1);
    });
  });

  describe('HTV score factor', () => {
    it('should add 0.3 for HTV < 0.4', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'systematic_review',
        htvScore: 0.35,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.3);
      expect(result.drivers[0].factor).toBe('htv_score');
    });

    it('should add 0.15 for HTV >= 0.4 and < 0.7', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'systematic_review',
        htvScore: 0.5,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.15);
    });

    it('should add 0 for HTV >= 0.7', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'systematic_review',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0);
    });
  });

  describe('data quality factor', () => {
    it('should add 0.15 for > 2 missing signals', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'systematic_review',
        htvScore: 0.8,
        missingSignals: ['signal1', 'signal2', 'signal3'],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.15);
      expect(result.drivers[0].factor).toBe('data_quality');
    });

    it('should add 0.08 for 1-2 missing signals', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'systematic_review',
        htvScore: 0.8,
        missingSignals: ['signal1'],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.08);
    });

    it('should add 0 for no missing signals', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'systematic_review',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0);
    });
  });

  describe('conflicting evidence factor', () => {
    it('should add 0.1 for conflicting signals', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'systematic_review',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: ['bp_systolic', 'bp_diastolic'],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.1);
      expect(result.drivers[0].factor).toBe('conflicting_evidence');
    });
  });

  describe('debate consensus factor', () => {
    it('should add 0.1 when verifier disagreed', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'systematic_review',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: false,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.1);
      expect(result.drivers[0].factor).toBe('debate_consensus');
    });

    it('should add 0 when verifier agreed', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'systematic_review',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0);
    });
  });

  describe('staleness factor', () => {
    it('should add 0.1 for data > 30 days old', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'systematic_review',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 31,
      });

      expect(result.score).toBe(0.1);
      expect(result.drivers[0].factor).toBe('staleness');
    });

    it('should add 0.05 for data 15-30 days old', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'systematic_review',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 20,
      });

      expect(result.score).toBe(0.05);
    });

    it('should add 0 for fresh data', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'systematic_review',
        htvScore: 0.8,
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 7,
      });

      expect(result.score).toBe(0);
    });
  });

  describe('level classification', () => {
    it('should classify as "high" for score >= 0.6', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'expert_opinion', // 0.3
        htvScore: 0.35, // 0.3
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.6);
      expect(result.level).toBe('high');
    });

    it('should classify as "medium" for score 0.3-0.6', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'expert_opinion', // 0.3
        htvScore: 0.8, // 0
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.3);
      expect(result.level).toBe('medium');
    });

    it('should classify as "low" for score < 0.3', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'cohort', // 0.1
        htvScore: 0.8, // 0
        missingSignals: [],
        conflictingSignals: [],
        verifierAgreed: true,
        dataAgeDays: 0,
      });

      expect(result.score).toBe(0.1);
      expect(result.level).toBe('low');
    });
  });

  describe('score clamping', () => {
    it('should clamp score to maximum 1.0', () => {
      // Combine many factors to potentially exceed 1.0
      const result = computeUncertainty({
        minEvidenceGrade: 'expert_opinion', // 0.3
        htvScore: 0.35, // 0.3
        missingSignals: ['a', 'b', 'c'], // 0.15
        conflictingSignals: ['x'], // 0.1
        verifierAgreed: false, // 0.1
        dataAgeDays: 45, // 0.1
      });

      // Sum would be 1.05, but should be clamped
      expect(result.score).toBe(1.0);
    });
  });

  describe('combined factors', () => {
    it('should accumulate multiple factors correctly', () => {
      const result = computeUncertainty({
        minEvidenceGrade: 'case_series', // 0.2
        htvScore: 0.5, // 0.15
        missingSignals: ['ejection_fraction'], // 0.08
        conflictingSignals: [],
        verifierAgreed: false, // 0.1
        dataAgeDays: 20, // 0.05
      });

      // 0.2 + 0.15 + 0.08 + 0.1 + 0.05 = 0.58
      expect(result.score).toBeCloseTo(0.58, 2);
      expect(result.level).toBe('medium');
      // 5 drivers: evidence_grade, htv_score, data_quality, debate_consensus, staleness
      expect(result.drivers).toHaveLength(5);
    });
  });
});

describe('createLowUncertainty', () => {
  it('should create uncertainty with level "low"', () => {
    const result = createLowUncertainty();

    expect(result.level).toBe('low');
    expect(result.score).toBe(0);
    expect(result.drivers).toHaveLength(0);
  });
});

describe('isUncertaintyAcceptable', () => {
  it('should return true for low uncertainty with default max', () => {
    const uncertainty = createLowUncertainty();
    expect(isUncertaintyAcceptable(uncertainty)).toBe(true);
  });

  it('should return true for medium uncertainty with default max', () => {
    const uncertainty = { level: 'medium' as const, score: 0.4, drivers: [] };
    expect(isUncertaintyAcceptable(uncertainty)).toBe(true);
  });

  it('should return false for high uncertainty with default max', () => {
    const uncertainty = { level: 'high' as const, score: 0.7, drivers: [] };
    expect(isUncertaintyAcceptable(uncertainty)).toBe(false);
  });

  it('should use custom max level', () => {
    const medium = { level: 'medium' as const, score: 0.4, drivers: [] };
    expect(isUncertaintyAcceptable(medium, 'low')).toBe(false);
    expect(isUncertaintyAcceptable(medium, 'medium')).toBe(true);
    expect(isUncertaintyAcceptable(medium, 'high')).toBe(true);
  });
});

describe('UNCERTAINTY_THRESHOLDS', () => {
  it('should have correct thresholds', () => {
    expect(UNCERTAINTY_THRESHOLDS.HIGH).toBe(0.6);
    expect(UNCERTAINTY_THRESHOLDS.MEDIUM).toBe(0.3);
  });
});
