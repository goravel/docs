import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineLoader } from 'vitepress'
import { svgPathProperties } from 'svg-path-properties'

export interface Mark {
  pieces: { fill: string; d: string; at: { x: number; y: number } }[]
}

declare const data: Mark
export { data }

const logo = fileURLToPath(new URL('../../../public/logo.svg', import.meta.url))
const round = (n: number) => Math.round(n * 10) / 10

function bounds(d: string) {
  const path = new svgPathProperties(d)
  const points = Array.from({ length: 48 }, (_, i) => path.getPointAtLength((path.getTotalLength() * i) / 48))
  const [x, y] = [points.map((p) => p.x), points.map((p) => p.y)]
  return { x: round((Math.min(...x) + Math.max(...x)) / 2), y: round((Math.min(...y) + Math.max(...y)) / 2) }
}

export default defineLoader({
  watch: [logo],
  async load([file]): Promise<Mark> {
    const svg = await readFile(file ?? logo, 'utf8')
    const fills = new Map([...svg.matchAll(/\.(s\d+)\s*\{\s*fill:\s*(#[0-9a-f]+)/gi)].map((m) => [m[1], m[2]]))
    const pieces = [...svg.matchAll(/class="(s\d+)"\s+d="([^"]+)"/gi)].map((m) => ({
      fill: fills.get(m[1])!,
      d: m[2],
      at: bounds(m[2])
    }))
    return { pieces }
  }
})
