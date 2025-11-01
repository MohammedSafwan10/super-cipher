"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Key, Download, Shield, Layers } from "lucide-react";
import { EncryptionManager } from "@/lib/crypto/encryption-manager";
import { CipherAlgorithm, SecurityMode, EncryptionLayer } from "@/lib/crypto/types";
import { cn, formatTime, formatBytes } from "@/lib/utils";
import { EncryptionFlow } from "./encryption-flow";
import { KeyGenerationInfo } from "./key-generation-info";

const encryptionManager = new EncryptionManager();

interface EncryptionPanelProps {
  onPerformanceUpdate?: (metrics: any) => void;
  onHistoryAdd?: (entry: any) => void;
}

export function EncryptionPanel({ onPerformanceUpdate, onHistoryAdd }: EncryptionPanelProps) {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [securityMode, setSecurityMode] = useState<SecurityMode>("balanced");
  const [plaintext, setPlaintext] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [result, setResult] = useState("");
  const [layers, setLayers] = useState<EncryptionLayer[]>([]);
  const [showLayerInfo, setShowLayerInfo] = useState(true);
  const [isSecurityModeLocked, setIsSecurityModeLocked] = useState(false);

  const securityModes: { value: SecurityMode; label: string; description: string; layers: number }[] = [
    { value: "high", label: "High Security", description: "5 layers - Maximum protection", layers: 5 },
    { value: "balanced", label: "Balanced", description: "3 layers - Optimal performance", layers: 3 },
    { value: "lightweight", label: "Lightweight", description: "2 layers - Fast encryption", layers: 2 },
  ];

  // Get recommended algorithms for current security mode
  const selectedAlgorithms = encryptionManager.getRecommendedAlgorithms(securityMode);

  const generateKeys = async () => {
    setIsGeneratingKeys(true);
    try {
      const newKeys: Record<string, string> = {};

      // Generate keys one by one to show progress (RSA can be slow)
      for (const algorithm of selectedAlgorithms) {
        newKeys[algorithm] = await encryptionManager.generateKey(algorithm, securityMode);
        // Small delay to allow UI updates
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setKeys(newKeys);
      setIsSecurityModeLocked(true); // Lock security mode after keys are generated
    } catch (error) {
      console.error("Key generation failed:", error);
      alert(`Failed to generate keys: ${error}`);
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  const handleEncrypt = async () => {
    if (!plaintext.trim()) {
      alert("Please enter text to encrypt");
      return;
    }

    if (Object.keys(keys).length === 0) {
      alert("Please generate encryption keys first");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await encryptionManager.multiLayerEncrypt(
        plaintext,
        selectedAlgorithms,
        securityMode
      );

      setCiphertext(result.encrypted);
      setResult(result.encrypted);
      setLayers(result.layers);
      setKeys(result.keys);

      // Calculate combined metrics
      const totalTime = result.metrics.reduce((sum, m) => sum + m.encryptionTime, 0);
      const maxMemory = Math.max(...result.metrics.map((m) => m.memoryUsed));
      const avgThroughput =
        result.metrics.reduce((sum, m) => sum + m.throughput, 0) / result.metrics.length;

      const combinedMetrics = {
        encryptionTime: totalTime,
        memoryUsed: maxMemory,
        dataSize: new Blob([plaintext]).size,
        throughput: avgThroughput,
      };

      if (onPerformanceUpdate) {
        onPerformanceUpdate(combinedMetrics);
      }

      if (onHistoryAdd) {
        onHistoryAdd({
          id: Date.now().toString(),
          type: "encrypt",
          algorithm: selectedAlgorithms[0], // Primary algorithm
          timestamp: Date.now(),
          inputSize: new Blob([plaintext]).size,
          metrics: combinedMetrics,
          success: true,
          layers: result.layers,
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

    if (Object.keys(keys).length === 0) {
      alert("Please enter the decryption keys");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await encryptionManager.multiLayerDecrypt(
        ciphertext,
        selectedAlgorithms,
        keys,
        securityMode
      );

      setPlaintext(result.decrypted);
      setResult(result.decrypted);
      setLayers(result.layers);

      // Calculate combined metrics
      const totalTime = result.metrics.reduce((sum, m) => sum + m.encryptionTime, 0);
      const maxMemory = Math.max(...result.metrics.map((m) => m.memoryUsed));
      const avgThroughput =
        result.metrics.reduce((sum, m) => sum + m.throughput, 0) / result.metrics.length;

      const combinedMetrics = {
        encryptionTime: totalTime,
        memoryUsed: maxMemory,
        dataSize: new Blob([ciphertext]).size,
        throughput: avgThroughput,
      };

      if (onPerformanceUpdate) {
        onPerformanceUpdate(combinedMetrics);
      }

      if (onHistoryAdd) {
        onHistoryAdd({
          id: Date.now().toString(),
          type: "decrypt",
          algorithm: selectedAlgorithms[0], // Primary algorithm
          timestamp: Date.now(),
          inputSize: new Blob([ciphertext]).size,
          metrics: combinedMetrics,
          success: true,
          layers: result.layers,
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

  const downloadKeys = () => {
    const keysText = Object.entries(keys)
      .map(([algo, key]) => `${algo.toUpperCase()}: ${key}`)
      .join("\n\n");
    const blob = new Blob([keysText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `encryption-keys-${Date.now()}.txt`;
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

      {/* Security Mode Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
          <Shield className="w-5 h-5 text-indigo-600" />
          Security Mode (Auto-selects encryption layers)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {securityModes.map((sm) => (
            <motion.button
              key={sm.value}
              whileHover={{ scale: isSecurityModeLocked ? 1 : 1.02 }}
              whileTap={{ scale: isSecurityModeLocked ? 1 : 0.98 }}
              onClick={() => {
                if (!isSecurityModeLocked) {
                  setSecurityMode(sm.value);
                  setKeys({}); // Clear keys when mode changes
                  setLayers([]); // Clear layers
                }
              }}
              disabled={isSecurityModeLocked}
              className={cn(
                "p-5 rounded-xl text-left transition-all relative overflow-hidden",
                isSecurityModeLocked && "opacity-60 cursor-not-allowed",
                securityMode === sm.value
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                  : "bg-white hover:bg-pink-50 text-gray-900 font-bold border-2 border-pink-200 hover:border-pink-400"
              )}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-lg">{sm.label}</div>
                  <div
                    className={cn(
                      "px-2 py-1 rounded-lg text-xs font-bold",
                      securityMode === sm.value
                        ? "bg-white/20 text-white"
                        : "bg-pink-100 text-pink-700"
                    )}
                  >
                    {sm.layers} Layers
                  </div>
                </div>
                <div className={cn("text-sm mt-1", securityMode === sm.value ? "opacity-90" : "opacity-70")}>
                  {sm.description}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
        {isSecurityModeLocked && (
          <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
            <p className="text-sm text-yellow-800 font-semibold">
              🔒 Security mode is locked. Clear keys to change mode.
            </p>
          </div>
        )}
      </motion.div>

      {/* Selected Algorithms Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
          <Layers className="w-5 h-5 text-purple-600" />
          Encryption Layers ({selectedAlgorithms.length} algorithms)
        </h3>
        <div className="flex flex-wrap gap-3">
          {selectedAlgorithms.map((algo, index) => (
            <motion.div
              key={algo}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow-md flex items-center gap-2"
            >
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{index + 1}</span>
              {algo.toUpperCase()}
            </motion.div>
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Your data will be encrypted sequentially through {selectedAlgorithms.length} layers for{" "}
          <span className="font-bold text-indigo-600">{securityMode}</span> security.
        </p>
      </motion.div>

      {/* Key Generation Info Toggle */}
      {selectedAlgorithms.length > 0 && (
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLayerInfo(!showLayerInfo)}
            className="px-6 py-2 rounded-xl bg-white border-2 border-indigo-300 text-gray-900 font-semibold hover:bg-indigo-50 transition-all"
          >
            {showLayerInfo ? "Hide" : "Show"} Key Generation Details
          </motion.button>
        </div>
      )}

      {/* Key Generation Info */}
      <AnimatePresence>
        {showLayerInfo && selectedAlgorithms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <KeyGenerationInfo algorithms={selectedAlgorithms} securityMode={securityMode} />
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* Keys Display */}
        <div className="mt-6 space-y-3">
          <label className="block font-bold flex items-center gap-2 text-gray-900">
            <Key className="w-5 h-5 text-amber-600" />
            Encryption Keys ({selectedAlgorithms.length} keys)
          </label>

          {Object.keys(keys).length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-xl border-2 border-indigo-200">
              {selectedAlgorithms.map((algo) => (
                <div key={algo} className="p-2 bg-white rounded-lg border border-gray-200">
                  <div className="text-xs font-bold text-indigo-600 uppercase mb-1">{algo}</div>
                  <code className="text-xs text-gray-700 font-mono break-all">
                    {keys[algo] || "Not generated"}
                  </code>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200 text-center">
              <p className="text-sm text-gray-700">No keys generated yet. Click "Generate Keys" below.</p>
            </div>
          )}

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: isGeneratingKeys ? 1 : 1.05 }}
              whileTap={{ scale: isGeneratingKeys ? 1 : 0.95 }}
              onClick={generateKeys}
              disabled={isGeneratingKeys}
              className={cn(
                "flex-1 px-6 py-4 rounded-xl font-semibold shadow-lg transition-all",
                isGeneratingKeys
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-xl hover:from-amber-600 hover:to-orange-600"
              )}
            >
              {isGeneratingKeys ? (
                <span className="flex items-center gap-2 justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Keys...
                </span>
              ) : (
                "Generate Keys"
              )}
            </motion.button>

            {Object.keys(keys).length > 0 && (
              <>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadKeys}
                  className="px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Save Keys
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setKeys({});
                    setLayers([]);
                    setIsSecurityModeLocked(false);
                    setResult("");
                    setPlaintext("");
                    setCiphertext("");
                  }}
                  className="px-6 py-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Clear
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-center flex-wrap">
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
              Download Result
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Encryption Flow Visualization */}
      <AnimatePresence>
        {layers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3 }}
          >
            <EncryptionFlow layers={layers} isEncrypting={mode === "encrypt"} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
