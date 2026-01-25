import { describe, expect, it } from 'bun:test';
import {
  generateTraceId,
  generateSpanId,
  createTraceContext,
  createSpan,
  isValidTraceId,
  isValidSpanId,
} from './trace';
import { isIsoDateTime } from './datetime';
import type { TraceProducer } from '../types/core';

describe('Trace Utilities', () => {
  const testProducer: TraceProducer = {
    system: 'deutsch',
    service_version: '1.0.0',
  };

  describe('generateTraceId', () => {
    it('should generate 32-character hex string', () => {
      const traceId = generateTraceId();
      expect(traceId).toHaveLength(32);
      expect(traceId).toMatch(/^[0-9a-f]{32}$/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateTraceId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('generateSpanId', () => {
    it('should generate 16-character hex string', () => {
      const spanId = generateSpanId();
      expect(spanId).toHaveLength(16);
      expect(spanId).toMatch(/^[0-9a-f]{16}$/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateSpanId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('isValidTraceId', () => {
    it('should return true for valid trace IDs', () => {
      expect(isValidTraceId('0123456789abcdef0123456789abcdef')).toBe(true);
      expect(isValidTraceId(generateTraceId())).toBe(true);
    });

    it('should return false for invalid trace IDs', () => {
      expect(isValidTraceId('')).toBe(false);
      expect(isValidTraceId('short')).toBe(false);
      expect(isValidTraceId('0123456789ABCDEF0123456789ABCDEF')).toBe(false);
      expect(isValidTraceId('0123456789abcdef0123456789abcdeg')).toBe(false);
    });
  });

  describe('isValidSpanId', () => {
    it('should return true for valid span IDs', () => {
      expect(isValidSpanId('0123456789abcdef')).toBe(true);
      expect(isValidSpanId(generateSpanId())).toBe(true);
    });

    it('should return false for invalid span IDs', () => {
      expect(isValidSpanId('')).toBe(false);
      expect(isValidSpanId('short')).toBe(false);
      expect(isValidSpanId('0123456789ABCDEF')).toBe(false);
      expect(isValidSpanId('0123456789abcdeg')).toBe(false);
    });
  });

  describe('createTraceContext', () => {
    it('should create valid TraceContext', () => {
      const context = createTraceContext(testProducer);

      expect(context.trace_id).toHaveLength(32);
      expect(context.span_id).toHaveLength(16);
      expect(context.parent_span_id).toBeUndefined();
      expect(isIsoDateTime(context.created_at)).toBe(true);
      expect(context.producer).toEqual(testProducer);
    });

    it('should create TraceContext with valid IDs', () => {
      const context = createTraceContext(testProducer);

      expect(isValidTraceId(context.trace_id)).toBe(true);
      expect(isValidSpanId(context.span_id!)).toBe(true);
    });

    it('should preserve producer information', () => {
      const producer: TraceProducer = {
        system: 'popper',
        service_version: '2.0.0',
        ruleset_version: '1.5.0',
        model_version: '3.0.0',
      };
      const context = createTraceContext(producer);

      expect(context.producer.system).toBe('popper');
      expect(context.producer.service_version).toBe('2.0.0');
      expect(context.producer.ruleset_version).toBe('1.5.0');
      expect(context.producer.model_version).toBe('3.0.0');
    });
  });

  describe('createSpan', () => {
    it('should create child span with same trace_id', () => {
      const parent = createTraceContext(testProducer);
      const child = createSpan(parent);

      expect(child.trace_id).toBe(parent.trace_id);
      expect(child.span_id).not.toBe(parent.span_id);
      expect(child.parent_span_id).toBe(parent.span_id);
    });

    it('should use parent producer by default', () => {
      const parent = createTraceContext(testProducer);
      const child = createSpan(parent);

      expect(child.producer).toEqual(testProducer);
    });

    it('should allow overriding producer', () => {
      const parent = createTraceContext(testProducer);
      const newProducer: TraceProducer = {
        system: 'popper',
        service_version: '2.0.0',
      };
      const child = createSpan(parent, newProducer);

      expect(child.producer).toEqual(newProducer);
    });

    it('should create valid timestamps', () => {
      const parent = createTraceContext(testProducer);
      const child = createSpan(parent);

      expect(isIsoDateTime(child.created_at)).toBe(true);

      const parentTime = new Date(parent.created_at).getTime();
      const childTime = new Date(child.created_at).getTime();
      expect(childTime).toBeGreaterThanOrEqual(parentTime);
    });

    it('should support multiple levels of nesting', () => {
      const root = createTraceContext(testProducer);
      const level1 = createSpan(root);
      const level2 = createSpan(level1);
      const level3 = createSpan(level2);

      expect(level1.trace_id).toBe(root.trace_id);
      expect(level2.trace_id).toBe(root.trace_id);
      expect(level3.trace_id).toBe(root.trace_id);

      expect(level1.parent_span_id).toBe(root.span_id);
      expect(level2.parent_span_id).toBe(level1.span_id);
      expect(level3.parent_span_id).toBe(level2.span_id);
    });
  });
});
