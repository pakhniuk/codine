import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { Octokit } from "@octokit/rest"
import pLimit from "p-limit"

// --- CONFIG ---
const MAX_REPOS = 100
const CONCURRENCY_LIMIT = 3
const MAX_COMMITS_PER_REPO = 500
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// --- CACHE ---
interface CacheEntry {
  data: any
  timestamp: number
}

const cache = new Map<string, CacheEntry>()

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const octokit = new Octokit({ auth: session.accessToken })
    const { data: user } = await octokit.users.getAuthenticated()

    // Check for force refresh
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Check cache
    const cacheKey = `stats:${user.login}`
    const cached = cache.get(cacheKey)
    
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log(`✨ Cache hit for ${user.login} (age: ${Math.round((Date.now() - cached.timestamp) / 1000 / 60)}m)`)
      return NextResponse.json({
        ...cached.data,
        cached: true,
        cacheAge: Date.now() - cached.timestamp,
      })
    }

    if (forceRefresh) {
      console.log(`🔄 Force refresh for ${user.login}`)
    } else {
      console.log(`🔄 Cache miss for ${user.login}, fetching fresh data...`)
    }

    // Get all user repositories
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: "updated",
    })

    if (!repos || repos.length === 0) {
      const result = {
        username: user.login,
        totalAdditions: 0,
        totalDeletions: 0,
        netLines: 0,
        reposAnalyzed: 0,
        reposSkipped: 0,
        totalRepos: 0,
        repositories: [],
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(result)
    }

    const limit = pLimit(CONCURRENCY_LIMIT)

    async function fetchAllTimeStats(repo: any) {
      try {
        console.log(`📊 Fetching all commits for ${repo.name}...`)
        
        let totalFetched = 0
        const allCommits = await octokit.paginate(
          octokit.repos.listCommits,
          {
            owner: repo.owner.login,
            repo: repo.name,
            per_page: 100,
          },
          (response, done) => {
            totalFetched += response.data.length
            if (totalFetched >= MAX_COMMITS_PER_REPO) {
              done()
            }
            return response.data
          }
        )

        if (allCommits.length === 0) {
          return { additions: 0, deletions: 0, commits: 0 }
        }

        const userCommits = allCommits.filter((commit) => {
          const author = commit.author?.login?.toLowerCase()
          const committer = commit.committer?.login?.toLowerCase()
          const authorEmail = commit.commit.author?.email?.toLowerCase()
          const committerEmail = commit.commit.committer?.email?.toLowerCase()
          const targetUser = user.login.toLowerCase()
          
          return (
            author === targetUser ||
            committer === targetUser ||
            authorEmail?.includes(targetUser) ||
            committerEmail?.includes(targetUser)
          )
        })

        if (userCommits.length === 0) {
          console.log(`➖ ${repo.name}: no commits`)
          return { additions: 0, deletions: 0, commits: 0 }
        }

        console.log(`🔍 Processing ${userCommits.length} commits for ${repo.name}...`)

        let totalAdditions = 0
        let totalDeletions = 0
        let processedCommits = 0

        const batchSize = 10
        for (let i = 0; i < userCommits.length; i += batchSize) {
          const batch = userCommits.slice(i, Math.min(i + batchSize, userCommits.length))
          
          const batchPromises = batch.map(async (commit) => {
            try {
              const { data: commitData } = await octokit.repos.getCommit({
                owner: repo.owner.login,
                repo: repo.name,
                ref: commit.sha,
              })

              if (commitData.stats) {
                return {
                  additions: commitData.stats.additions || 0,
                  deletions: commitData.stats.deletions || 0,
                }
              }
            } catch {
              // Ignore errors for individual commits
            }
            return { additions: 0, deletions: 0 }
          })

          const batchResults = await Promise.all(batchPromises)
          batchResults.forEach((result) => {
            totalAdditions += result.additions
            totalDeletions += result.deletions
            processedCommits++
          })
        }

        console.log(
          `✅ ${repo.name}: +${totalAdditions} -${totalDeletions} | ${processedCommits} commits processed`
        )

        return { additions: totalAdditions, deletions: totalDeletions, commits: processedCommits }
      } catch (error: any) {
        console.log(`⚠️  Error fetching ${repo.name}: ${error.message || error}`)
        return { additions: 0, deletions: 0, commits: 0 }
      }
    }

    // Process repositories in parallel with concurrency limit
    const repoPromises = repos.slice(0, MAX_REPOS).map((repo) =>
      limit(async () => {
        const result = await fetchAllTimeStats(repo)

        return {
          name: repo.name,
          additions: result.additions,
          deletions: result.deletions,
          commits: result.commits,
          skipped: result.commits === 0 && result.additions === 0,
          url: repo.html_url,
        }
      })
    )

    const results = await Promise.all(repoPromises)

    // Sum up all results
    let totalAdditions = 0
    let totalDeletions = 0
    let reposProcessed = 0
    let reposSkipped = 0

    const repoDetails: Array<{
      name: string
      additions: number
      deletions: number
      netLines: number
      commits: number
      skipped: boolean
      url: string
    }> = []

    results.forEach((result) => {
      if (result) {
        repoDetails.push({
          name: result.name,
          additions: result.additions,
          deletions: result.deletions,
          netLines: result.additions - result.deletions,
          commits: result.commits,
          skipped: result.skipped,
          url: result.url
        })

        if (result.skipped) {
          reposSkipped++
        } else {
          totalAdditions += result.additions
          totalDeletions += result.deletions
          reposProcessed++
        }
      }
    })

    repoDetails.sort((a, b) => b.additions - a.additions)

    const totalRepos = Math.min(repos.length, MAX_REPOS)
    
    console.log(
      `\n📊 FINAL: +${totalAdditions} -${totalDeletions} | Repos: ${reposProcessed} | Skipped: ${reposSkipped}\n`
    )

    const result = {
      username: user.login,
      totalAdditions,
      totalDeletions,
      netLines: totalAdditions - totalDeletions,
      reposAnalyzed: reposProcessed,
      reposSkipped,
      totalRepos,
      repositories: repoDetails,
      timestamp: new Date().toISOString(),
      cached: false,
    }

    // Store in cache
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    })

    console.log(`💾 Cached results for ${user.login}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching GitHub stats:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch GitHub stats",
      },
      { status: 500 }
    )
  }
}
