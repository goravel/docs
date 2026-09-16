<script setup lang="ts">
/**
 * The mark. There is one of these on the homepage and it never unmounts: every piece is a single
 * path whose fill, stroke and position are driven by class and transform, so the mark moves
 * between states instead of being redrawn in them.
 */
import { computed } from 'vue'
import {
  Iso,
  LAYERS,
  PIECES,
  SHADE,
  faceOf,
  faceTransform,
  latticePath,
  type LayerKey,
  type PieceState
} from './geometry'

const props = withDefaults(
  defineProps<{
    width: number
    height: number
    scale: number
    states?: Partial<Record<LayerKey, PieceState>>
    moves?: Partial<Record<LayerKey, [number, number]>>
    turn?: number
    lattice?: boolean
    labels?: Partial<Record<LayerKey, string>>
    interactive?: boolean
    title?: string
  }>(),
  { turn: 0, lattice: false, interactive: false, title: '' }
)

const emit = defineEmits<{ select: [LayerKey] }>()

const g = computed(
  () => new Iso(props.scale, props.width / 2 - 133 * props.scale, props.height / 2 - 154 * props.scale)
)

const latticeD = computed(() => latticePath(g.value, 0, props.width, 0, props.height))
const clipD = computed(() => g.value.hexagon(1.55))

/** Where each piece prints its name, and the line of meta under it, on its own face. */
const TEXT_AT: Record<LayerKey, { name: [number, number, number]; meta: [number, number, number] }> = {
  http: { name: [0.26, 0.34, 3], meta: [0.26, 0.62, 3] },
  app: { name: [0.26, 2.34, 3], meta: [0.26, 2.62, 3] },
  data: { name: [3, 2.84, 0.72], meta: [3, 2.84, 0.44] },
  async: { name: [0.14, 3, 0.72], meta: [0.14, 3, 0.44] },
  core: { name: [3, 2.94, 2.12], meta: [3, 2.94, 1.82] }
}

// The lit piece is drawn last so its edge stays on top of its neighbours.
const DRAW_ORDER: LayerKey[] = ['http', 'data', 'async', 'app', 'core']

const pieces = computed(() =>
  DRAW_ORDER.map((key) => {
    const state = props.states?.[key] ?? 'solid'
    const [dx, dy] = props.moves?.[key] ?? [0, 0]
    const layer = LAYERS.find((l) => l.key === key)!
    const at = TEXT_AT[key]
    const face = faceOf(key, props.turn)
    const meta = props.labels?.[key]
    const [nx, ny] = g.value.p(...at.name)
    const [mx, my] = g.value.p(...at.meta)
    return {
      key,
      state,
      d: g.value.path(PIECES[key]),
      transform: `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`,
      fill: SHADE[face],
      name: layer.name,
      showText: meta !== undefined,
      meta: meta || '',
      nameTransform: faceTransform(face, nx, ny),
      metaTransform: faceTransform(face, mx, my)
    }
  })
)

/**
 * A third of a turn on screen is exactly a turn of the object about the line of sight: it maps
 * (a, b, c) to (c, a, b). Rotating the drawing 120k degrees about the mark's centre and re-shading
 * the faces is an honest rotation, not a trick.
 */
const spin = computed(() => {
  const [cx, cy] = g.value.p(1.5, 1.5, 1.5)
  return `rotate(${(props.turn || 0) * 120} ${cx.toFixed(1)} ${cy.toFixed(1)})`
})

const uid = `mark-${Math.random().toString(36).slice(2, 8)}`
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    class="g-mark"
    :class="{ 'is-interactive': interactive }"
    :role="title ? 'img' : 'presentation'"
    :aria-label="title || undefined"
  >
    <defs>
      <clipPath :id="`${uid}-hex`"><path :d="clipD" /></clipPath>
    </defs>

    <g :clip-path="`url(#${uid}-hex)`" class="g-mark-lattice" :class="{ 'is-on': lattice }">
      <path :d="latticeD" fill="none" stroke="var(--g-line)" stroke-width="1" />
    </g>

    <g class="g-mark-spin" :transform="spin">
      <g
        v-for="p in pieces"
        :key="p.key"
        class="g-piece"
        :class="[`is-${p.state}`, { 'is-hit': interactive }]"
        :transform="p.transform"
        :tabindex="interactive ? 0 : undefined"
        :role="interactive ? 'button' : undefined"
        :aria-label="interactive ? p.name : undefined"
        :aria-pressed="interactive ? p.state === 'active' : undefined"
        @click="interactive && emit('select', p.key)"
        @keydown.enter.prevent="interactive && emit('select', p.key)"
        @keydown.space.prevent="interactive && emit('select', p.key)"
      >
        <path :d="p.d" class="g-face" :class="`is-${p.state}`" :style="{ '--face': p.fill }" />
      </g>
    </g>

    <slot :g="g" />
  </svg>
</template>
