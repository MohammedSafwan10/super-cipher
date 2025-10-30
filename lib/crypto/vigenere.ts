export class VigenereCipher {
  generateKey(length: number = 16): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let key = "";
    for (let i = 0; i < length; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  private processText(text: string, key: string, encrypt: boolean): string {
    let result = "";
    let keyIndex = 0;
    const normalizedKey = key.toUpperCase();

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (/[a-zA-Z]/.test(char)) {
        const isUpperCase = char === char.toUpperCase();
        const charCode = char.toUpperCase().charCodeAt(0) - 65;
        const keyChar = normalizedKey.charCodeAt(keyIndex % normalizedKey.length) - 65;

        let newCharCode;
        if (encrypt) {
          newCharCode = (charCode + keyChar) % 26;
        } else {
          newCharCode = (charCode - keyChar + 26) % 26;
        }

        const newChar = String.fromCharCode(newCharCode + 65);
        result += isUpperCase ? newChar : newChar.toLowerCase();
        keyIndex++;
      } else {
        result += char;
      }
    }

    return result;
  }

  encrypt(plaintext: string, key: string): string {
    if (!key || key.length === 0) {
      throw new Error("Vigenère cipher requires a non-empty key");
    }
    return this.processText(plaintext, key, true);
  }

  decrypt(ciphertext: string, key: string): string {
    if (!key || key.length === 0) {
      throw new Error("Vigenère cipher requires a non-empty key");
    }
    return this.processText(ciphertext, key, false);
  }
}
