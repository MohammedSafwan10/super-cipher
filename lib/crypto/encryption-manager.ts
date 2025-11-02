import { AESCipher } from "./aes";
import { RSACipher } from "./rsa";
import { HillCipher } from "./hill";
import { VigenereCipher } from "./vigenere";
import { BlowfishCipher } from "./blowfish";
import { CaesarCipher } from "./caesar";
import {
  CipherAlgorithm,
  SecurityMode,
  EncryptionResult,
  DecryptionResult,
  PerformanceMetrics,
  EncryptionLayer,
} from "./types";

export class EncryptionManager {
  private aes = new AESCipher();
  private rsa = new RSACipher();
  private hill = new HillCipher();
  private vigenere = new VigenereCipher();
  private blowfish = new BlowfishCipher();
  private caesar = new CaesarCipher();

  // Get recommended algorithms based on security mode
  getRecommendedAlgorithms(mode: SecurityMode): CipherAlgorithm[] {
    switch (mode) {
      case "high":
        // 5 layers for maximum security
        // Note: Hill cipher removed - incompatible with binary data from RSA/AES
        return ["aes", "rsa", "vigenere", "blowfish", "caesar"];
      case "balanced":
        // 3 layers for balanced performance
        // Note: Hill cipher removed - incompatible with AES base64 output
        return ["aes", "vigenere", "blowfish"];
      case "lightweight":
        // 2 layers for speed
        return ["caesar", "vigenere"];
      default:
        return ["aes"];
    }
  }

  private measurePerformance<T>(fn: () => T, dataSize: number): { result: T; metrics: PerformanceMetrics } {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    const result = fn();

    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

    const encryptionTime = Math.max(endTime - startTime, 0.001); // Minimum 0.001ms to avoid division by zero
    const memoryUsed = Math.max(0, endMemory - startMemory);
    const throughput = encryptionTime > 0 ? dataSize / (encryptionTime / 1000) : 0; // bytes per second

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

  async generateKey(algorithm: CipherAlgorithm, mode: SecurityMode = "balanced"): Promise<string> {
    switch (algorithm) {
      case "aes":
        return this.aes.generateKey(mode);
      case "rsa":
        const keypair = await this.rsa.generateKeyPair(mode);
        return JSON.stringify(keypair);
      case "hill":
        const matrix = this.hill.generateKey(2);
        return this.hill.keyToString(matrix);
      case "vigenere":
        return this.vigenere.generateKey(mode === "high" ? 32 : mode === "balanced" ? 16 : 8);
      case "blowfish":
        return this.blowfish.generateKey(mode);
      case "caesar":
        const shift = this.caesar.generateKey(mode);
        return this.caesar.formatKey(shift);
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
          try {
            const keypair = JSON.parse(key);
            if (!keypair.publicKey || !keypair.privateKey) {
              throw new Error("Invalid RSA key format");
            }
            return this.rsa.encrypt(plaintext, keypair.publicKey);
          } catch (e) {
            throw new Error("Invalid RSA key format: must be valid JSON with publicKey and privateKey");
          }
        case "hill":
          const matrix = this.hill.stringToKey(key);
          return this.hill.encrypt(plaintext, matrix);
        case "vigenere":
          return this.vigenere.encrypt(plaintext, key);
        case "blowfish":
          return this.blowfish.encrypt(plaintext, key);
        case "caesar":
          if (!key.startsWith("SHIFT-")) {
            throw new Error("Invalid Caesar key format: must be SHIFT-N where N is a number");
          }
          const shift = parseInt(key.replace("SHIFT-", ""));
          if (isNaN(shift)) {
            throw new Error("Invalid Caesar key: shift value must be a number");
          }
          return this.caesar.encrypt(plaintext, shift);
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
          if (!key || key.trim() === "") {
            throw new Error("RSA key is missing. Please regenerate keys.");
          }
          try {
            const keypair = JSON.parse(key);
            if (!keypair.publicKey || !keypair.privateKey) {
              throw new Error("RSA key is incomplete. Please regenerate keys.");
            }
            return this.rsa.decrypt(ciphertext, keypair.privateKey);
          } catch (e) {
            if (e instanceof SyntaxError) {
              throw new Error("RSA key is corrupted. Please regenerate keys.");
            }
            throw e;
          }
        case "hill":
          const matrix = this.hill.stringToKey(key);
          return this.hill.decrypt(ciphertext, matrix);
        case "vigenere":
          return this.vigenere.decrypt(ciphertext, key);
        case "blowfish":
          return this.blowfish.decrypt(ciphertext, key);
        case "caesar":
          if (!key.startsWith("SHIFT-")) {
            throw new Error("Invalid Caesar key format: must be SHIFT-N where N is a number");
          }
          const shift = parseInt(key.replace("SHIFT-", ""));
          if (isNaN(shift)) {
            throw new Error("Invalid Caesar key: shift value must be a number");
          }
          return this.caesar.decrypt(ciphertext, shift);
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

  // Get algorithm display name
  getAlgorithmName(algorithm: CipherAlgorithm): string {
    const names: Record<CipherAlgorithm, string> = {
      aes: "AES (Advanced Encryption Standard)",
      rsa: "RSA (Rivest-Shamir-Adleman)",
      hill: "Hill Cipher",
      vigenere: "Vigenère Cipher",
      blowfish: "Blowfish",
      caesar: "Caesar Cipher",
    };
    return names[algorithm];
  }

  // Get key generation description
  getKeyDescription(algorithm: CipherAlgorithm, mode: SecurityMode): string {
    switch (algorithm) {
      case "aes":
        const aesSize = mode === "high" ? 256 : mode === "balanced" ? 192 : 128;
        return `${aesSize}-bit random hexadecimal key using WordArray`;
      case "rsa":
        const rsaSize = mode === "high" ? 4096 : mode === "balanced" ? 2048 : 1024;
        return `${rsaSize}-bit public/private key pair using OAEP padding`;
      case "hill":
        return "2×2 random invertible matrix with determinant ≠ 0";
      case "vigenere":
        const vigLen = mode === "high" ? 32 : mode === "balanced" ? 16 : 8;
        return `${vigLen}-character random uppercase alphabetic key`;
      case "blowfish":
        const bfSize = mode === "high" ? 448 : mode === "balanced" ? 256 : 128;
        return `${bfSize}-bit random hexadecimal key`;
      case "caesar":
        const caesarRange = mode === "high" ? "1-25" : mode === "balanced" ? "1-20" : "1-13";
        return `Random shift value (${caesarRange})`;
      default:
        return "Dynamic key generation";
    }
  }

  // Multi-layer encryption for high security mode
  async multiLayerEncrypt(
    plaintext: string,
    algorithms: CipherAlgorithm[],
    mode: SecurityMode = "high",
    existingKeys?: Record<string, string>
  ): Promise<{ encrypted: string; keys: Record<string, string>; metrics: PerformanceMetrics[]; layers: EncryptionLayer[] }> {
    let encrypted = plaintext;
    const keys: Record<string, string> = {};
    const metrics: PerformanceMetrics[] = [];
    const layers: EncryptionLayer[] = [];

    console.log(`🔐 Starting multi-layer encryption with ${algorithms.length} layers (${mode.toUpperCase()} mode)`);
    console.log(`📋 Algorithms (in order):`, algorithms);
    console.log(`📝 Original plaintext length: ${plaintext.length} characters`);
    console.log(`🔑 Using existing keys: ${existingKeys ? 'YES' : 'NO (generating new)'}\n`);

    for (let i = 0; i < algorithms.length; i++) {
      const algorithm = algorithms[i];
      console.log(`\n🔑 Layer ${i + 1}/${algorithms.length}: Encrypting with ${algorithm.toUpperCase()}`);
      console.log(`   Input length: ${encrypted.length} characters`);
      
      // Use existing key if provided, otherwise generate new one
      const key = existingKeys?.[algorithm] || await this.generateKey(algorithm, mode);
      
      if (existingKeys?.[algorithm]) {
        console.log(`   ✅ Using pre-generated key`);
      } else {
        console.log(`   ⚠️ Generating NEW key (no existing key found)`);
      }
      
      const result = await this.encrypt(encrypted, algorithm, key, mode);
      encrypted = result.encrypted;
      keys[algorithm] = key;
      metrics.push(result.performanceMetrics);
      layers.push({
        algorithm,
        key,
        order: i + 1,
      });
      
      console.log(`   ✅ Success! Output length: ${encrypted.length} characters`);
    }

    console.log(`\n✅ Multi-layer encryption completed!`);
    console.log(`📦 Final ciphertext length: ${encrypted.length} characters`);
    console.log(`🔑 Keys used: ${Object.keys(keys).length}\n`);

    return { encrypted, keys, metrics, layers };
  }

  async multiLayerDecrypt(
    ciphertext: string,
    algorithms: CipherAlgorithm[],
    keys: Record<string, string>,
    mode: SecurityMode = "high"
  ): Promise<{ decrypted: string; metrics: PerformanceMetrics[]; layers: EncryptionLayer[] }> {
    // Validate all required keys exist
    const missingKeys: string[] = [];
    for (const algorithm of algorithms) {
      if (!keys[algorithm]) {
        missingKeys.push(algorithm.toUpperCase());
      }
    }
    if (missingKeys.length > 0) {
      throw new Error(`Missing keys for: ${missingKeys.join(", ")}. Click "Clear" and regenerate all keys.`);
    }

    let decrypted = ciphertext;
    const metrics: PerformanceMetrics[] = [];
    const layers: EncryptionLayer[] = [];

    console.log(`🔓 Starting multi-layer decryption with ${algorithms.length} layers`);
    console.log(`📋 Algorithms (reverse order):`, [...algorithms].reverse());

    // Decrypt in reverse order
    for (let i = algorithms.length - 1; i >= 0; i--) {
      const algorithm = algorithms[i];
      const key = keys[algorithm];
      
      console.log(`\n🔑 Layer ${algorithms.length - i}/${algorithms.length}: Decrypting with ${algorithm.toUpperCase()}`);
      console.log(`   Input length: ${decrypted.length} characters`);
      console.log(`   Input preview: ${decrypted.substring(0, 50)}...`);
      
      try {
        const result = await this.decrypt(decrypted, algorithm, key, mode);
        decrypted = result.decrypted;
        console.log(`   ✅ Success! Output length: ${decrypted.length} characters`);
        console.log(`   Output preview: ${decrypted.substring(0, 50)}...`);
        
        metrics.push(result.performanceMetrics);
        layers.push({
          algorithm,
          key,
          order: algorithms.length - i,
        });
      } catch (error) {
        console.error(`   ❌ Decryption failed at layer ${algorithms.length - i} (${algorithm.toUpperCase()})`);
        console.error(`   Error:`, error);
        
        // Provide helpful error message
        const layerInfo = `Layer ${algorithms.length - i}/${algorithms.length} (${algorithm.toUpperCase()})`;
        throw new Error(
          `Decryption failed at ${layerInfo}\n\n` +
          `❌ ${error}\n\n` +
          `💡 Common causes:\n` +
          `1. The keys don't match the ones used for encryption\n` +
          `2. The ciphertext was encrypted with a different security mode\n` +
          `3. The ciphertext is corrupted or modified\n\n` +
          `✅ Solution:\n` +
          `• Make sure you're using the EXACT same keys that encrypted this text\n` +
          `• Verify the security mode matches (currently: ${mode.toUpperCase()})\n` +
          `• Try encrypting and decrypting in the same session first`
        );
      }
    }

    console.log(`\n✅ Multi-layer decryption completed successfully!`);
    console.log(`📝 Final plaintext length: ${decrypted.length} characters\n`);

    return { decrypted, metrics, layers };
  }
}
