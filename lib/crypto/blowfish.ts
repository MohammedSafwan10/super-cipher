import CryptoJS from "crypto-js";
import { SecurityMode } from "./types";

export class BlowfishCipher {
  private getKeySize(mode: SecurityMode): number {
    switch (mode) {
      case "high":
        return 448;
      case "balanced":
        return 256;
      case "lightweight":
        return 128;
    }
  }

  generateKey(mode: SecurityMode = "balanced"): string {
    const keySize = this.getKeySize(mode) / 8;
    return CryptoJS.lib.WordArray.random(keySize).toString();
  }

  encrypt(plaintext: string, key: string): string {
    try {
      const encrypted = CryptoJS.Blowfish.encrypt(plaintext, key);
      return encrypted.toString();
    } catch (error) {
      throw new Error(`Blowfish encryption failed: ${error}`);
    }
  }

  decrypt(ciphertext: string, key: string): string {
    try {
      const decrypted = CryptoJS.Blowfish.decrypt(ciphertext, key);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error(`Blowfish decryption failed: ${error}`);
    }
  }
}
