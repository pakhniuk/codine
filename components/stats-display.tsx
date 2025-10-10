"use client"

import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import { motion } from "framer-motion"
import { CounterAnimation } from "./counter-animation"
import { LoadingAnimation } from "./loading-animation"
import { ProgressBar } from "./progress-bar"

interface Repository {
  name: string
  additions: number
  deletions: number
  netLines: number
  commits: number
  skipped: boolean
  url: string
}

interface GitHubStats {
  username: string
  totalAdditions: number
  totalDeletions: number
  netLines: number
  reposAnalyzed: number
  reposSkipped: number
  totalRepos: number
  repositories: Repository[]
  timestamp: string
  cached?: boolean
  cacheAge?: number
}

export function StatsDisplay() {
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchStats(forceRefresh = false) {
    try {
      setLoading(true)
      const url = forceRefresh ? "/api/github-stats?refresh=true" : "/api/github-stats"
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to fetch stats")
      }
      const data = await response.json()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await fetchStats(true)
  }

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

      <CounterAnimation value={stats.totalAdditions} />

              <div className="text-center space-y-2">
                <p className="text-3xl font-bold">lines of code!</p>
                <p className="text-muted-foreground">
                  Analyzed {stats.reposAnalyzed} of {stats.totalRepos} repositories
                  {stats.reposSkipped > 0 && (
                    <span className="text-yellow-600"> ({stats.reposSkipped} skipped)</span>
                  )}
                  <br />
                  {stats.cached && stats.cacheAge && (
                    <span className="text-xs text-blue-600">
                      💾 Cached {Math.round(stats.cacheAge / 1000 / 60)} minutes ago
                      {" • "}
                      Expires in {60 - Math.round(stats.cacheAge / 1000 / 60)} minutes
                    </span>
                  )}
                  {!stats.cached && (
                    <span className="text-xs text-green-600">✨ Fresh data • Valid for 1 hour</span>
                  )}
                </p>
              </div>

      <ProgressBar value={stats.totalAdditions} />

      <div className="grid grid-cols-2 gap-6 mt-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card p-6 rounded-lg shadow-lg border border-border"
        >
          <p className="text-sm text-muted-foreground mb-2">Lines Added</p>
          <p className="text-3xl font-bold text-green-600">
            +{stats.totalAdditions.toLocaleString()}
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
            -{stats.totalDeletions.toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Repository Details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-4xl mt-8"
      >
        <details className="bg-card rounded-lg border border-border p-4">
          <summary className="cursor-pointer font-semibold text-lg mb-2">
            📊 Repository Details ({stats.repositories.length})
          </summary>
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {stats.repositories.map((repo, index) => (
              <div
                key={repo.name}
                className="flex items-center justify-between p-3 bg-secondary rounded-md hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-muted-foreground text-sm w-8">#{index + 1}</span>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm hover:underline truncate flex-1"
                  >
                    {repo.name}
                  </a>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {repo.skipped ? (
                    <span className="text-yellow-600">⏭️ skipped</span>
                  ) : (
                    <>
                      <span className="text-green-600">+{repo.additions.toLocaleString()}</span>
                      <span className="text-red-600">-{repo.deletions.toLocaleString()}</span>
                      <span className="text-muted-foreground font-semibold min-w-[80px] text-right">
                        {repo.netLines > 0 ? '+' : ''}{repo.netLines.toLocaleString()}
                      </span>
                      {repo.commits > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({repo.commits} commits)
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      </motion.div>

              <div className="flex gap-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-full transition-colors text-sm font-medium text-white"
                >
                  {refreshing ? "Refreshing..." : "🔄 Refresh"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut()}
                  className="px-6 py-2 bg-secondary hover:bg-accent rounded-full transition-colors text-sm font-medium"
                >
                  Sign Out
                </motion.button>
              </div>
    </motion.div>
  )
}

