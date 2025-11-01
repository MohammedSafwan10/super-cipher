import { SecurityMode } from "./types";

export class CaesarCipher {
  private readonly ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  encrypt(plaintext: string, shift: number): string {
    return this.processText(plaintext, shift, true);
  }

  decrypt(ciphertext: string, shift: number): string {
    return this.processText(ciphertext, shift, false);
  }

  private processText(text: string, shift: number, isEncrypt: boolean): string {
    // Normalize shift to 0-25 range
    shift = ((shift % 26) + 26) % 26;
    if (!isEncrypt) {
      shift = 26 - shift;
    }

    let result = "";
    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char.match(/[a-z]/i)) {
        const isUpperCase = char === char.toUpperCase();
        const charCode = char.toUpperCase().charCodeAt(0);
        const alphabetIndex = charCode - 65; // A=0, B=1, etc.
        const newIndex = (alphabetIndex + shift) % 26;
        const newChar = this.ALPHABET[newIndex];

        result += isUpperCase ? newChar : newChar.toLowerCase();
      } else {
        result += char;
      }
    }

    return result;
  }

  generateKey(mode: SecurityMode): number {
    // Generate random shift based on security mode
    let maxShift: number;
    switch (mode) {
      case "high":
        maxShift = 25; // Full range
        break;
      case "balanced":
        maxShift = 20;
        break;
      case "lightweight":
        maxShift = 13; // ROT13
        break;
    }

    // Generate random shift (1 to maxShift, avoid 0 as it's no encryption)
    return Math.floor(Math.random() * maxShift) + 1;
  }

  formatKey(shift: number): string {
    return `SHIFT-${shift}`;
  }
}
