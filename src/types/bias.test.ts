/**
 * Tests for Bias Detection types
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 4.4
 */

import { describe, expect, it } from 'bun:test';
import { createIsoDateTime } from '../utils/datetime';
import { createTraceContext } from '../utils/trace';
import {
  BIAS_DETECTION_THRESHOLDS,
  BIAS_DETECTION_TYPES,
  BIAS_DIMENSION_TYPES,
  BIAS_RECOMMENDATION_ACTIONS,
  BIAS_SEVERITIES,
  type BiasAffectedDimension,
  type BiasAnalysisPeriod,
  type BiasDetectionEvent,
  type BiasMetrics,
  type BiasRecommendation,
  MIN_BIAS_SAMPLE_SIZE,
} from './bias';
import { CURRENT_HERMES_VERSION } from './core';

// =============================================================================
// BiasDetectionType Tests
// =============================================================================

describe('BiasDetectionType', () => {
  it('should have all expected detection types', () => {
    expect(BIAS_DETECTION_TYPES).toContain('demographic_override_disparity');
    expect(BIAS_DETECTION_TYPES).toContain('intervention_type_bias');
    expect(BIAS_DETECTION_TYPES).toContain('clinician_specialty_bias');
    expect(BIAS_DETECTION_TYPES).toContain('other');
    expect(BIAS_DETECTION_TYPES).toHaveLength(4);
  });
});

// =============================================================================
// BiasSeverity Tests
// =============================================================================

describe('BiasSeverity', () => {
  it('should have all expected severity levels', () => {
    expect(BIAS_SEVERITIES).toContain('info');
    expect(BIAS_SEVERITIES).toContain('warning');
    expect(BIAS_SEVERITIES).toContain('critical');
    expect(BIAS_SEVERITIES).toHaveLength(3);
  });
});

// =============================================================================
// BiasDimensionType Tests
// =============================================================================

describe('BiasDimensionType', () => {
  it('should have all expected dimension types', () => {
    expect(BIAS_DIMENSION_TYPES).toContain('age_group');
    expect(BIAS_DIMENSION_TYPES).toContain('intervention_kind');
    expect(BIAS_DIMENSION_TYPES).toContain('medication_class');
    expect(BIAS_DIMENSION_TYPES).toContain('clinician_specialty');
    expect(BIAS_DIMENSION_TYPES).toContain('other');
    expect(BIAS_DIMENSION_TYPES).toHaveLength(5);
  });
});

// =============================================================================
// BiasRecommendationAction Tests
// =============================================================================

describe('BiasRecommendationAction', () => {
  it('should have all expected recommendation actions', () => {
    expect(BIAS_RECOMMENDATION_ACTIONS).toContain('review_proposal_logic');
    expect(BIAS_RECOMMENDATION_ACTIONS).toContain('increase_clinician_routing');
    expect(BIAS_RECOMMENDATION_ACTIONS).toContain('model_recalibration');
    expect(BIAS_RECOMMENDATION_ACTIONS).toContain('training_data_review');
    expect(BIAS_RECOMMENDATION_ACTIONS).toContain('other');
    expect(BIAS_RECOMMENDATION_ACTIONS).toHaveLength(5);
  });
});

// =============================================================================
// Threshold Tests
// =============================================================================

describe('Bias Detection Thresholds', () => {
  it('should have correct threshold values', () => {
    expect(BIAS_DETECTION_THRESHOLDS.rate_difference_warning).toBe(0.15);
    expect(BIAS_DETECTION_THRESHOLDS.rate_difference_critical).toBe(0.25);
    expect(BIAS_DETECTION_THRESHOLDS.rate_ratio_warning).toBe(1.5);
    expect(BIAS_DETECTION_THRESHOLDS.rate_ratio_critical).toBe(2.0);
  });

  it('should have minimum sample size for statistical validity', () => {
    expect(MIN_BIAS_SAMPLE_SIZE).toBe(30);
  });
});

// =============================================================================
// BiasAnalysisPeriod Tests
// =============================================================================

describe('BiasAnalysisPeriod', () => {
  it('should create a valid analysis period', () => {
    const period: BiasAnalysisPeriod = {
      start: createIsoDateTime(),
      end: createIsoDateTime(),
      days: 30,
    };

    expect(period.days).toBe(30);
  });
});

// =============================================================================
// BiasAffectedDimension Tests
// =============================================================================

describe('BiasAffectedDimension', () => {
  it('should create a valid affected dimension', () => {
    const dimension: BiasAffectedDimension = {
      dimension_type: 'age_group',
      dimension_value: 'geriatric',
    };

    expect(dimension.dimension_type).toBe('age_group');
    expect(dimension.dimension_value).toBe('geriatric');
  });
});

// =============================================================================
// BiasMetrics Tests
// =============================================================================

describe('BiasMetrics', () => {
  it('should create valid bias metrics', () => {
    const metrics: BiasMetrics = {
      overall_override_rate: 0.15,
      affected_group_override_rate: 0.25,
      control_group_override_rate: 0.1,
      rate_difference: 0.15,
      rate_ratio: 2.5,
      sample_size_affected: 150,
      sample_size_control: 200,
    };

    expect(metrics.rate_difference).toBe(0.15);
    expect(metrics.rate_ratio).toBe(2.5);
  });

  it('should support statistical significance', () => {
    const metrics: BiasMetrics = {
      overall_override_rate: 0.15,
      affected_group_override_rate: 0.25,
      control_group_override_rate: 0.1,
      rate_difference: 0.15,
      rate_ratio: 2.5,
      sample_size_affected: 150,
      sample_size_control: 200,
      statistical_significance: {
        p_value: 0.001,
        confidence_interval_95: [0.1, 0.2],
        is_significant: true,
      },
    };

    expect(metrics.statistical_significance?.is_significant).toBe(true);
    expect(metrics.statistical_significance?.p_value).toBe(0.001);
  });
});

// =============================================================================
// BiasRecommendation Tests
// =============================================================================

describe('BiasRecommendation', () => {
  it('should create a valid recommendation', () => {
    const recommendation: BiasRecommendation = {
      priority: 'high',
      action: 'review_proposal_logic',
      description: 'Review medication dosing logic for geriatric patients',
    };

    expect(recommendation.priority).toBe('high');
    expect(recommendation.action).toBe('review_proposal_logic');
  });
});

// =============================================================================
// BiasDetectionEvent Tests
// =============================================================================

describe('BiasDetectionEvent', () => {
  it('should create a valid bias detection event', () => {
    const trace = createTraceContext({
      system: 'popper',
      service_version: '1.0.0',
    });

    const event: BiasDetectionEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'bias_detection',
      trace,
      mode: 'advocate_clinical',
      organization_id: 'org_ta3_alpha',
      detection_id: 'bias_001',
      detection_type: 'demographic_override_disparity',
      severity: 'warning',
      detected_at: createIsoDateTime(),
      analysis_period: {
        start: createIsoDateTime(),
        end: createIsoDateTime(),
        days: 30,
      },
      affected_dimension: {
        dimension_type: 'age_group',
        dimension_value: 'geriatric',
      },
      metrics: {
        overall_override_rate: 0.15,
        affected_group_override_rate: 0.28,
        control_group_override_rate: 0.1,
        rate_difference: 0.18,
        rate_ratio: 2.8,
        sample_size_affected: 150,
        sample_size_control: 200,
      },
      recommendations: [
        {
          priority: 'high',
          action: 'review_proposal_logic',
          description: 'Review medication dosing for geriatric patients',
        },
      ],
      audit_redaction: {
        summary: 'Demographic override disparity detected in geriatric population',
        detection_type: 'demographic_override_disparity',
        severity: 'warning',
        affected_dimension: 'age_group:geriatric',
        rate_difference: '18%',
        recommendations_count: 1,
      },
    };

    expect(event.message_type).toBe('bias_detection');
    expect(event.detection_type).toBe('demographic_override_disparity');
    expect(event.severity).toBe('warning');
  });

  it('should support critical severity with regulatory context', () => {
    const trace = createTraceContext({
      system: 'popper',
      service_version: '1.0.0',
    });

    const event: BiasDetectionEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'bias_detection',
      trace,
      mode: 'advocate_clinical',
      organization_id: 'org_ta3_beta',
      detection_id: 'bias_critical_001',
      detection_type: 'demographic_override_disparity',
      severity: 'critical',
      detected_at: createIsoDateTime(),
      analysis_period: {
        start: createIsoDateTime(),
        end: createIsoDateTime(),
        days: 90,
      },
      affected_dimension: {
        dimension_type: 'age_group',
        dimension_value: 'pediatric',
      },
      metrics: {
        overall_override_rate: 0.2,
        affected_group_override_rate: 0.45,
        control_group_override_rate: 0.15,
        rate_difference: 0.3,
        rate_ratio: 3.0,
        sample_size_affected: 100,
        sample_size_control: 300,
        statistical_significance: {
          p_value: 0.0001,
          confidence_interval_95: [0.25, 0.35],
          is_significant: true,
        },
      },
      recommendations: [
        {
          priority: 'high',
          action: 'model_recalibration',
          description: 'Recalibrate model for pediatric population',
        },
        {
          priority: 'high',
          action: 'training_data_review',
          description: 'Review training data representation',
        },
      ],
      regulatory_context: {
        fda_requirement: 'Post-market surveillance for demographic bias',
        guidance_reference: 'FDA AI/ML Guidance 2025, Section 4.3',
        reporting_required: true,
        reporting_deadline_days: 30,
      },
      audit_redaction: {
        summary: 'Critical bias detected in pediatric population',
        detection_type: 'demographic_override_disparity',
        severity: 'critical',
        affected_dimension: 'age_group:pediatric',
        rate_difference: '30%',
        sample_sizes: 'affected: 100, control: 300',
        recommendations_count: 2,
      },
    };

    expect(event.severity).toBe('critical');
    expect(event.regulatory_context?.reporting_required).toBe(true);
    expect(event.recommendations).toHaveLength(2);
  });

  it('should support category breakdown', () => {
    const trace = createTraceContext({
      system: 'popper',
      service_version: '1.0.0',
    });

    const event: BiasDetectionEvent = {
      hermes_version: CURRENT_HERMES_VERSION,
      message_type: 'bias_detection',
      trace,
      mode: 'advocate_clinical',
      organization_id: 'org_ta3_gamma',
      detection_id: 'bias_breakdown_001',
      detection_type: 'intervention_type_bias',
      severity: 'info',
      detected_at: createIsoDateTime(),
      analysis_period: {
        start: createIsoDateTime(),
        end: createIsoDateTime(),
        days: 30,
      },
      affected_dimension: {
        dimension_type: 'intervention_kind',
        dimension_value: 'MEDICATION_ORDER_PROPOSAL',
      },
      metrics: {
        overall_override_rate: 0.12,
        affected_group_override_rate: 0.15,
        control_group_override_rate: 0.1,
        rate_difference: 0.05,
        rate_ratio: 1.5,
        sample_size_affected: 200,
        sample_size_control: 150,
      },
      breakdown_by_category: [
        {
          rationale_category: 'clinical_judgment',
          override_count: 50,
          percentage: 0.4,
        },
        {
          rationale_category: 'contraindication',
          override_count: 30,
          percentage: 0.24,
        },
        {
          rationale_category: 'drug_interaction',
          override_count: 20,
          percentage: 0.16,
        },
      ],
      affected_intervention_kinds: [
        {
          kind: 'MEDICATION_ORDER_PROPOSAL',
          override_rate: 0.15,
        },
        {
          kind: 'LIFESTYLE_MODIFICATION_PROPOSAL',
          override_rate: 0.08,
        },
      ],
      recommendations: [
        {
          priority: 'low',
          action: 'review_proposal_logic',
          description: 'Monitor medication override patterns',
        },
      ],
      audit_redaction: {
        summary: 'Intervention type bias analysis',
        detection_type: 'intervention_type_bias',
        severity: 'info',
        affected_dimension: 'intervention_kind:MEDICATION_ORDER_PROPOSAL',
        rate_difference: '5%',
        recommendations_count: 1,
      },
    };

    expect(event.breakdown_by_category).toHaveLength(3);
    expect(event.affected_intervention_kinds).toHaveLength(2);
  });
});
