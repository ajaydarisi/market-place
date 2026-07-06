import { describe, it, expect } from 'vitest';
import { parsePositiveInt, sanitizeForPrompt } from '@/lib/utils';

describe('parsePositiveInt', () => {
  it('parses valid positive ids', () => {
    expect(parsePositiveInt('42')).toBe(42);
    expect(parsePositiveInt(123)).toBe(123);
    expect(parsePositiveInt('001')).toBe(1);
  });
  it('rejects invalid/negative/zero/NaN', () => {
    expect(parsePositiveInt('0')).toBe(null);
    expect(parsePositiveInt('-5')).toBe(null);
    expect(parsePositiveInt('abc')).toBe(null);
    expect(parsePositiveInt(NaN)).toBe(null);
    expect(parsePositiveInt(undefined)).toBe(null);
  });
});

describe('sanitizeForPrompt', () => {
  it('removes control characters and truncates', () => {
    const dirty = 'hello\x00world\x1F' + 'x'.repeat(5000);
    const out = sanitizeForPrompt(dirty, 100);
    expect(out).not.toMatch(/[\x00-\x1F]/);
    expect(out.length).toBeLessThanOrEqual(100);
    expect(out).toContain('hello');
  });
  it('handles empty and normal strings', () => {
    expect(sanitizeForPrompt('')).toBe('');
    expect(sanitizeForPrompt(' normal text ')).toBe('normal text');
  });
});
