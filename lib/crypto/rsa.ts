import forge from "node-forge";
import { SecurityMode } from "./types";

export class RSACipher {
  private getKeySize(mode: SecurityMode): number {
    switch (mode) {
      case "high":
        return 4096;
      case "balanced":
        return 2048;
      case "lightweight":
        return 1024;
    }
  }

  generateKeyPair(mode: SecurityMode = "balanced"): { publicKey: string; privateKey: string } {
    const keySize = this.getKeySize(mode);
    const keypair = forge.pki.rsa.generateKeyPair({ bits: keySize, workers: -1 });

    return {
      publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
      privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
    };
  }

  encrypt(plaintext: string, publicKeyPem: string): string {
    try {
      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
      const encrypted = publicKey.encrypt(plaintext, "RSA-OAEP", {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha1.create(),
        },
      });
      return forge.util.encode64(encrypted);
    } catch (error) {
      throw new Error(`RSA encryption failed: ${error}`);
    }
  }

  decrypt(ciphertext: string, privateKeyPem: string): string {
    try {
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
      const encrypted = forge.util.decode64(ciphertext);
      const decrypted = privateKey.decrypt(encrypted, "RSA-OAEP", {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha1.create(),
        },
      });
      return decrypted;
    } catch (error) {
      throw new Error(`RSA decryption failed: ${error}`);
    }
  }
}
