"use client";

import { motion } from "framer-motion";
import { Lock, Unlock, Trash2, Clock } from "lucide-react";
import { HistoryEntry } from "@/lib/crypto/types";
import { formatTime, formatBytes } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface EncryptionHistoryProps {
  history: HistoryEntry[];
  onClear: () => void;
}

export function EncryptionHistory({ history, onClear }: EncryptionHistoryProps) {
  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass dark:glass-dark rounded-2xl p-8 shadow-xl text-center"
      >
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg opacity-70">No encryption history yet</p>
        <p className="text-sm opacity-50 mt-2">Your encryption operations will appear here</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass dark:glass-dark rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Encryption History</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500 flex items-center gap-2 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </motion.button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "p-4 rounded-xl backdrop-blur-sm border transition-all hover:scale-[1.02]",
              entry.type === "encrypt"
                ? "bg-purple-500/10 border-purple-500/30"
                : "bg-blue-500/10 border-blue-500/30"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  entry.type === "encrypt" ? "bg-purple-500/20" : "bg-blue-500/20"
                )}
              >
                {entry.type === "encrypt" ? (
                  <Lock className="w-5 h-5 text-purple-400" />
                ) : (
                  <Unlock className="w-5 h-5 text-blue-400" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold capitalize">{entry.type}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-mono uppercase">
                    {entry.algorithm}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm opacity-70">
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  <span>{formatBytes(entry.inputSize)}</span>
                  <span>{formatTime(entry.metrics.encryptionTime)}</span>
                </div>
              </div>

              <div
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold",
                  entry.success
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                )}
              >
                {entry.success ? "Success" : "Failed"}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
