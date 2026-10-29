/**
 * Read-only GitHub public repository proxy; no GitHub token needed for public data.
 * Filter by explicit featured repository names; fallback to recent only when no selection set.
 * Input validation prevents arbitrary upstream URLs.
 */
import { githubFeaturedRepositories } from '~/data/portfolio'

interface GitHubRepository {
  id: number; name: string; description: string | null; html_url: string
  language: string | null; stargazers_count: number; fork: boolean
  archived: boolean; pushed_at: string | null
}
export default defineEventHandler(async (event) => {
  const username = String(getQuery(event).username ?? '').trim()
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid GitHub username' })
  }
  try {
    const repos = await $fetch<GitHubRepository[]>(`https://api.github.com/users/${encodeURIComponent(username)}/repos`, {
      query: { sort: 'pushed', direction: 'desc', per_page: 100, type: 'owner' },
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'my-little-world-portfolio' },
      timeout: 8000,
    })
    const publicRepos = repos.filter(repo => !repo.fork && !repo.archived)
    const chosen = githubFeaturedRepositories.length
      ? githubFeaturedRepositories.map(name => publicRepos.find(repo => repo.name.toLowerCase() === name.toLowerCase())).filter((repo): repo is GitHubRepository => Boolean(repo))
      : publicRepos.slice(0, 4)
    const missingFeatured = githubFeaturedRepositories.filter(name => !chosen.some(repo => repo.name.toLowerCase() === name.toLowerCase()))
    setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=600')
    return {
      username, missingFeatured,
      items: chosen.map(repo => ({
        id: repo.id, name: repo.name, description: repo.description, url: repo.html_url,
        language: repo.language, stars: repo.stargazers_count, updatedAt: repo.pushed_at,
      })),
    }
  } catch (error: any) {
    const status = error?.response?.status || error?.statusCode
    throw createError({ statusCode: status === 404 ? 404 : 503,
      statusMessage: status === 404 ? 'GitHub user not found' : 'GitHub API unavailable or rate-limited' })
  }
})
