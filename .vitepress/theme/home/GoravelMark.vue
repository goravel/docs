<script setup lang="ts">
import { computed, useId } from 'vue'
import { LAYERS, type LayerKey, type StopKey, type View } from './content'

const props = defineProps<{ view: View; scale: number }>()
const emit = defineEmits<{ select: [LayerKey] }>()
const clipId = useId()

// back to front; face is the side of the cube a piece lies on
const PIECES: { key: LayerKey; face: number; d: string; pull: string; leader?: string }[] = [
  { key: 'http', face: 0, d: 'M133 0.4 L266 77.2 L221.7 102.8 L88.7 26 Z', pull: 'translate(0, -76.8px)', leader: 'M217.2 74.6 L217.2 -2.2' },
  { key: 'data', face: 1, d: 'M266 77.2 L266 230.8 L133 307.6 L133 256.4 L221.7 205.2 L221.7 102.8 Z', pull: 'translate(39.9px, 23px)', leader: 'M243.8 131 L283.7 154' },
  { key: 'async', face: 2, d: 'M0 77.2 L44.3 102.8 L44.3 205.2 L133 256.4 L133 307.6 L0 230.8 Z', pull: 'translate(-39.9px, 23px)', leader: 'M22.2 131 L-17.7 154' },
  { key: 'app', face: 0, d: 'M44.3 51.6 L177.3 128.4 L133 154 L0 77.2 Z', pull: 'translate(0, -38.4px)', leader: 'M128.6 125.8 L128.6 87.4' },
  { key: 'core', face: 1, d: 'M177.3 128.4 L177.3 179.6 L133 205.2 L133 154 Z', pull: 'none' }
]

// along: the share of the main line behind the request
const STOPS: Record<StopKey, { x: number; y: number; along: number }> = {
  route: { x: 110.8, y: 64.4, along: 0.234 },
  mw: { x: 159.6, y: 92.6, along: 0.351 },
  ctrl: { x: 199.5, y: 115.6, along: 0.447 },
  svc: { x: 155.2, y: 166.8, along: 0.606 },
  orm: { x: 243.8, y: 115.6, along: 0.819 },
  event: { x: 22.2, y: 166.8, along: 0.606 },
  resp: { x: 319.2, y: 72.1, along: 1 }
}

const SHADES = ['#ffffff', '#f7f9fa', '#e5eaed']

const interactive = computed(() => props.view.kind === 'map')
const stop = computed(() => props.view.stop && STOPS[props.view.stop])
const shade = (face: number) => SHADES[(face + (props.view.turn ?? 0)) % 3]
const nameOf = (key: LayerKey) => LAYERS.find((l) => l.key === key)!.name
</script>

<template>
  <svg
    class="g-mark"
    viewBox="-89.2 -50.4 444.4 408.9"
    :width="444.4 * scale"
    :style="{ '--turn': view.turn ?? 0 }"
    role="img"
    :aria-label="view.caption"
  >
    <clipPath :id="clipId">
      <path d="M133 -84.1 L339.1 35 L339.1 273 L133 392.1 L-73.2 273 L-73.2 35 Z" />
    </clipPath>
    <path
      class="g-mark-lattice"
      :clip-path="`url(#${clipId})`"
      d="M-88.7 -50.4V358.4M-44.3 -50.4V358.4M0 -50.4V358.4M44.3 -50.4V358.4M88.7 -50.4V358.4M133 -50.4V358.4
         M177.3 -50.4V358.4M221.7 -50.4V358.4M266 -50.4V358.4M310.3 -50.4V358.4M354.7 -50.4V358.4
         M-89.2 -281.5L355.2 -24.9M-89.2 -230.3L355.2 26.3M-89.2 -179.1L355.2 77.5M-89.2 -127.9L355.2 128.7
         M-89.2 -76.7L355.2 179.9M-89.2 -25.5L355.2 231.1M-89.2 25.7L355.2 282.3M-89.2 76.9L355.2 333.5
         M-89.2 128.1L355.2 384.7M-89.2 179.3L355.2 435.9M-89.2 230.5L355.2 487.1M-89.2 281.7L355.2 538.3
         M-89.2 332.9L355.2 589.5M-89.2 -24.9L355.2 -281.5M-89.2 26.3L355.2 -230.3M-89.2 77.5L355.2 -179.1
         M-89.2 128.7L355.2 -127.9M-89.2 179.9L355.2 -76.7M-89.2 231.1L355.2 -25.5M-89.2 282.3L355.2 25.7
         M-89.2 333.5L355.2 76.9M-89.2 384.7L355.2 128.1M-89.2 435.9L355.2 179.3M-89.2 487.1L355.2 230.5
         M-89.2 538.3L355.2 281.7M-89.2 589.5L355.2 332.9"
    />

    <g class="g-mark-spin">
      <g
        v-for="piece in PIECES"
        :key="piece.key"
        class="g-piece"
        :class="{ 'is-pulled': view.pulled === piece.key, 'is-hit': interactive }"
        :style="{ '--pull': piece.pull }"
        :tabindex="interactive ? 0 : undefined"
        :role="interactive ? 'button' : undefined"
        :aria-label="interactive ? nameOf(piece.key) : undefined"
        :aria-pressed="interactive ? view.states[piece.key] === 'active' : undefined"
        @click="interactive && emit('select', piece.key)"
        @keydown.enter.space.prevent="interactive && emit('select', piece.key)"
      >
        <path
          class="g-face"
          :class="`is-${view.states[piece.key] ?? 'solid'}`"
          :style="{ '--face': shade(piece.face) }"
          :d="piece.d"
        />
      </g>
    </g>

    <template v-for="piece in PIECES" :key="piece.key">
      <path v-if="piece.leader" class="g-leader" :class="{ 'is-on': view.pulled === piece.key }" :d="piece.leader" />
    </template>

    <g class="g-request" :class="{ 'is-on': stop }">
      <path class="g-track" d="M13.3 8.1 L199.5 115.6 L199.5 141.2 L155.2 166.8 L243.8 115.6 L319.2 72.1" />
      <path class="g-track" d="M155.2 166.8 L133 179.6 L133 230.8 L22.2 166.8" />
      <path
        class="g-track is-done"
        pathLength="1"
        :style="{ '--ahead': view.stop === 'event' || view.stop === 'resp' ? 0 : 1 }"
        d="M155.2 166.8 L133 179.6 L133 230.8 L22.2 166.8"
      />
      <path
        class="g-track is-done"
        pathLength="1"
        :style="{ '--ahead': 1 - (stop?.along ?? 0) }"
        d="M13.3 8.1 L199.5 115.6 L199.5 141.2 L155.2 166.8 L243.8 115.6 L319.2 72.1"
      />
      <path class="g-node" d="M13.3 3.1 L17.6 8.1 L13.3 13.1 L9 8.1 Z" />
      <g v-if="stop" class="g-head" :style="{ transform: `translate(${stop.x}px, ${stop.y}px)` }">
        <path class="g-signal-halo" d="M0 -16.7 L14.4 0 L0 16.7 L-14.4 0 Z" />
        <path class="g-signal-core" d="M0 -8.9 L7.7 0 L0 8.9 L-7.7 0 Z" />
      </g>
      <text class="g-mono-ink" x="8.9" y="-11.9">GET /tasks</text>
      <text class="g-mono-grey" :class="{ 'is-lit': view.stop === 'resp' }" text-anchor="end" x="325.9" y="49.9">200 OK</text>
    </g>
  </svg>
</template>
