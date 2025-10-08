"use client"

import { motion } from "framer-motion"

export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-4 h-4 bg-purple-600 rounded-full"
            animate={{
              y: [-10, 10, -10],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
      <motion.p
        className="text-lg text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Analyzing your GitHub contributions...
      </motion.p>
    </div>
  )
}

