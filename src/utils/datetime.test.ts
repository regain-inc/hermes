import { describe, expect, it } from 'bun:test';
import type { IsoDateTime } from '../types/core';
import {
  ISO_DATETIME_PATTERN,
  createIsoDateTime,
  isIsoDateTime,
  parseIsoDateTime,
  toIsoDateTime,
} from './datetime';

describe('DateTime Utilities', () => {
  describe('ISO_DATETIME_PATTERN', () => {
    it('should be a valid regex', () => {
      expect(ISO_DATETIME_PATTERN).toBeInstanceOf(RegExp);
    });

    it('should match valid ISO datetime strings', () => {
      expect(ISO_DATETIME_PATTERN.test('2024-01-01T00:00:00.000Z')).toBe(true);
      expect(ISO_DATETIME_PATTERN.test('2024-01-01T00:00:00Z')).toBe(true);
      expect(ISO_DATETIME_PATTERN.test('2024-01-01T00:00:00+00:00')).toBe(true);
      expect(ISO_DATETIME_PATTERN.test('2024-01-01T00:00:00-05:00')).toBe(true);
    });

    it('should not match invalid datetime strings', () => {
      expect(ISO_DATETIME_PATTERN.test('2024-01-01')).toBe(false);
      expect(ISO_DATETIME_PATTERN.test('2024-01-01T00:00:00')).toBe(false);
      expect(ISO_DATETIME_PATTERN.test('invalid')).toBe(false);
    });
  });

  describe('isIsoDateTime', () => {
    it('should return true for valid ISO datetime strings', () => {
      expect(isIsoDateTime('2024-01-01T00:00:00.000Z')).toBe(true);
      expect(isIsoDateTime('2024-12-31T23:59:59.999Z')).toBe(true);
      expect(isIsoDateTime('2024-01-01T12:30:45+05:30')).toBe(true);
    });

    it('should return false for invalid strings', () => {
      expect(isIsoDateTime('2024-01-01')).toBe(false);
      expect(isIsoDateTime('not-a-date')).toBe(false);
      expect(isIsoDateTime('')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isIsoDateTime(null)).toBe(false);
      expect(isIsoDateTime(undefined)).toBe(false);
      expect(isIsoDateTime(123)).toBe(false);
      expect(isIsoDateTime({})).toBe(false);
      expect(isIsoDateTime(new Date())).toBe(false);
    });
  });

  describe('createIsoDateTime', () => {
    it('should create ISO datetime from Date object', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const result = createIsoDateTime(date);
      expect(result).toBe('2024-01-15T10:30:00.000Z');
      expect(isIsoDateTime(result)).toBe(true);
    });

    it('should create ISO datetime for current time when no date provided', () => {
      const before = new Date();
      const result = createIsoDateTime();
      const after = new Date();

      expect(isIsoDateTime(result)).toBe(true);

      const resultDate = new Date(result);
      expect(resultDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(resultDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should always return Z timezone format', () => {
      const result = createIsoDateTime();
      expect(result).toEndWith('Z');
    });
  });

  describe('parseIsoDateTime', () => {
    it('should parse valid ISO datetime to Date', () => {
      const isoString = '2024-01-15T10:30:00.000Z' as IsoDateTime;
      const result = parseIsoDateTime(isoString);

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should parse ISO datetime with timezone offset', () => {
      const isoString = '2024-01-15T10:30:00+05:00' as IsoDateTime;
      const result = parseIsoDateTime(isoString);

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe('2024-01-15T05:30:00.000Z');
    });

    it('should throw error for invalid date value', () => {
      const invalidDate = 'invalid-date' as IsoDateTime;
      expect(() => parseIsoDateTime(invalidDate)).toThrow('Invalid IsoDateTime value');
    });
  });

  describe('toIsoDateTime', () => {
    it('should return IsoDateTime for valid strings', () => {
      const result = toIsoDateTime('2024-01-15T10:30:00.000Z');
      expect(result).toBe('2024-01-15T10:30:00.000Z');
      expect(isIsoDateTime(result)).toBe(true);
    });

    it('should throw error for invalid strings', () => {
      expect(() => toIsoDateTime('2024-01-15')).toThrow('Invalid IsoDateTime format');
      expect(() => toIsoDateTime('not-a-date')).toThrow('Invalid IsoDateTime format');
    });
  });
});
