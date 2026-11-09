/**
 * Authentic PasswordCard.org Deterministic Algorithm
 * Uses 64-bit Linear Congruential Generator (java.util.Random specification)
 * to generate a 29-column × 9-row grid (1 symbol header row + 8 color-coded character rows).
 */

export const GRID_WIDTH = 29;
export const GRID_HEIGHT = 9; // 1 header row + 8 data rows
export const DATA_ROWS = 8;

export const HEADER_SYMBOLS: string[] = [
  '■', '□', '▲', '△', '○', '●', '★', '☂', '☀', '☁',
  '☹', '☺', '♠', '♣', '♥', '♦', '♫', '€', '¥', '£',
  '$', '!', '?', '¡', '¿', '⊙', '◐', '◩', '❖'
];

export const DIGITS = '0123456789';
export const DIGITS_AND_LETTERS =
  '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
export const DIGITS_LETTERS_AND_SYMBOLS =
  '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ@#$%&*<>?€+{}[]()/\\';

export interface RowColorSpec {
  index: number; // 1..8
  id: string;
  name: string;
  dotColor: string;
  rowBgTint: string;
  borderAccent: string;
  textAccent: string;
}

/**
 * The 8 canonical PasswordCard.org row colors adapted for high-contrast
 * OLED Black background and Teal lettering.
 */
export const ROW_COLORS: RowColorSpec[] = [
  {
    index: 1,
    id: 'white',
    name: 'White',
    dotColor: '#F8FAFC',
    rowBgTint: 'rgba(248, 250, 252, 0.05)',
    borderAccent: 'rgba(248, 250, 252, 0.35)',
    textAccent: '#5EEAD4',
  },
  {
    index: 2,
    id: 'gray',
    name: 'Gray',
    dotColor: '#94A3B8',
    rowBgTint: 'rgba(148, 163, 184, 0.07)',
    borderAccent: 'rgba(148, 163, 184, 0.35)',
    textAccent: '#2DD4BF',
  },
  {
    index: 3,
    id: 'red',
    name: 'Red',
    dotColor: '#F43F5E',
    rowBgTint: 'rgba(244, 63, 94, 0.08)',
    borderAccent: 'rgba(244, 63, 94, 0.45)',
    textAccent: '#5EEAD4',
  },
  {
    index: 4,
    id: 'green',
    name: 'Green',
    dotColor: '#10B981',
    rowBgTint: 'rgba(16, 185, 129, 0.08)',
    borderAccent: 'rgba(16, 185, 129, 0.45)',
    textAccent: '#2DD4BF',
  },
  {
    index: 5,
    id: 'yellow',
    name: 'Yellow',
    dotColor: '#F59E0B',
    rowBgTint: 'rgba(245, 158, 11, 0.08)',
    borderAccent: 'rgba(245, 158, 11, 0.45)',
    textAccent: '#5EEAD4',
  },
  {
    index: 6,
    id: 'blue',
    name: 'Blue',
    dotColor: '#3B82F6',
    rowBgTint: 'rgba(59, 130, 246, 0.09)',
    borderAccent: 'rgba(59, 130, 246, 0.45)',
    textAccent: '#2DD4BF',
  },
  {
    index: 7,
    id: 'purple',
    name: 'Purple',
    dotColor: '#A855F7',
    rowBgTint: 'rgba(168, 85, 247, 0.09)',
    borderAccent: 'rgba(168, 85, 247, 0.45)',
    textAccent: '#5EEAD4',
  },
  {
    index: 8,
    id: 'cyan',
    name: 'Teal',
    dotColor: '#14B8A6',
    rowBgTint: 'rgba(20, 184, 166, 0.12)',
    borderAccent: 'rgba(20, 184, 166, 0.6)',
    textAccent: '#99F6E4',
  },
];

/**
 * Faithful port of java.util.Random using 64-bit BigInt arithmetic.
 */
export class JavaRandom {
  private seed: bigint;
  private static readonly MULTIPLIER = 0x5deece66dn;
  private static readonly ADDEND = 0xbn;
  private static readonly MASK = (1n << 48n) - 1n;

  constructor(seedHexOrBigInt: string | bigint) {
    let rawSeed: bigint;
    if (typeof seedHexOrBigInt === 'string') {
      const cleaned = seedHexOrBigInt.replace(/[^0-9a-fA-F]/g, '') || '1';
      rawSeed = BigInt('0x' + cleaned.slice(0, 16));
    } else {
      rawSeed = seedHexOrBigInt;
    }
    // Convert unsigned 64-bit to signed 64-bit and apply java.util.Random initial scramble
    const signed64 = BigInt.asIntN(64, rawSeed);
    this.seed = (signed64 ^ JavaRandom.MULTIPLIER) & JavaRandom.MASK;
  }

  private next(bits: number): number {
    this.seed =
      (this.seed * JavaRandom.MULTIPLIER + JavaRandom.ADDEND) & JavaRandom.MASK;
    return Number(this.seed >> BigInt(48 - bits));
  }

  public nextInt(bound: number): number {
    if (bound <= 0) {
      throw new Error('Bound must be positive');
    }
    // Power of 2 check
    if ((bound & -bound) === bound) {
      return Number((BigInt(bound) * BigInt(this.next(31))) >> 31n);
    }
    let bits: number;
    let val: number;
    do {
      bits = this.next(31);
      val = bits % bound;
    } while (bits - val + (bound - 1) < 0);
    return val;
  }
}

export interface PasswordCardOptions {
  cardNumber: string; // 1 to 16 hex digits
  includeSymbols: boolean;
  digitArea: boolean;
}

export interface GeneratedPasswordCard {
  cardNumber: string;
  formattedSerial: string;
  headerSymbols: string[];
  rows: string[][]; // 8 rows of 29 characters each
  options: PasswordCardOptions;
  generatedAt: number;
}

/**
 * Generates a random 16-digit hexadecimal card number (64-bit unsigned seed)
 */
export function generateRandomCardHex(): string {
  const bytes = new Uint8Array(8);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 8; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  // Ensure first nibble isn't '0' so it's always a full 16-char hex string
  if ((bytes[0] & 0xf0) === 0) {
    bytes[0] |= 0x10;
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Formats a 16-character hex string into readable 4-character blocks
 */
export function formatCardSerial(hex: string): string {
  const clean = hex.toLowerCase().replace(/[^0-9a-f]/g, '').padStart(16, '0').slice(0, 16);
  return `${clean.slice(0, 4)} • ${clean.slice(4, 8)} • ${clean.slice(8, 12)} • ${clean.slice(12, 16)}`;
}

/**
 * Generates the complete 29x9 PasswordCard grid according to the official PasswordCard.org spec
 */
export function generatePasswordCard(options: PasswordCardOptions): GeneratedPasswordCard {
  const cleanHex =
    options.cardNumber.toLowerCase().replace(/[^0-9a-f]/g, '').slice(0, 16) ||
    '0000000000000001';
  const rng = new JavaRandom(cleanHex);

  // 1. Copy and shuffle header symbols (Fisher-Yates downwards like java.util.Collections.shuffle)
  const header = [...HEADER_SYMBOLS];
  for (let i = header.length; i > 1; i--) {
    const swapIdx = rng.nextInt(i);
    const tmp = header[i - 1];
    header[i - 1] = header[swapIdx];
    header[swapIdx] = tmp;
  }

  // 2. Populate the 8 data rows
  const rows: string[][] = [];
  const halfHeight = 4; // First 4 data rows (rows 1..4), last 4 data rows (rows 5..8)

  for (let r = 0; r < DATA_ROWS; r++) {
    const rowChars: string[] = [];
    for (let c = 0; c < GRID_WIDTH; c++) {
      if (options.digitArea && r >= halfHeight) {
        rowChars.push(DIGITS[rng.nextInt(DIGITS.length)]);
      } else if (options.includeSymbols && c % 2 === 0) {
        rowChars.push(
          DIGITS_LETTERS_AND_SYMBOLS[rng.nextInt(DIGITS_LETTERS_AND_SYMBOLS.length)]
        );
      } else {
        rowChars.push(DIGITS_AND_LETTERS[rng.nextInt(DIGITS_AND_LETTERS.length)]);
      }
    }
    rows.push(rowChars);
  }

  return {
    cardNumber: cleanHex,
    formattedSerial: formatCardSerial(cleanHex),
    headerSymbols: header,
    rows,
    options: {
      ...options,
      cardNumber: cleanHex,
    },
    generatedAt: Date.now(),
  };
}

export type ReadDirection =
  | 'right'
  | 'left'
  | 'down'
  | 'up'
  | 'diag-dr'
  | 'diag-ur';

export interface CoordinateCell {
  row: number; // 0..7 (0-indexed data row)
  col: number; // 0..28 (0-indexed column)
  char: string;
}

export interface SavedBookmark {
  id: string;
  label: string;
  rowIdx: number; // 0..7
  symbol: string; // e.g. '★' — tracks the symbol column across card rotations!
  direction: ReadDirection;
  length: number;
}

/**
 * Extracts a password sequence starting at (startRow, startCol) in the chosen direction
 * with automatic wrap-around across the 29x8 character matrix.
 */
export function extractPasswordFromGrid(
  card: GeneratedPasswordCard,
  startRow: number,
  startCol: number,
  direction: ReadDirection,
  length: number
): { password: string; path: CoordinateCell[] } {
  const safeRow = Math.max(0, Math.min(DATA_ROWS - 1, startRow));
  const safeCol = Math.max(0, Math.min(GRID_WIDTH - 1, startCol));
  const safeLen = Math.max(1, Math.min(64, length));

  const deltas: Record<ReadDirection, [number, number]> = {
    right: [0, 1],
    left: [0, -1],
    down: [1, 0],
    up: [-1, 0],
    'diag-dr': [1, 1],
    'diag-ur': [-1, 1],
  };

  const [dRow, dCol] = deltas[direction];
  const path: CoordinateCell[] = [];
  let r = safeRow;
  let c = safeCol;

  for (let step = 0; step < safeLen; step++) {
    const char = card.rows[r]?.[c] ?? '';
    path.push({ row: r, col: c, char });
    r = (r + dRow + DATA_ROWS) % DATA_ROWS;
    c = (c + dCol + GRID_WIDTH) % GRID_WIDTH;
  }

  return {
    password: path.map((p) => p.char).join(''),
    path,
  };
}

/**
 * Estimates password entropy in bits based on length and active character pool
 */
export function calculateEntropyBits(
  length: number,
  includeSymbols: boolean,
  isDigitOnlyRow: boolean
): number {
  const poolSize = isDigitOnlyRow
    ? 10
    : includeSymbols
    ? DIGITS_LETTERS_AND_SYMBOLS.length
    : DIGITS_AND_LETTERS.length;
  return Math.round(length * Math.log2(poolSize));
}
