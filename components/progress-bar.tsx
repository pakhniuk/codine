"use client"

import { motion } from "framer-motion"

interface ProgressBarProps {
  value: number
  max?: number
}

export function ProgressBar({ value, max = 1000000 }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="w-full max-w-2xl">
      <div className="h-4 bg-secondary rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </div>
      <p className="text-sm text-muted-foreground mt-2 text-center">
        {percentage.toFixed(1)}% of a million lines!
      </p>
    </div>
  )
}

