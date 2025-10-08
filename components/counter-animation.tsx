"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface CounterAnimationProps {
  value: number
  duration?: number
}

export function CounterAnimation({ value, duration = 2000 }: CounterAnimationProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * value))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="font-mono text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
    >
      {count.toLocaleString()}
    </motion.span>
  )
}

