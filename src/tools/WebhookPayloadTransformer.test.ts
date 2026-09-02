import { describe, expect, it } from 'vitest';
import { applyTransform, TransformRule } from './WebhookPayloadTransformer';

describe('applyTransform', () => {
  it('renames a field, moving its value to the new key', () => {
    const out = applyTransform({ event_type: 'order.created' }, [{ id: '1', op: 'rename', key: 'event_type', newKey: 'event' }]);
    expect(out).toEqual({ event: 'order.created' });
  });

  it('removes a field entirely', () => {
    const out = applyTransform({ a: 1, internal_debug_id: 'x' }, [{ id: '1', op: 'remove', key: 'internal_debug_id' }]);
    expect(out).toEqual({ a: 1 });
  });

  it('adds a static field with the given value', () => {
    const out = applyTransform({ a: 1 }, [{ id: '1', op: 'add', key: 'source', value: 'bridge' }]);
    expect(out).toEqual({ a: 1, source: 'bridge' });
  });

  it('applies multiple rules in order', () => {
    const rules: TransformRule[] = [
      { id: '1', op: 'rename', key: 'customer_email', newKey: 'email' },
      { id: '2', op: 'remove', key: 'internal_debug_id' },
      { id: '3', op: 'add', key: 'source', value: 'bridge' },
    ];
    const out = applyTransform({ customer_email: 'a@b.com', internal_debug_id: 'dbg-1', total: 100 }, rules);
    expect(out).toEqual({ email: 'a@b.com', total: 100, source: 'bridge' });
  });

  it('does not mutate the original input object', () => {
    const input = { a: 1 };
    applyTransform(input, [{ id: '1', op: 'add', key: 'b', value: '2' }]);
    expect(input).toEqual({ a: 1 });
  });

  it('ignores a rename rule when the source field does not exist', () => {
    const out = applyTransform({ a: 1 }, [{ id: '1', op: 'rename', key: 'missing', newKey: 'renamed' }]);
    expect(out).toEqual({ a: 1 });
  });
});
