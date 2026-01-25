/**
 * Trace utilities for distributed tracing
 * @module utils/trace
 */

import type { TraceContext, TraceProducer } from '../types/core';
import { createIsoDateTime } from './datetime';

/**
 * Generates a random trace ID (32 hex characters).
 * Compatible with W3C Trace Context specification.
 * @returns 32-character hexadecimal trace ID
 */
export function generateTraceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generates a random span ID (16 hex characters).
 * Compatible with W3C Trace Context specification.
 * @returns 16-character hexadecimal span ID
 */
export function generateSpanId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Options for creating a TraceContext.
 */
export interface CreateTraceContextOptions extends TraceProducer {
  /** Use an existing trace ID instead of generating a new one */
  existingTraceId?: string;
}

/**
 * Creates a new TraceContext with a fresh or existing trace ID.
 * @param options - The producer system information and optional existing trace ID
 * @returns New TraceContext
 */
export function createTraceContext(options: CreateTraceContextOptions): TraceContext {
  const { existingTraceId, ...producerFields } = options;
  const producer: TraceProducer = producerFields;

  return {
    trace_id: existingTraceId ?? generateTraceId(),
    span_id: generateSpanId(),
    created_at: createIsoDateTime(),
    producer,
  };
}

/**
 * Creates a child span from a parent TraceContext.
 * Preserves the trace_id and sets parent_span_id.
 * @param parent - The parent TraceContext
 * @param producer - Optional new producer, defaults to parent's producer
 * @returns New TraceContext as a child span
 */
export function createSpan(parent: TraceContext, producer?: TraceProducer): TraceContext {
  const context: TraceContext = {
    trace_id: parent.trace_id,
    span_id: generateSpanId(),
    created_at: createIsoDateTime(),
    producer: producer ?? parent.producer,
  };

  if (parent.span_id !== undefined) {
    return { ...context, parent_span_id: parent.span_id };
  }

  return context;
}

/**
 * Validates a trace ID format (32 hex characters).
 * @param traceId - The trace ID to validate
 * @returns True if valid
 */
export function isValidTraceId(traceId: string): boolean {
  return /^[0-9a-f]{32}$/.test(traceId);
}

/**
 * Validates a span ID format (16 hex characters).
 * @param spanId - The span ID to validate
 * @returns True if valid
 */
export function isValidSpanId(spanId: string): boolean {
  return /^[0-9a-f]{16}$/.test(spanId);
}
