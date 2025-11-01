export type SecurityMode = "high" | "balanced" | "lightweight";

export type CipherAlgorithm = "aes" | "rsa" | "hill" | "vigenere" | "blowfish" | "caesar";

export interface EncryptionConfig {
  algorithm: CipherAlgorithm;
  securityMode: SecurityMode;
  key?: string;
}

export interface EncryptionLayer {
  algorithm: CipherAlgorithm;
  key: string;
  order: number;
}

export interface LayeredEncryptionConfig {
  layers: CipherAlgorithm[];
  securityMode: SecurityMode;
}

export interface EncryptionResult {
  encrypted: string;
  key: string;
  algorithm: CipherAlgorithm;
  timestamp: number;
  performanceMetrics: PerformanceMetrics;
  layers?: EncryptionLayer[];
}

export interface DecryptionResult {
  decrypted: string;
  algorithm: CipherAlgorithm;
  timestamp: number;
  performanceMetrics: PerformanceMetrics;
  layers?: EncryptionLayer[];
}

export interface PerformanceMetrics {
  encryptionTime: number;
  memoryUsed: number;
  dataSize: number;
  throughput: number;
}

export interface HistoryEntry {
  id: string;
  type: "encrypt" | "decrypt";
  algorithm: CipherAlgorithm;
  timestamp: number;
  inputSize: number;
  metrics: PerformanceMetrics;
  success: boolean;
  layers?: EncryptionLayer[];
}
