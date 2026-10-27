type Token =
  | { type: 'number' | 'constant'; value: number }
  | {
      type: 'operator' | 'leftParen' | 'rightParen' | 'sqrt' | 'percent';
      value: string;
    };

type TokenType = Token['type'];

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;

  while (position < expression.length) {
    const remaining = expression.slice(position);
    const numberMatch = remaining.match(
      /^(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?/,
    );

    if (numberMatch) {
      const value = Number(numberMatch[0].replace(',', '.'));
      if (!Number.isFinite(value)) {
        throw new Error('Liczba jest poza zakresem.');
      }
      tokens.push({ type: 'number', value });
      position += numberMatch[0].length;
      continue;
    }

    const character = expression[position];
    if (/\s/.test(character)) {
      position += 1;
      continue;
    }

    if (character === 'π' || character === 'e') {
      tokens.push({
        type: 'constant',
        value: character === 'π' ? Math.PI : Math.E,
      });
    } else if (character === '√') {
      tokens.push({ type: 'sqrt', value: character });
    } else if (character === '(') {
      tokens.push({ type: 'leftParen', value: character });
    } else if (character === ')') {
      tokens.push({ type: 'rightParen', value: character });
    } else if (character === '%') {
      tokens.push({ type: 'percent', value: character });
    } else if ('+-−×÷*/^'.includes(character)) {
      const normalizedOperator =
        character === '−'
          ? '-'
          : character === '×'
            ? '*'
            : character === '÷'
              ? '/'
              : character;
      tokens.push({ type: 'operator', value: normalizedOperator });
    } else {
      throw new Error('Nieprawidłowy znak w wyrażeniu.');
    }

    position += 1;
  }

  const expandedTokens: Token[] = [];
  for (const token of tokens) {
    const previous = expandedTokens[expandedTokens.length - 1];
    const previousCanEndValue =
      previous?.type === 'number' ||
      previous?.type === 'constant' ||
      previous?.type === 'rightParen' ||
      previous?.type === 'percent';
    const currentCanStartValue =
      token.type === 'number' ||
      token.type === 'constant' ||
      token.type === 'leftParen' ||
      token.type === 'sqrt';

    if (previousCanEndValue && currentCanStartValue) {
      expandedTokens.push({ type: 'operator', value: '*' });
    }
    expandedTokens.push(token);
  }

  return expandedTokens;
}

class ExpressionParser {
  private position = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): number {
    if (this.tokens.length === 0) {
      throw new Error('Wpisz wyrażenie.');
    }

    const result = this.parseAddition();
    if (this.position !== this.tokens.length) {
      throw new Error('Nieprawidłowe wyrażenie.');
    }
    if (!Number.isFinite(result)) {
      throw new Error('Wynik jest poza zakresem.');
    }
    return result;
  }

  private parseAddition(): number {
    let value = this.parseMultiplication();

    while (this.matchOperator('+') || this.matchOperator('-')) {
      const operator = this.previous().value;
      const right = this.parseMultiplication();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  }

  private parseMultiplication(): number {
    let value = this.parseUnary();

    while (this.matchOperator('*') || this.matchOperator('/')) {
      const operator = this.previous().value;
      const right = this.parseUnary();
      if (operator === '/' && right === 0) {
        throw new Error('Nie można dzielić przez zero.');
      }
      value = operator === '*' ? value * right : value / right;
    }
    return value;
  }

  private parseUnary(): number {
    if (this.matchOperator('+')) {
      return this.parseUnary();
    }
    if (this.matchOperator('-')) {
      return -this.parseUnary();
    }
    return this.parsePower();
  }

  private parsePower(): number {
    const base = this.parsePostfix();
    if (this.matchOperator('^')) {
      return base ** this.parseUnary();
    }
    return base;
  }

  private parsePostfix(): number {
    let value = this.parsePrimary();
    while (this.matchType('percent')) {
      value /= 100;
    }
    return value;
  }

  private parsePrimary(): number {
    if (this.matchType('number') || this.matchType('constant')) {
      const token = this.previous();
      if (token.type === 'number' || token.type === 'constant') {
        return token.value;
      }
    }

    if (this.matchType('sqrt')) {
      const value = this.parseUnary();
      if (value < 0) {
        throw new Error('Nie można obliczyć pierwiastka z liczby ujemnej.');
      }
      return Math.sqrt(value);
    }

    if (this.matchType('leftParen')) {
      const value = this.parseAddition();
      if (!this.matchType('rightParen')) {
        throw new Error('Brakuje zamykającego nawiasu.');
      }
      return value;
    }

    throw new Error('Nieprawidłowe wyrażenie.');
  }

  private matchOperator(operator: string): boolean {
    const token = this.peek();
    if (token?.type === 'operator' && token.value === operator) {
      this.position += 1;
      return true;
    }
    return false;
  }

  private matchType(type: TokenType): boolean {
    if (this.peek()?.type === type) {
      this.position += 1;
      return true;
    }
    return false;
  }

  private peek(): Token | undefined {
    return this.tokens[this.position];
  }

  private previous(): Token {
    return this.tokens[this.position - 1];
  }
}

export function evaluateExpression(expression: string): number {
  return new ExpressionParser(tokenize(expression)).parse();
}

export function formatResult(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error('Wynik jest poza zakresem.');
  }
  const rounded = Number(value.toPrecision(12));
  return String(rounded).replace('.', ',');
}
