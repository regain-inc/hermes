/**
 * DateTime utilities for IsoDateTime type
 * @see 03-hermes-specs/02-hermes-contracts.md — Section 1.2
 * @module utils/datetime
 */

import type { IsoDateTime } from '../types/core';

/**
 * ISO 8601 datetime pattern with timezone.
 * Matches: YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DDTHH:mm:ss±HH:MM
 */
export const ISO_DATETIME_PATTERN: RegExp =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;

/**
 * Type guard to check if a value is a valid IsoDateTime string.
 * @param value - The value to check
 * @returns True if the value matches IsoDateTime format
 */
export function isIsoDateTime(value: unknown): value is IsoDateTime {
  if (typeof value !== 'string') {
    return false;
  }
  return ISO_DATETIME_PATTERN.test(value);
}

/**
 * Creates an IsoDateTime from a Date object.
 * @param date - Optional Date object, defaults to current time
 * @returns IsoDateTime string
 */
export function createIsoDateTime(date: Date = new Date()): IsoDateTime {
  return date.toISOString() as IsoDateTime;
}

/**
 * Parses an IsoDateTime string into a Date object.
 * @param value - IsoDateTime string to parse
 * @returns Parsed Date object
 * @throws Error if the value is not a valid date
 */
export function parseIsoDateTime(value: IsoDateTime): Date {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid IsoDateTime value: ${value}`);
  }
  return date;
}

/**
 * Validates and converts a string to IsoDateTime.
 * @param value - String to validate and convert
 * @returns IsoDateTime if valid
 * @throws Error if the value is not a valid IsoDateTime format
 */
export function toIsoDateTime(value: string): IsoDateTime {
  if (!isIsoDateTime(value)) {
    throw new Error(
      `Invalid IsoDateTime format: ${value}. Expected format: YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DDTHH:mm:ss±HH:MM`
    );
  }
  return value;
}
