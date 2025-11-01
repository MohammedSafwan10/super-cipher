"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { TypingText } from "@/components/ui/typing-text";
import { EncryptionPanel } from "@/components/features/encryption-panel";
import { PerformanceMetricsDisplay } from "@/components/features/performance-metrics";
import { EncryptionHistory } from "@/components/features/encryption-history";
import { PerformanceMetrics, HistoryEntry } from "@/lib/crypto/types";

export default function Home() {
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<
    Array<{ timestamp: number; time: number; throughput: number }>
  >([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const handlePerformanceUpdate = (metrics: PerformanceMetrics) => {
    setCurrentMetrics(metrics);
    setMetricsHistory((prev) => [
      ...prev.slice(-9),
      {
        timestamp: Date.now(),
        time: metrics.encryptionTime,
        throughput: metrics.throughput,
      },
    ]);
  };

  const handleHistoryAdd = (entry: HistoryEntry) => {
    setHistory((prev) => [entry, ...prev].slice(0, 50));
  };

  const handleClearHistory = () => {
    setHistory([]);
    setMetricsHistory([]);
    setCurrentMetrics(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm bg-white/80 border-b-2 border-purple-300 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Super Cipher
                </h1>
                <p className="text-sm text-gray-700 font-semibold">Advanced Cryptography System</p>
              </div>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Multi-Layer Encryption System
          </h2>
          <div className="text-lg text-gray-800 font-semibold max-w-3xl mx-auto min-h-[4rem] flex items-center justify-center">
            <TypingText
              text="Secure your data with multiple classical and modern encryption algorithms. Choose your security mode and protect your information with advanced cryptography."
              speed={30}
              loop={true}
            />
          </div>
        </motion.div>

        {/* Main Encryption Panel */}
        <EncryptionPanel
          onPerformanceUpdate={handlePerformanceUpdate}
          onHistoryAdd={handleHistoryAdd}
        />

        {/* Performance Metrics */}
        <PerformanceMetricsDisplay metrics={currentMetrics} history={metricsHistory} />

        {/* Encryption History */}
        <EncryptionHistory history={history} onClear={handleClearHistory} />

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8"
        >
          {[
            {
              title: "Multi-Algorithm Support",
              description: "AES, RSA, Caesar, Blowfish, Vigenère, and Hill cipher",
              icon: "🔐",
            },
            {
              title: "Security Modes",
              description: "Choose between High, Balanced, or Lightweight security",
              icon: "⚡",
            },
            {
              title: "Performance Tracking",
              description: "Real-time metrics and detailed analytics",
              icon: "📊",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:border-purple-400 transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-700 font-medium">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-8 text-gray-700"
        >
          <p className="text-sm font-semibold">
            Built with Next.js, TypeScript, and Tailwind CSS
          </p>
          <p className="text-xs mt-2 font-medium text-gray-600">
            Secure your data with confidence
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
