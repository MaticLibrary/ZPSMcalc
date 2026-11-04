export type KeyRole = 'digit' | 'operator' | 'equals' | 'clear';

export type Key = {
  label: string;
  role: KeyRole;
  span?: number;
};

export const BASIC_KEYS: Key[][] = [
  [
    { label: 'AC', role: 'clear' },
    { label: '±', role: 'operator' },
    { label: '%', role: 'operator' },
    { label: '÷', role: 'operator' },
  ],
  [
    { label: '7', role: 'digit' },
    { label: '8', role: 'digit' },
    { label: '9', role: 'digit' },
    { label: '×', role: 'operator' },
  ],
  [
    { label: '4', role: 'digit' },
    { label: '5', role: 'digit' },
    { label: '6', role: 'digit' },
    { label: '−', role: 'operator' },
  ],
  [
    { label: '1', role: 'digit' },
    { label: '2', role: 'digit' },
    { label: '3', role: 'digit' },
    { label: '+', role: 'operator' },
  ],
  [
    { label: '0', role: 'digit', span: 2 },
    { label: ',', role: 'digit' },
    { label: '⌫', role: 'clear' },
    { label: '=', role: 'equals' },
  ],
];

export const EXTENDED_KEYS: Key[][] = [
  [
    { label: '(', role: 'operator' },
    { label: ')', role: 'operator' },
  ],
  [
    { label: 'x²', role: 'operator' },
    { label: '√(', role: 'operator' },
  ],
  [
    { label: '1/x', role: 'operator' },
    { label: '^', role: 'operator' },
  ],
  [
    { label: 'π', role: 'operator' },
    { label: 'e', role: 'operator' },
  ],
  [
    { label: 'AC', role: 'clear' },
    { label: '⌫', role: 'clear' },
  ],
];
