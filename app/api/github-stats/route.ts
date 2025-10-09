import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { Octokit } from "@octokit/rest"
import pLimit from "p-limit"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const octokit = new Octokit({ auth: session.accessToken })
    const { data: user } = await octokit.users.getAuthenticated()

    // Get all user repositories
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: "updated",
    })

    // --- CONFIG ---
    const maxRepos = 100 // safe limit
    const concurrencyLimit = 5
    const limit = pLimit(concurrencyLimit)

    let totalAdditions = 0
    let totalDeletions = 0
    let reposProcessed = 0

    // --- PROCESS REPOS IN PARALLEL (LIMITED) ---
    const repoPromises = repos.slice(0, maxRepos).map((repo) =>
      limit(async () => {
        try {
          const { data: stats } = await octokit.repos.getContributorsStats({
            owner: repo.owner.login,
            repo: repo.name,
          })

          // GitHub sometimes returns null if stats are being generated
          if (!stats || !Array.isArray(stats)) {
            console.log(`Stats not ready for ${repo.name}, skipping.`)
            return
          }

          // Find current user's contribution
          const userStats = stats.find(
            (c) => c.author?.login?.toLowerCase() === user.login.toLowerCase()
          )

          if (userStats && userStats.weeks) {
            const repoAdditions = userStats.weeks.reduce((sum, w) => sum + (w.a || 0), 0)
            const repoDeletions = userStats.weeks.reduce((sum, w) => sum + (w.d || 0), 0)
            totalAdditions += repoAdditions
            totalDeletions += repoDeletions
            reposProcessed++
          }
        } catch (error) {
          console.log(`Error processing ${repo.name}:`, error)
        }
      })
    )

    await Promise.all(repoPromises)

    return NextResponse.json({
      username: user.login,
      totalAdditions,
      totalDeletions,
      netLines: totalAdditions - totalDeletions,
      reposAnalyzed: reposProcessed,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching GitHub stats:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch GitHub stats",
      },
      { status: 500 }
    )
  }
}
