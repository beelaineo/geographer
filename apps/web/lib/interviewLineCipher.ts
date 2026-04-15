const PRINTABLE_ASCII_START = 32;
const PRINTABLE_ASCII_END = 126;
const PRINTABLE_ASCII_RANGE = PRINTABLE_ASCII_END - PRINTABLE_ASCII_START + 1;
const UPPERCASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_LETTERS = "abcdefghijklmnopqrstuvwxyz";

function hashSeed(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

/**
 * Obfuscates visible row values for unreleased interviews.
 * This is intentionally reversible only in code, not by readers.
 */
export function cipherInterviewLineValue(value: string, seed: string): string {
  const shift = (hashSeed(seed) % (PRINTABLE_ASCII_RANGE - 1)) + 1;
  let ciphered = "";
  let position = 0;

  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined) {
      continue;
    }

    if (/\s/u.test(character)) {
      ciphered += character;
      position += 1;
      continue;
    }

    const shiftedCode =
      codePoint >= PRINTABLE_ASCII_START && codePoint <= PRINTABLE_ASCII_END
        ? ((codePoint - PRINTABLE_ASCII_START + shift) % PRINTABLE_ASCII_RANGE) +
          PRINTABLE_ASCII_START
        : codePoint + shift;

    const isLowercase = character >= "a" && character <= "z";
    const alphabet = isLowercase ? LOWERCASE_LETTERS : UPPERCASE_LETTERS;
    const letterIndex = hashSeed(`${seed}:${position}:${shiftedCode}`) % alphabet.length;
    ciphered += alphabet[letterIndex];
    position += 1;
  }

  return ciphered;
}
