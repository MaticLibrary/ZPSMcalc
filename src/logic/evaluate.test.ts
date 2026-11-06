import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluate, ExpressionError } from './evaluate.ts';

test('evaluates simple addition correctly', () => {
  assert.equal(evaluate('2 + 2'), 4);
});

test('respects operator precedence', () => {
  assert.equal(evaluate('2 + 2 * 2'), 6);
  assert.equal(evaluate('(2 + 2) * 2'), 8);
});

test('understands keyboard operators and decimal comma', () => {
  assert.equal(evaluate('2,5 + 3,5'), 6);
  assert.equal(evaluate('8 × 2'), 16);
  assert.equal(evaluate('9 ÷ 3'), 3);
  assert.equal(evaluate('7 − 2'), 5);
});

test('supports percent, powers and root operations', () => {
  assert.equal(evaluate('50%'), 0.5);
  assert.equal(evaluate('2^3'), 8);
  assert.equal(evaluate('√9'), 3);
});

test('throws ExpressionError for division by zero', () => {
  assert.throws(
    () => evaluate('3 ÷ 0'),
    (error: unknown) => error instanceof ExpressionError,
  );
});

test('throws ExpressionError for an unfinished expression', () => {
  assert.throws(
    () => evaluate('2 +'),
    (error: unknown) => error instanceof ExpressionError,
  );
});
