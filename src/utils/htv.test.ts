/**
 * Tests for HTV score computation
 *
 * @see 03-hermes-specs/04-hermes-epistemological-types.md — Section 3
 * @see 00-overall-specs/0A-epistemology/01-hard-to-vary-explanations.md
 */

import { describe, expect, it } from 'bun:test';
import { computeHTVScore, createPoorHTVScore, meetsHTVThreshold } from './htv';

describe('computeHTVScore', () => {
  describe('with default weights', () => {
    it('should compute composite as average of dimensions', () => {
      const score = computeHTVScore({
        interdependence: 0.4,
        specificity: 0.4,
        parsimony: 0.4,
        falsifiability: 0.4,
      });

      expect(score.composite).toBe(0.4);
    });

    it('should handle maximum values', () => {
      const score = computeHTVScore({
        interdependence: 1.0,
        specificity: 1.0,
        parsimony: 1.0,
        falsifiability: 1.0,
      });

      expect(score.composite).toBe(1.0);
    });

    it('should handle minimum values', () => {
      const score = computeHTVScore({
        interdependence: 0.0,
        specificity: 0.0,
        parsimony: 0.0,
        falsifiability: 0.0,
      });

      expect(score.composite).toBe(0.0);
    });

    it('should compute mixed values correctly', () => {
      const score = computeHTVScore({
        interdependence: 0.8,
        specificity: 0.6,
        parsimony: 0.4,
        falsifiability: 0.2,
      });

      // (0.8 + 0.6 + 0.4 + 0.2) / 4 = 0.5
      expect(score.composite).toBeCloseTo(0.5, 5);
    });
  });

  describe('with custom weights', () => {
    it('should apply custom weights', () => {
      const score = computeHTVScore(
        {
          interdependence: 1.0,
          specificity: 0.0,
          parsimony: 0.0,
          falsifiability: 0.0,
        },
        {
          interdependence: 1.0,
          specificity: 0.0,
          parsimony: 0.0,
          falsifiability: 0.0,
        }
      );

      expect(score.composite).toBe(1.0);
    });

    it('should partially override weights', () => {
      const score = computeHTVScore(
        {
          interdependence: 1.0,
          specificity: 0.0,
          parsimony: 0.0,
          falsifiability: 0.0,
        },
        {
          interdependence: 0.5, // Override only this
        }
      );

      // 0.5 * 1.0 + 0.25 * 0 + 0.25 * 0 + 0.25 * 0 = 0.5
      expect(score.composite).toBe(0.5);
    });
  });

  describe('validation', () => {
    it('should throw for interdependence > 1', () => {
      expect(() =>
        computeHTVScore({
          interdependence: 1.1,
          specificity: 0.5,
          parsimony: 0.5,
          falsifiability: 0.5,
        })
      ).toThrow(/interdependence.*must be between 0 and 1/);
    });

    it('should throw for negative values', () => {
      expect(() =>
        computeHTVScore({
          interdependence: -0.1,
          specificity: 0.5,
          parsimony: 0.5,
          falsifiability: 0.5,
        })
      ).toThrow(/interdependence.*must be between 0 and 1/);
    });

    it('should throw for NaN values', () => {
      expect(() =>
        computeHTVScore({
          interdependence: Number.NaN,
          specificity: 0.5,
          parsimony: 0.5,
          falsifiability: 0.5,
        })
      ).toThrow(/interdependence.*must be a number/);
    });
  });

  describe('worked examples from specification', () => {
    it('should compute poor HTV example correctly', () => {
      // Example 1: "Patient may have a cardiac issue" (avoid)
      const score = computeHTVScore({
        interdependence: 0.2, // no specific mechanism linking symptoms
        specificity: 0.1, // no testable prediction
        parsimony: 0.3, // vague, could mean many things
        falsifiability: 0.1, // nothing would clearly refute this
      });

      expect(score.composite).toBeCloseTo(0.175, 3);
      expect(score.composite).toBeLessThan(0.3); // refuted level
    });

    it('should compute good HTV example correctly', () => {
      // Example 2: Specific HFrEF diagnosis (target)
      const score = computeHTVScore({
        interdependence: 0.9, // mechanism links all findings
        specificity: 0.9, // precise, measurable claims
        parsimony: 0.8, // minimal elements, all necessary
        falsifiability: 0.9, // if BNP normal or weight stable, claim refuted
      });

      expect(score.composite).toBeCloseTo(0.875, 3);
      expect(score.composite).toBeGreaterThanOrEqual(0.7); // good level
    });
  });

  describe('dimension preservation', () => {
    it('should preserve all input dimensions in output', () => {
      const score = computeHTVScore({
        interdependence: 0.7,
        specificity: 0.8,
        parsimony: 0.6,
        falsifiability: 0.9,
      });

      expect(score.interdependence).toBe(0.7);
      expect(score.specificity).toBe(0.8);
      expect(score.parsimony).toBe(0.6);
      expect(score.falsifiability).toBe(0.9);
    });
  });
});

describe('createPoorHTVScore', () => {
  it('should create a score with all zeros', () => {
    const score = createPoorHTVScore();

    expect(score.interdependence).toBe(0);
    expect(score.specificity).toBe(0);
    expect(score.parsimony).toBe(0);
    expect(score.falsifiability).toBe(0);
    expect(score.composite).toBe(0);
  });
});

describe('meetsHTVThreshold', () => {
  it('should return true when score meets default threshold (0.4)', () => {
    const score = computeHTVScore({
      interdependence: 0.5,
      specificity: 0.5,
      parsimony: 0.5,
      falsifiability: 0.5,
    });

    expect(meetsHTVThreshold(score)).toBe(true);
  });

  it('should return false when score is below default threshold', () => {
    const score = computeHTVScore({
      interdependence: 0.3,
      specificity: 0.3,
      parsimony: 0.3,
      falsifiability: 0.3,
    });

    expect(meetsHTVThreshold(score)).toBe(false);
  });

  it('should use custom threshold', () => {
    const score = computeHTVScore({
      interdependence: 0.6,
      specificity: 0.6,
      parsimony: 0.6,
      falsifiability: 0.6,
    });

    expect(meetsHTVThreshold(score, 0.7)).toBe(false);
    expect(meetsHTVThreshold(score, 0.5)).toBe(true);
  });

  it('should return true at exact threshold', () => {
    const score = computeHTVScore({
      interdependence: 0.4,
      specificity: 0.4,
      parsimony: 0.4,
      falsifiability: 0.4,
    });

    expect(meetsHTVThreshold(score, 0.4)).toBe(true);
  });
});
