import CryptoJS from "crypto-js";
import { SecurityMode } from "./types";

export class AESCipher {
  private getKeySize(mode: SecurityMode): number {
    switch (mode) {
      case "high":
        return 256;
      case "balanced":
        return 192;
      case "lightweight":
        return 128;
    }
  }

  private getIterations(mode: SecurityMode): number {
    switch (mode) {
      case "high":
        return 10000;
      case "balanced":
        return 5000;
      case "lightweight":
        return 1000;
    }
  }

  generateKey(mode: SecurityMode = "balanced"): string {
    const keySize = this.getKeySize(mode) / 8;
    return CryptoJS.lib.WordArray.random(keySize).toString();
  }

  encrypt(plaintext: string, key: string, mode: SecurityMode = "balanced"): string {
    try {
      const iterations = this.getIterations(mode);
      const salt = CryptoJS.lib.WordArray.random(128 / 8);

      const derivedKey = CryptoJS.PBKDF2(key, salt, {
        keySize: this.getKeySize(mode) / 32,
        iterations: iterations,
      });

      const iv = CryptoJS.lib.WordArray.random(128 / 8);

      const encrypted = CryptoJS.AES.encrypt(plaintext, derivedKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const result = salt.toString() + iv.toString() + encrypted.toString();
      return result;
    } catch (error) {
      throw new Error(`AES encryption failed: ${error}`);
    }
  }

  decrypt(ciphertext: string, key: string, mode: SecurityMode = "balanced"): string {
    try {
      const salt = CryptoJS.enc.Hex.parse(ciphertext.substr(0, 32));
      const iv = CryptoJS.enc.Hex.parse(ciphertext.substr(32, 32));
      const encrypted = ciphertext.substring(64);

      const iterations = this.getIterations(mode);

      const derivedKey = CryptoJS.PBKDF2(key, salt, {
        keySize: this.getKeySize(mode) / 32,
        iterations: iterations,
      });

      const decrypted = CryptoJS.AES.decrypt(encrypted, derivedKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error(`AES decryption failed: ${error}`);
    }
  }
}
