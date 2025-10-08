"use client"

import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import { motion } from "framer-motion"
import { CounterAnimation } from "./counter-animation"
import { LoadingAnimation } from "./loading-animation"
import { ProgressBar } from "./progress-bar"

interface GitHubStats {
  username: string
  totalLinesAdded: number
  totalLinesDeleted: number
  netLines: number
  reposAnalyzed: number
}

export function StatsDisplay() {
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/github-stats")
        if (!response.ok) {
          throw new Error("Failed to fetch stats")
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <LoadingAnimation />
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={() => signOut()}
          className="px-6 py-2 bg-secondary hover:bg-accent rounded-full transition-colors"
        >
          Sign Out
        </button>
      </div>
    )
  }

  if (!stats) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8 w-full"
    >
      <div className="text-center space-y-2">
        <p className="text-lg text-muted-foreground">
          Hey <span className="font-semibold text-foreground">@{stats.username}</span>! 👋
        </p>
        <p className="text-2xl font-semibold">You&apos;ve written</p>
      </div>

      <CounterAnimation value={stats.totalLinesAdded} />

      <div className="text-center space-y-2">
        <p className="text-3xl font-bold">lines of code!</p>
        <p className="text-muted-foreground">
          Analyzed {stats.reposAnalyzed} repositories
        </p>
      </div>

      <ProgressBar value={stats.totalLinesAdded} />

      <div className="grid grid-cols-2 gap-6 mt-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card p-6 rounded-lg shadow-lg border border-border"
        >
          <p className="text-sm text-muted-foreground mb-2">Lines Added</p>
          <p className="text-3xl font-bold text-green-600">
            +{stats.totalLinesAdded.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card p-6 rounded-lg shadow-lg border border-border"
        >
          <p className="text-sm text-muted-foreground mb-2">Lines Deleted</p>
          <p className="text-3xl font-bold text-red-600">
            -{stats.totalLinesDeleted.toLocaleString()}
          </p>
        </motion.div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => signOut()}
        className="mt-6 px-6 py-2 bg-secondary hover:bg-accent rounded-full transition-colors text-sm font-medium"
      >
        Sign Out
      </motion.button>
    </motion.div>
  )
}

