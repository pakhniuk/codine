import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { Octokit } from "@octokit/rest"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const octokit = new Octokit({
      auth: session.accessToken
    })

    // Get authenticated user
    const { data: user } = await octokit.users.getAuthenticated()
    
    // Get all repositories
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: "updated"
    })

    let totalLinesAdded = 0
    let totalLinesDeleted = 0
    let processedRepos = 0
    const maxRepos = 50 // Limit to prevent timeout

    // Process repositories in parallel batches
    const repoPromises = repos.slice(0, maxRepos).map(async (repo) => {
      try {
        // Get all commits by the user in this repo
        const { data: commits } = await octokit.repos.listCommits({
          owner: repo.owner.login,
          repo: repo.name,
          author: user.login,
          per_page: 100
        })

        let repoAdded = 0
        let repoDeleted = 0

        // Process commits in smaller batches to avoid rate limits
        for (const commit of commits.slice(0, 30)) {
          try {
            const { data: commitData } = await octokit.repos.getCommit({
              owner: repo.owner.login,
              repo: repo.name,
              ref: commit.sha
            })

            if (commitData.stats) {
              repoAdded += commitData.stats.additions
              repoDeleted += commitData.stats.deletions
            }
          } catch (error) {
            // Skip commits that fail (e.g., too large)
            console.log(`Skipping commit ${commit.sha}`)
          }
        }

        return { added: repoAdded, deleted: repoDeleted }
      } catch (error) {
        // Skip repos that fail
        console.log(`Skipping repo ${repo.name}`)
        return { added: 0, deleted: 0 }
      }
    })

    const results = await Promise.all(repoPromises)
    
    results.forEach(result => {
      totalLinesAdded += result.added
      totalLinesDeleted += result.deleted
    })

    return NextResponse.json({
      username: user.login,
      totalLinesAdded,
      totalLinesDeleted,
      netLines: totalLinesAdded - totalLinesDeleted,
      reposAnalyzed: Math.min(repos.length, maxRepos)
    })

  } catch (error: any) {
    console.error("Error fetching GitHub stats:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch GitHub stats" },
      { status: 500 }
    )
  }
}

