"use client";

import { motion } from "framer-motion";
import { Key, Info } from "lucide-react";
import { CipherAlgorithm, SecurityMode } from "@/lib/crypto/types";
import { EncryptionManager } from "@/lib/crypto/encryption-manager";

interface KeyGenerationInfoProps {
  algorithms: CipherAlgorithm[];
  securityMode: SecurityMode;
}

export function KeyGenerationInfo({ algorithms, securityMode }: KeyGenerationInfoProps) {
  const manager = new EncryptionManager();

  if (algorithms.length === 0) return null;

  return (
    <div className="glass p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
          <Key className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-black">Key Generation Methods</h3>
          <p className="text-sm text-gray-600">
            How each algorithm generates its encryption keys
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {algorithms.map((algorithm, index) => (
          <motion.div
            key={algorithm}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white rounded-xl border-2 border-purple-200"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg text-white font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-black capitalize mb-1">
                  {manager.getAlgorithmName(algorithm)}
                </h4>
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {manager.getKeyDescription(algorithm, securityMode)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Security Mode Info */}
      <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
        <p className="text-sm text-gray-700 font-semibold mb-2">
          <span className="text-indigo-600 capitalize">{securityMode}</span> Security Mode
        </p>
        <p className="text-xs text-gray-600 leading-relaxed">
          {securityMode === "high" &&
            "Maximum security with strongest key lengths and 5 encryption layers."}
          {securityMode === "balanced" &&
            "Optimal balance between security and performance with 3 encryption layers."}
          {securityMode === "lightweight" &&
            "Fast encryption with basic security using 2 encryption layers."}
        </p>
      </div>
    </div>
  );
}
