"use client";

import { motion } from "framer-motion";
import { Activity, Clock, Database, Zap } from "lucide-react";
import { PerformanceMetrics } from "@/lib/crypto/types";
import { formatTime, formatBytes } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PerformanceMetricsProps {
  metrics: PerformanceMetrics | null;
  history: Array<{ timestamp: number; time: number; throughput: number }>;
}

export function PerformanceMetricsDisplay({ metrics, history }: PerformanceMetricsProps) {
  const stats = [
    {
      icon: Clock,
      label: "Encryption Time",
      value: metrics ? formatTime(metrics.encryptionTime) : "—",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Database,
      label: "Memory Used",
      value: metrics ? formatBytes(metrics.memoryUsed) : "—",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      label: "Data Size",
      value: metrics ? formatBytes(metrics.dataSize) : "—",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Activity,
      label: "Throughput",
      value: metrics ? `${formatBytes(metrics.throughput)}/s` : "—",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass dark:glass-dark rounded-xl p-5 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm opacity-70">{stat.label}</div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass dark:glass-dark rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold mb-4">Performance History</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                stroke="currentColor"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="currentColor" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                }}
                labelFormatter={(ts) => new Date(ts).toLocaleString()}
                formatter={(value: number) => formatTime(value)}
              />
              <Line
                type="monotone"
                dataKey="time"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
