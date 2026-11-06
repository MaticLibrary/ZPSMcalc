import { evaluateExpression } from '../../calculator.ts';

export class ExpressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpressionError';
  }
}

export function evaluate(input: string): number {
  try {
    return evaluateExpression(input.trim());
  } catch (error) {
    if (error instanceof Error) {
      throw new ExpressionError(error.message);
    }
    throw error;
  }
}
