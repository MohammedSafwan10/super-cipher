"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Unlock, Key, Download, Upload, Sparkles } from "lucide-react";
import { EncryptionManager } from "@/lib/crypto/encryption-manager";
import { CipherAlgorithm, SecurityMode } from "@/lib/crypto/types";
import { cn, formatTime, formatBytes } from "@/lib/utils";

const encryptionManager = new EncryptionManager();

interface EncryptionPanelProps {
  onPerformanceUpdate?: (metrics: any) => void;
  onHistoryAdd?: (entry: any) => void;
}

export function EncryptionPanel({ onPerformanceUpdate, onHistoryAdd }: EncryptionPanelProps) {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [algorithm, setAlgorithm] = useState<CipherAlgorithm>("aes");
  const [securityMode, setSecurityMode] = useState<SecurityMode>("balanced");
  const [plaintext, setPlaintext] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [key, setKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState("");

  const algorithms: { value: CipherAlgorithm; label: string; description: string }[] = [
    { value: "aes", label: "AES", description: "Advanced Encryption Standard" },
    { value: "rsa", label: "RSA", description: "Rivest-Shamir-Adleman" },
    { value: "blowfish", label: "Blowfish", description: "Fast Block Cipher" },
    { value: "vigenere", label: "Vigenère", description: "Classical Polyalphabetic" },
    { value: "hill", label: "Hill", description: "Matrix-based Cipher" },
  ];

  const securityModes: { value: SecurityMode; label: string; description: string }[] = [
    { value: "high", label: "High Security", description: "Maximum protection, slower" },
    { value: "balanced", label: "Balanced", description: "Good security, reasonable speed" },
    { value: "lightweight", label: "Lightweight", description: "Fast, basic protection" },
  ];

  const generateKey = () => {
    try {
      const newKey = encryptionManager.generateKey(algorithm, securityMode);
      setKey(newKey);
    } catch (error) {
      console.error("Key generation failed:", error);
      alert(`Failed to generate key: ${error}`);
    }
  };

  const handleEncrypt = async () => {
    if (!plaintext.trim()) {
      alert("Please enter text to encrypt");
      return;
    }

    if (!key.trim()) {
      alert("Please generate or enter a key");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await encryptionManager.encrypt(plaintext, algorithm, key, securityMode);
      setCiphertext(result.encrypted);
      setResult(result.encrypted);

      if (onPerformanceUpdate) {
        onPerformanceUpdate(result.performanceMetrics);
      }

      if (onHistoryAdd) {
        onHistoryAdd({
          id: Date.now().toString(),
          type: "encrypt",
          algorithm,
          timestamp: result.timestamp,
          inputSize: new Blob([plaintext]).size,
          metrics: result.performanceMetrics,
          success: true,
        });
      }
    } catch (error) {
      console.error("Encryption failed:", error);
      alert(`Encryption failed: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!ciphertext.trim()) {
      alert("Please enter text to decrypt");
      return;
    }

    if (!key.trim()) {
      alert("Please enter the decryption key");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await encryptionManager.decrypt(ciphertext, algorithm, key, securityMode);
      setPlaintext(result.decrypted);
      setResult(result.decrypted);

      if (onPerformanceUpdate) {
        onPerformanceUpdate(result.performanceMetrics);
      }

      if (onHistoryAdd) {
        onHistoryAdd({
          id: Date.now().toString(),
          type: "decrypt",
          algorithm,
          timestamp: result.timestamp,
          inputSize: new Blob([ciphertext]).size,
          metrics: result.performanceMetrics,
          success: true,
        });
      }
    } catch (error) {
      console.error("Decryption failed:", error);
      alert(`Decryption failed: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mode}-result-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode("encrypt")}
          className={cn(
            "px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all",
            mode === "encrypt"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
              : "bg-white hover:bg-indigo-50 text-gray-900 font-semibold border-2 border-indigo-200 hover:border-indigo-400"
          )}
        >
          <Lock className="w-5 h-5" />
          Encrypt
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode("decrypt")}
          className={cn(
            "px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all",
            mode === "decrypt"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
              : "bg-white hover:bg-purple-50 text-gray-900 font-semibold border-2 border-purple-200 hover:border-purple-400"
          )}
        >
          <Unlock className="w-5 h-5" />
          Decrypt
        </motion.button>
      </div>

      {/* Algorithm Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Select Encryption Algorithm
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {algorithms.map((algo) => (
            <motion.button
              key={algo.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAlgorithm(algo.value)}
              className={cn(
                "p-4 rounded-xl text-center transition-all",
                algorithm === algo.value
                  ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg"
                  : "bg-white hover:bg-indigo-50 text-gray-900 font-bold border-2 border-indigo-200 hover:border-indigo-400"
              )}
            >
              <div className="font-bold text-lg">{algo.label}</div>
              <div className="text-xs opacity-80 mt-1">{algo.description}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Security Mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-lg font-bold mb-4 text-gray-900">Security Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {securityModes.map((sm) => (
            <motion.button
              key={sm.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSecurityMode(sm.value)}
              className={cn(
                "p-4 rounded-xl text-left transition-all",
                securityMode === sm.value
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                  : "bg-white hover:bg-pink-50 text-gray-900 font-bold border-2 border-pink-200 hover:border-pink-400"
              )}
            >
              <div className="font-bold">{sm.label}</div>
              <div className="text-sm opacity-80 mt-1">{sm.description}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Input/Output Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 shadow-xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-3">
            <label className="block font-bold text-gray-900">
              {mode === "encrypt" ? "Plaintext" : "Ciphertext"}
            </label>
            <textarea
              value={mode === "encrypt" ? plaintext : ciphertext}
              onChange={(e) =>
                mode === "encrypt" ? setPlaintext(e.target.value) : setCiphertext(e.target.value)
              }
              placeholder={`Enter ${mode === "encrypt" ? "text to encrypt" : "text to decrypt"}...`}
              className="w-full h-40 p-4 rounded-xl bg-white text-gray-900 border-2 border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none shadow-md"
            />
          </div>

          {/* Output */}
          <div className="space-y-3">
            <label className="block font-bold text-gray-900">
              {mode === "encrypt" ? "Ciphertext" : "Plaintext"}
            </label>
            <textarea
              value={result}
              readOnly
              placeholder="Result will appear here..."
              className="w-full h-40 p-4 rounded-xl bg-gray-50 text-gray-900 border-2 border-purple-300 resize-none shadow-md"
            />
          </div>
        </div>

        {/* Key Section */}
        <div className="mt-6 space-y-3">
          <label className="block font-bold flex items-center gap-2 text-gray-900">
            <Key className="w-5 h-5 text-amber-600" />
            Encryption Key
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter or generate a key..."
              className="flex-1 p-4 rounded-xl bg-white text-gray-900 border-2 border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm shadow-md"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateKey}
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              Generate
            </motion.button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={mode === "encrypt" ? handleEncrypt : handleDecrypt}
            disabled={isProcessing}
            className={cn(
              "px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all",
              isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl"
            )}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {mode === "encrypt" ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                {mode === "encrypt" ? "Encrypt" : "Decrypt"}
              </span>
            )}
          </motion.button>

          {result && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadResult}
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
