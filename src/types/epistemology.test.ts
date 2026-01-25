/**
 * Tests for epistemology types
 *
 */

import { describe, expect, it } from 'bun:test';
import {
  CLAIM_TYPES,
  CLAIM_TYPE_RISK,
  EVIDENCE_GRADES,
  EVIDENCE_GRADE_STRENGTH,
  HTV_DEFAULT_WEIGHTS,
  REFUTATION_ACTIONS,
  compareEvidenceGrades,
  getEffectiveEvidenceGrade,
  getHTVQualityLevel,
} from './epistemology';

describe('ClaimType', () => {
  describe('CLAIM_TYPES', () => {
    it('should contain all claim types', () => {
      expect(CLAIM_TYPES).toHaveLength(8);
      expect(CLAIM_TYPES).toContain('observation');
      expect(CLAIM_TYPES).toContain('diagnosis');
      expect(CLAIM_TYPES).toContain('prognosis');
      expect(CLAIM_TYPES).toContain('treatment_rec');
      expect(CLAIM_TYPES).toContain('lifestyle_rec');
      expect(CLAIM_TYPES).toContain('diagnostic_prompt');
      expect(CLAIM_TYPES).toContain('escalation');
      expect(CLAIM_TYPES).toContain('administrative');
    });
  });

  describe('CLAIM_TYPE_RISK', () => {
    it('should have risk profiles for all claim types', () => {
      for (const claimType of CLAIM_TYPES) {
        expect(CLAIM_TYPE_RISK[claimType]).toBeDefined();
        expect(CLAIM_TYPE_RISK[claimType].riskLevel).toMatch(/^(low|medium|high)$/);
        expect(typeof CLAIM_TYPE_RISK[claimType].requiresPopper).toBe('boolean');
      }
    });

    it('should mark diagnosis as high-risk requiring Popper', () => {
      expect(CLAIM_TYPE_RISK.diagnosis.riskLevel).toBe('high');
      expect(CLAIM_TYPE_RISK.diagnosis.requiresPopper).toBe(true);
    });

    it('should mark treatment_rec as high-risk requiring Popper', () => {
      expect(CLAIM_TYPE_RISK.treatment_rec.riskLevel).toBe('high');
      expect(CLAIM_TYPE_RISK.treatment_rec.requiresPopper).toBe(true);
    });

    it('should mark observation as low-risk not requiring Popper', () => {
      expect(CLAIM_TYPE_RISK.observation.riskLevel).toBe('low');
      expect(CLAIM_TYPE_RISK.observation.requiresPopper).toBe(false);
    });

    it('should mark administrative as low-risk not requiring Popper', () => {
      expect(CLAIM_TYPE_RISK.administrative.riskLevel).toBe('low');
      expect(CLAIM_TYPE_RISK.administrative.requiresPopper).toBe(false);
    });

    it('should mark escalation as medium-risk requiring Popper', () => {
      expect(CLAIM_TYPE_RISK.escalation.riskLevel).toBe('medium');
      expect(CLAIM_TYPE_RISK.escalation.requiresPopper).toBe(true);
    });
  });
});

describe('EvidenceGrade', () => {
  describe('EVIDENCE_GRADES', () => {
    it('should contain all evidence grades', () => {
      expect(EVIDENCE_GRADES).toHaveLength(10);
      expect(EVIDENCE_GRADES).toContain('systematic_review');
      expect(EVIDENCE_GRADES).toContain('rct');
      expect(EVIDENCE_GRADES).toContain('cohort');
      expect(EVIDENCE_GRADES).toContain('case_control');
      expect(EVIDENCE_GRADES).toContain('case_series');
      expect(EVIDENCE_GRADES).toContain('case_report');
      expect(EVIDENCE_GRADES).toContain('expert_opinion');
      expect(EVIDENCE_GRADES).toContain('policy');
      expect(EVIDENCE_GRADES).toContain('patient_reported');
      expect(EVIDENCE_GRADES).toContain('calculated');
    });
  });

  describe('EVIDENCE_GRADE_STRENGTH', () => {
    it('should have strength values for all grades', () => {
      for (const grade of EVIDENCE_GRADES) {
        expect(typeof EVIDENCE_GRADE_STRENGTH[grade]).toBe('number');
        expect(EVIDENCE_GRADE_STRENGTH[grade]).toBeGreaterThan(0);
      }
    });

    it('should rank systematic_review as strongest (1)', () => {
      expect(EVIDENCE_GRADE_STRENGTH.systematic_review).toBe(1);
    });

    it('should rank expert_opinion as weakest in main hierarchy (7)', () => {
      expect(EVIDENCE_GRADE_STRENGTH.expert_opinion).toBe(7);
    });

    it('should follow correct hierarchy ordering', () => {
      expect(EVIDENCE_GRADE_STRENGTH.systematic_review).toBeLessThan(EVIDENCE_GRADE_STRENGTH.rct);
      expect(EVIDENCE_GRADE_STRENGTH.rct).toBeLessThan(EVIDENCE_GRADE_STRENGTH.cohort);
      expect(EVIDENCE_GRADE_STRENGTH.cohort).toBeLessThan(EVIDENCE_GRADE_STRENGTH.case_control);
      expect(EVIDENCE_GRADE_STRENGTH.case_control).toBeLessThan(
        EVIDENCE_GRADE_STRENGTH.case_series
      );
      expect(EVIDENCE_GRADE_STRENGTH.case_series).toBeLessThan(EVIDENCE_GRADE_STRENGTH.case_report);
      expect(EVIDENCE_GRADE_STRENGTH.case_report).toBeLessThan(
        EVIDENCE_GRADE_STRENGTH.expert_opinion
      );
    });

    it('should map policy to cohort level (3)', () => {
      expect(EVIDENCE_GRADE_STRENGTH.policy).toBe(3);
    });

    it('should map patient_reported to case_report level (6)', () => {
      expect(EVIDENCE_GRADE_STRENGTH.patient_reported).toBe(6);
    });

    it('should map calculated to cohort level (3)', () => {
      expect(EVIDENCE_GRADE_STRENGTH.calculated).toBe(3);
    });
  });

  describe('compareEvidenceGrades', () => {
    it('should return negative when first grade is stronger', () => {
      expect(compareEvidenceGrades('systematic_review', 'rct')).toBeLessThan(0);
      expect(compareEvidenceGrades('rct', 'cohort')).toBeLessThan(0);
    });

    it('should return positive when second grade is stronger', () => {
      expect(compareEvidenceGrades('expert_opinion', 'rct')).toBeGreaterThan(0);
      expect(compareEvidenceGrades('case_report', 'cohort')).toBeGreaterThan(0);
    });

    it('should return zero for equal grades', () => {
      expect(compareEvidenceGrades('rct', 'rct')).toBe(0);
      expect(compareEvidenceGrades('cohort', 'cohort')).toBe(0);
    });

    it('should handle special grades correctly', () => {
      // policy == cohort
      expect(compareEvidenceGrades('policy', 'cohort')).toBe(0);
      // patient_reported == case_report
      expect(compareEvidenceGrades('patient_reported', 'case_report')).toBe(0);
    });
  });

  describe('getEffectiveEvidenceGrade', () => {
    it('should map policy to cohort', () => {
      expect(getEffectiveEvidenceGrade('policy')).toBe('cohort');
    });

    it('should map patient_reported to case_report', () => {
      expect(getEffectiveEvidenceGrade('patient_reported')).toBe('case_report');
    });

    it('should map calculated to cohort', () => {
      expect(getEffectiveEvidenceGrade('calculated')).toBe('cohort');
    });

    it('should return main hierarchy grades unchanged', () => {
      expect(getEffectiveEvidenceGrade('systematic_review')).toBe('systematic_review');
      expect(getEffectiveEvidenceGrade('rct')).toBe('rct');
      expect(getEffectiveEvidenceGrade('cohort')).toBe('cohort');
      expect(getEffectiveEvidenceGrade('expert_opinion')).toBe('expert_opinion');
    });
  });
});

describe('HTVScore', () => {
  describe('HTV_DEFAULT_WEIGHTS', () => {
    it('should have equal weights summing to 1', () => {
      const sum =
        HTV_DEFAULT_WEIGHTS.interdependence +
        HTV_DEFAULT_WEIGHTS.specificity +
        HTV_DEFAULT_WEIGHTS.parsimony +
        HTV_DEFAULT_WEIGHTS.falsifiability;
      expect(sum).toBe(1.0);
    });

    it('should have 0.25 for each dimension', () => {
      expect(HTV_DEFAULT_WEIGHTS.interdependence).toBe(0.25);
      expect(HTV_DEFAULT_WEIGHTS.specificity).toBe(0.25);
      expect(HTV_DEFAULT_WEIGHTS.parsimony).toBe(0.25);
      expect(HTV_DEFAULT_WEIGHTS.falsifiability).toBe(0.25);
    });
  });

  describe('getHTVQualityLevel', () => {
    it('should return "excellent" for scores >= 0.9', () => {
      expect(getHTVQualityLevel(0.9)).toBe('excellent');
      expect(getHTVQualityLevel(0.95)).toBe('excellent');
      expect(getHTVQualityLevel(1.0)).toBe('excellent');
    });

    it('should return "good" for scores >= 0.7 and < 0.9', () => {
      expect(getHTVQualityLevel(0.7)).toBe('good');
      expect(getHTVQualityLevel(0.8)).toBe('good');
      expect(getHTVQualityLevel(0.89)).toBe('good');
    });

    it('should return "moderate" for scores >= 0.4 and < 0.7', () => {
      expect(getHTVQualityLevel(0.4)).toBe('moderate');
      expect(getHTVQualityLevel(0.5)).toBe('moderate');
      expect(getHTVQualityLevel(0.69)).toBe('moderate');
    });

    it('should return "poor" for scores >= 0.3 and < 0.4', () => {
      expect(getHTVQualityLevel(0.3)).toBe('poor');
      expect(getHTVQualityLevel(0.35)).toBe('poor');
      expect(getHTVQualityLevel(0.39)).toBe('poor');
    });

    it('should return "refuted" for scores < 0.3', () => {
      expect(getHTVQualityLevel(0.29)).toBe('refuted');
      expect(getHTVQualityLevel(0.1)).toBe('refuted');
      expect(getHTVQualityLevel(0.0)).toBe('refuted');
    });

    // Test worked examples from specification
    it('should classify poor HTV example as refuted (composite 0.175)', () => {
      // Example 1 from spec: "Patient may have a cardiac issue"
      const poorHTV = 0.175;
      expect(getHTVQualityLevel(poorHTV)).toBe('refuted');
    });

    it('should classify good HTV example as good (composite 0.875)', () => {
      // Example 2 from spec: Specific HFrEF diagnosis
      // 0.875 is >= 0.7 and < 0.9, so it's "good" (not "excellent")
      const goodHTV = 0.875;
      expect(getHTVQualityLevel(goodHTV)).toBe('good');
    });
  });
});

describe('FalsificationCriteria', () => {
  describe('REFUTATION_ACTIONS', () => {
    it('should contain all refutation actions', () => {
      expect(REFUTATION_ACTIONS).toHaveLength(4);
      expect(REFUTATION_ACTIONS).toContain('route_to_clinician');
      expect(REFUTATION_ACTIONS).toContain('hard_stop');
      expect(REFUTATION_ACTIONS).toContain('modify_recommendation');
      expect(REFUTATION_ACTIONS).toContain('log_only');
    });
  });
});
