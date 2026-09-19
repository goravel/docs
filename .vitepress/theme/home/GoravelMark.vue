<script setup lang="ts">
import { computed, useId } from 'vue'
import { Motion, MotionConfig } from 'motion-v'
import type { PieceKey, PieceState } from './config'
import { data as mark } from './mark.data'

const props = defineProps<{
  states: Partial<Record<PieceKey, PieceState>>
  pulled?: PieceKey[]
  scale: number
  caption: string
}>()

const CELL = { w: 44.3, h: 25.6 }
const TOP = { x: 133, y: 0.4 }
const VIEW = { x: -89.2, y: -50.4, w: 444.4, h: 408.9 }
const CUBE = [[0, 0], [3, 3], [3, 9], [0, 12], [-3, 9], [-3, 3]]
const HALO = 1.55
const ORDER: PieceKey[] = ['core', 'data', 'async', 'app', 'http']
const PULL: Record<PieceKey, [number, number]> = {
  core: [0, 0],
  data: [0.9, 0.9],
  async: [-0.9, 0.9],
  app: [0, -1.5],
  http: [0, -3]
}
const SPRING = { type: 'spring' as const, stiffness: 240, damping: 26 }

const clipId = useId()
const halo = CUBE.map(([u, v], i) => `${i ? 'L' : 'M'}${TOP.x + u * HALO * CELL.w} ${TOP.y + ((v - 6) * HALO + 6) * CELL.h}`).join(' ')

const pieces = mark.pieces.map((piece, i) => ({
  ...piece,
  key: ORDER[i],
  pull: { x: PULL[ORDER[i]][0] * CELL.w, y: PULL[ORDER[i]][1] * CELL.h }
}))

const lattice = computed(() => {
  const [right, bottom] = [VIEW.x + VIEW.w, VIEW.y + VIEW.h]
  const rise = (VIEW.w * CELL.h) / CELL.w
  const lines = []
  for (let x = TOP.x - Math.ceil((TOP.x - VIEW.x) / CELL.w) * CELL.w; x <= right; x += CELL.w) {
    lines.push(`M${x} ${VIEW.y}V${bottom}`)
  }
  const reach = (TOP.x - VIEW.x) * (CELL.h / CELL.w)
  for (let y = TOP.y - reach - rise; y <= bottom + rise; y += CELL.h * 2) {
    lines.push(`M${VIEW.x} ${y}L${right} ${y + rise}`)
  }
  for (let y = TOP.y + reach - rise; y <= bottom + rise * 2; y += CELL.h * 2) {
    lines.push(`M${VIEW.x} ${y}L${right} ${y - rise}`)
  }
  return lines.join('')
})

const tint = (fill: string, amount: number) => {
  const value = parseInt(fill.slice(1), 16)
  const channel = (shift: number) => Math.round((((value >> shift) & 255) - 255) * amount + 255)
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`
}

const stateOf = (key: PieceKey) => props.states[key] ?? 'solid'
const isPulled = (key: PieceKey) => props.pulled?.includes(key) ?? false

function paint(piece: { key: PieceKey; fill: string }) {
  const state = stateOf(piece.key)
  return {
    fill: state === 'ghost' ? 'rgba(255, 255, 255, 0)' : state === 'dim' ? tint(piece.fill, 0.28) : piece.fill,
    stroke: `rgba(104, 116, 125, ${state === 'ghost' ? 0.55 : 0})`
  }
}
</script>

<template>
  <MotionConfig reduced-motion="user" :transition="{ duration: 0.28 }">
    <svg
      class="g-mark"
      :viewBox="`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`"
      :width="VIEW.w * scale"
      role="img"
      :aria-label="caption"
    >
      <clipPath :id="clipId"><path :d="`${halo}Z`" /></clipPath>
      <path class="g-mark-lattice" :clip-path="`url(#${clipId})`" :d="lattice" />

      <Motion
        v-for="piece in pieces"
        :key="`leader-${piece.key}`"
        as="path"
        class="g-leader"
        :d="`M${piece.at.x} ${piece.at.y}l${piece.pull.x} ${piece.pull.y}`"
        :initial="false"
        :animate="{ opacity: isPulled(piece.key) ? 1 : 0 }"
      />

      <Motion
        v-for="piece in pieces"
        :key="piece.key"
        as="g"
        :initial="false"
        :animate="{ x: isPulled(piece.key) ? piece.pull.x : 0, y: isPulled(piece.key) ? piece.pull.y : 0 }"
        :transition="SPRING"
      >
        <Motion
          as="path"
          class="g-face"
          :class="`is-${stateOf(piece.key)}`"
          :d="piece.d"
          :initial="false"
          :animate="paint(piece)"
        />
      </Motion>
    </svg>
  </MotionConfig>
</template>
