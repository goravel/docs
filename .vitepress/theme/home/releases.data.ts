import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineLoader } from 'vitepress'

export interface Release {
  version: string
  go: string
  from: string
  until: string
  fromText: string
  untilText: string
  planned: boolean
}

declare const data: { releases: Release[]; now: string }
export { data }

const file = fileURLToPath(new URL('../../../en/prologue/releases.md', import.meta.url))
const QUARTER: Record<string, string> = { Q1: '01-01', Q2: '04-01', Q3: '07-01', Q4: '10-01' }

function day(text: string) {
  const quarter = text.match(/^(Q[1-4]), (\d{4})$/)
  return quarter ? `${quarter[2]}-${QUARTER[quarter[1]]}` : new Date(`${text} UTC`).toISOString().slice(0, 10)
}

export default defineLoader({
  watch: [file],
  async load() {
    const rows = (await readFile(file, 'utf8')).split('\n').filter((line) => /^\|\s*\d/.test(line))
    const releases = rows.map((row) => {
      const [version, go, from, until] = row.split('|').slice(1, 5).map((cell) => cell.trim())
      return { version, go, from: day(from), until: day(until), fromText: from, untilText: until, planned: from.startsWith('Q') }
    })
    return { releases, now: new Date().toISOString().slice(0, 10) }
  }
})
