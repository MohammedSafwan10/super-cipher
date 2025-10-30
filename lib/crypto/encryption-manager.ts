import { AESCipher } from "./aes";
import { RSACipher } from "./rsa";
import { HillCipher } from "./hill";
import { VigenereCipher } from "./vigenere";
import { BlowfishCipher } from "./blowfish";
import {
  CipherAlgorithm,
  SecurityMode,
  EncryptionResult,
  DecryptionResult,
  PerformanceMetrics,
} from "./types";

export class EncryptionManager {
  private aes = new AESCipher();
  private rsa = new RSACipher();
  private hill = new HillCipher();
  private vigenere = new VigenereCipher();
  private blowfish = new BlowfishCipher();

  private measurePerformance<T>(fn: () => T, dataSize: number): { result: T; metrics: PerformanceMetrics } {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    const result = fn();

    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

    const encryptionTime = endTime - startTime;
    const memoryUsed = Math.max(0, endMemory - startMemory);
    const throughput = dataSize / (encryptionTime / 1000); // bytes per second

    return {
      result,
      metrics: {
        encryptionTime,
        memoryUsed,
        dataSize,
        throughput,
      },
    };
  }

  generateKey(algorithm: CipherAlgorithm, mode: SecurityMode = "balanced"): string {
    switch (algorithm) {
      case "aes":
        return this.aes.generateKey(mode);
      case "rsa":
        const keypair = this.rsa.generateKeyPair(mode);
        return JSON.stringify(keypair);
      case "hill":
        const matrix = this.hill.generateKey(2);
        return this.hill.keyToString(matrix);
      case "vigenere":
        return this.vigenere.generateKey(mode === "high" ? 32 : mode === "balanced" ? 16 : 8);
      case "blowfish":
        return this.blowfish.generateKey(mode);
      default:
        throw new Error(`Unknown algorithm: ${algorithm}`);
    }
  }

  async encrypt(
    plaintext: string,
    algorithm: CipherAlgorithm,
    key: string,
    mode: SecurityMode = "balanced"
  ): Promise<EncryptionResult> {
    const dataSize = new Blob([plaintext]).size;

    const { result: encrypted, metrics } = this.measurePerformance(() => {
      switch (algorithm) {
        case "aes":
          return this.aes.encrypt(plaintext, key, mode);
        case "rsa":
          const keypair = JSON.parse(key);
          return this.rsa.encrypt(plaintext, keypair.publicKey);
        case "hill":
          const matrix = this.hill.stringToKey(key);
          return this.hill.encrypt(plaintext, matrix);
        case "vigenere":
          return this.vigenere.encrypt(plaintext, key);
        case "blowfish":
          return this.blowfish.encrypt(plaintext, key);
        default:
          throw new Error(`Unknown algorithm: ${algorithm}`);
      }
    }, dataSize);

    return {
      encrypted,
      key,
      algorithm,
      timestamp: Date.now(),
      performanceMetrics: metrics,
    };
  }

  async decrypt(
    ciphertext: string,
    algorithm: CipherAlgorithm,
    key: string,
    mode: SecurityMode = "balanced"
  ): Promise<DecryptionResult> {
    const dataSize = new Blob([ciphertext]).size;

    const { result: decrypted, metrics } = this.measurePerformance(() => {
      switch (algorithm) {
        case "aes":
          return this.aes.decrypt(ciphertext, key, mode);
        case "rsa":
          const keypair = JSON.parse(key);
          return this.rsa.decrypt(ciphertext, keypair.privateKey);
        case "hill":
          const matrix = this.hill.stringToKey(key);
          return this.hill.decrypt(ciphertext, matrix);
        case "vigenere":
          return this.vigenere.decrypt(ciphertext, key);
        case "blowfish":
          return this.blowfish.decrypt(ciphertext, key);
        default:
          throw new Error(`Unknown algorithm: ${algorithm}`);
      }
    }, dataSize);

    return {
      decrypted,
      algorithm,
      timestamp: Date.now(),
      performanceMetrics: metrics,
    };
  }

  // Multi-layer encryption for high security mode
  async multiLayerEncrypt(
    plaintext: string,
    algorithms: CipherAlgorithm[],
    mode: SecurityMode = "high"
  ): Promise<{ encrypted: string; keys: Record<string, string>; metrics: PerformanceMetrics[] }> {
    let encrypted = plaintext;
    const keys: Record<string, string> = {};
    const metrics: PerformanceMetrics[] = [];

    for (const algorithm of algorithms) {
      const key = this.generateKey(algorithm, mode);
      const result = await this.encrypt(encrypted, algorithm, key, mode);
      encrypted = result.encrypted;
      keys[algorithm] = key;
      metrics.push(result.performanceMetrics);
    }

    return { encrypted, keys, metrics };
  }

  async multiLayerDecrypt(
    ciphertext: string,
    algorithms: CipherAlgorithm[],
    keys: Record<string, string>,
    mode: SecurityMode = "high"
  ): Promise<{ decrypted: string; metrics: PerformanceMetrics[] }> {
    let decrypted = ciphertext;
    const metrics: PerformanceMetrics[] = [];

    // Decrypt in reverse order
    for (let i = algorithms.length - 1; i >= 0; i--) {
      const algorithm = algorithms[i];
      const key = keys[algorithm];
      const result = await this.decrypt(decrypted, algorithm, key, mode);
      decrypted = result.decrypted;
      metrics.push(result.performanceMetrics);
    }

    return { decrypted, metrics };
  }
}
