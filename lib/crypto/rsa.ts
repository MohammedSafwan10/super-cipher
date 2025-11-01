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

      // Get max chunk size for RSA (key_size/8 - 42 for OAEP padding)
      const keySize = publicKey.n.bitLength();
      const maxChunkSize = Math.floor(keySize / 8) - 42;

      // Split plaintext into chunks
      const chunks: string[] = [];
      for (let i = 0; i < plaintext.length; i += maxChunkSize) {
        const chunk = plaintext.substring(i, i + maxChunkSize);
        const encryptedChunk = publicKey.encrypt(chunk, "RSA-OAEP", {
          md: forge.md.sha256.create(),
          mgf1: {
            md: forge.md.sha1.create(),
          },
        });
        chunks.push(forge.util.encode64(encryptedChunk));
      }

      // Join chunks with separator
      return chunks.join("||");
    } catch (error) {
      throw new Error(`RSA encryption failed: ${error}`);
    }
  }

  decrypt(ciphertext: string, privateKeyPem: string): string {
    try {
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

      // Split ciphertext into chunks
      const chunks = ciphertext.split("||");
      const decryptedChunks: string[] = [];

      for (const chunk of chunks) {
        const encrypted = forge.util.decode64(chunk);
        const decrypted = privateKey.decrypt(encrypted, "RSA-OAEP", {
          md: forge.md.sha256.create(),
          mgf1: {
            md: forge.md.sha1.create(),
          },
        });
        decryptedChunks.push(decrypted);
      }

      // Join decrypted chunks
      return decryptedChunks.join("");
    } catch (error) {
      throw new Error(`RSA decryption failed: ${error}`);
    }
  }
}
