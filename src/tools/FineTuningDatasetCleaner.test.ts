import { describe, expect, it } from 'vitest';
import { analyzeJsonl, estimateTokens } from './FineTuningDatasetCleaner';

const validLine = JSON.stringify({ messages: [{ role: 'user', content: 'Hi' }, { role: 'assistant', content: 'Hello!' }] });

describe('estimateTokens', () => {
  it('estimates roughly 1 token per 4 characters', () => {
    expect(estimateTokens('12345678')).toBe(2);
  });

  it('rounds up for partial tokens', () => {
    expect(estimateTokens('123')).toBe(1);
  });
});

describe('analyzeJsonl', () => {
  it('marks a well-formed chat line as valid', () => {
    const [r] = analyzeJsonl(validLine);
    expect(r.valid).toBe(true);
    expect(r.error).toBeNull();
  });

  it('rejects a line with invalid JSON', () => {
    const [r] = analyzeJsonl('{not valid json}');
    expect(r.valid).toBe(false);
    expect(r.error).not.toBeNull();
  });

  it('rejects a line missing the messages array', () => {
    const [r] = analyzeJsonl(JSON.stringify({ foo: 'bar' }));
    expect(r.valid).toBe(false);
  });

  it('rejects a conversation with no assistant message', () => {
    const [r] = analyzeJsonl(JSON.stringify({ messages: [{ role: 'user', content: 'Hi' }] }));
    expect(r.valid).toBe(false);
    expect(r.error).toContain('assistant');
  });

  it('rejects a message with an empty content string', () => {
    const [r] = analyzeJsonl(JSON.stringify({ messages: [{ role: 'user', content: '' }, { role: 'assistant', content: 'Hi' }] }));
    expect(r.valid).toBe(false);
  });

  it('rejects a message with an invalid role', () => {
    const [r] = analyzeJsonl(JSON.stringify({ messages: [{ role: 'admin', content: 'Hi' }, { role: 'assistant', content: 'Hi' }] }));
    expect(r.valid).toBe(false);
    expect(r.error).toContain('role');
  });

  it('flags the second occurrence of an identical conversation as a duplicate', () => {
    const results = analyzeJsonl([validLine, validLine].join('\n'));
    expect(results[0].isDuplicate).toBe(false);
    expect(results[1].isDuplicate).toBe(true);
  });

  it('computes estimated tokens as the sum across all messages in a valid line', () => {
    const [r] = analyzeJsonl(validLine);
    const expected = estimateTokens('Hi') + estimateTokens('Hello!');
    expect(r.estimatedTokens).toBe(expected);
  });

  it('skips blank lines', () => {
    const results = analyzeJsonl(`${validLine}\n\n\n${validLine.replace('Hello!', 'Bye!')}`);
    expect(results).toHaveLength(2);
  });

  it('assigns 1-indexed line numbers matching non-blank line order', () => {
    const results = analyzeJsonl(`${validLine}\n${validLine.replace('Hello!', 'Bye!')}`);
    expect(results[0].lineNumber).toBe(1);
    expect(results[1].lineNumber).toBe(2);
  });
});
