<script setup lang="ts">
import { computed } from 'vue'
import { Iso, LAYERS, PIECES, SHADE, faceOf, latticePath, type LayerKey, type PieceState } from './geometry'

const props = withDefaults(
  defineProps<{
    width: number
    height: number
    scale: number
    states?: Partial<Record<LayerKey, PieceState>>
    moves?: Partial<Record<LayerKey, [number, number]>>
    turn?: number
    interactive?: boolean
    title?: string
  }>(),
  { turn: 0, interactive: false, title: '' }
)

const emit = defineEmits<{ select: [LayerKey] }>()

const g = computed(
  () => new Iso(props.scale, props.width / 2 - 133 * props.scale, props.height / 2 - 154 * props.scale)
)

const latticeD = computed(() => latticePath(g.value, 0, props.width, 0, props.height))
const clipD = computed(() => g.value.hexagon(1.55))

// The lit piece is drawn last so its edge stays on top of its neighbours.
const DRAW_ORDER: LayerKey[] = ['http', 'data', 'async', 'app', 'core']

const pieces = computed(() =>
  DRAW_ORDER.map((key) => {
    const [dx, dy] = props.moves?.[key] ?? [0, 0]
    return {
      key,
      state: props.states?.[key] ?? 'solid',
      d: g.value.path(PIECES[key]),
      transform: `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`,
      fill: SHADE[faceOf(key, props.turn)],
      name: LAYERS.find((l) => l.key === key)!.name
    }
  })
)

const spin = computed(() => {
  const [cx, cy] = g.value.p(1.5, 1.5, 1.5)
  return `rotate(${props.turn * 120} ${cx.toFixed(1)} ${cy.toFixed(1)})`
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

    <g :clip-path="`url(#${uid}-hex)`" class="g-mark-lattice">
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

    <slot />
  </svg>
</template>
