"use client";

import { motion } from "framer-motion";
import { Shield, Key, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { CipherAlgorithm, EncryptionLayer } from "@/lib/crypto/types";

interface EncryptionFlowProps {
  layers: EncryptionLayer[];
  isEncrypting?: boolean;
  currentStep?: number;
}

const algorithmIcons: Record<CipherAlgorithm, string> = {
  aes: "🔐",
  rsa: "🔑",
  hill: "📊",
  vigenere: "📝",
  blowfish: "🐡",
  caesar: "🏛️",
};

const algorithmColors: Record<CipherAlgorithm, string> = {
  aes: "from-blue-500 to-cyan-500",
  rsa: "from-purple-500 to-pink-500",
  hill: "from-green-500 to-emerald-500",
  vigenere: "from-orange-500 to-amber-500",
  blowfish: "from-indigo-500 to-violet-500",
  caesar: "from-red-500 to-rose-500",
};

export function EncryptionFlow({ layers, isEncrypting = false, currentStep = 0 }: EncryptionFlowProps) {
  if (layers.length === 0) return null;

  return (
    <div className="glass p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-black">
            {isEncrypting ? "Encryption" : "Decryption"} Layers
          </h3>
          <p className="text-sm text-gray-600">
            {layers.length} layer{layers.length > 1 ? "s" : ""} of security
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {layers.map((layer, index) => {
          const isActive = isEncrypting && index === currentStep;
          const isComplete = isEncrypting ? index < currentStep : false;

          return (
            <div key={`${layer.algorithm}-${layer.order}`}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-200"
                    : isComplete
                    ? "border-green-500 bg-green-50"
                    : "border-purple-200 bg-white"
                }`}
              >
                {/* Layer Number Badge */}
                <div className="absolute -left-3 -top-3 w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {layer.order}
                </div>

                {/* Completion Check */}
                {isComplete && (
                  <div className="absolute -right-2 -top-2">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Algorithm Icon */}
                  <div
                    className={`p-3 bg-gradient-to-br ${
                      algorithmColors[layer.algorithm]
                    } rounded-xl text-2xl shadow-md`}
                  >
                    {algorithmIcons[layer.algorithm]}
                  </div>

                  {/* Algorithm Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-black capitalize">
                        {layer.algorithm.toUpperCase()}
                      </h4>
                      {isActive && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-2 h-2 bg-indigo-500 rounded-full"
                        />
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mb-2">
                      Layer {layer.order} • {isEncrypting ? "Encrypting" : "Decrypting"} with{" "}
                      {layer.algorithm}
                    </p>

                    {/* Key Preview */}
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <Key className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <code className="text-xs text-gray-700 font-mono truncate">
                        {layer.key.length > 40
                          ? `${layer.key.substring(0, 40)}...`
                          : layer.key}
                      </code>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Arrow between layers */}
              {index < layers.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="w-5 h-5 text-purple-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Output */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: layers.length * 0.1 + 0.2 }}
        className="mt-6 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white"
      >
        <div className="flex items-center gap-3">
          <Lock className="w-6 h-6" />
          <div>
            <p className="font-bold">
              {isEncrypting ? "Final Ciphertext" : "Decrypted Plaintext"}
            </p>
            <p className="text-sm opacity-90">
              {isEncrypting
                ? "Your data is now secured with multi-layer encryption"
                : "Your data has been successfully decrypted"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
