import { defineLoader } from 'vitepress'

export interface GitHubNumbers {
  stars: number
}

declare const data: GitHubNumbers
export { data }

// used only when the build cannot reach GitHub
const SAVED: GitHubNumbers = { stars: 4835 }

async function github<T>(path: string): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const res = await fetch(`https://api.github.com/${path}`, { headers, signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`${path} answered ${res.status}`)
  return res.json() as Promise<T>
}

// read when the site is built; the page shows these until the visitor's browser has live ones
export default defineLoader({
  async load(): Promise<GitHubNumbers> {
    try {
      const repo = await github<{ stargazers_count: number }>('repos/goravel/goravel')
      return { stars: repo.stargazers_count }
    } catch (e) {
      console.warn(`GitHub numbers unavailable, using the saved ones: ${(e as Error).message}`)
      return SAVED
    }
  }
})
