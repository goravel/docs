<script setup lang="ts">
/**
 * The stage: one mark, held beside the page while the page scrolls past it.
 *
 * It never remounts. Whatever the block in view asks for, the same five pieces move to it: a piece
 * lights, the whole thing turns a third of a turn, a piece pulls out of the mark, a piece appears.
 * The request is one path drawn along the mark, revealed to the stop in view.
 */
import { computed } from 'vue'
import GoravelMark from './GoravelMark.vue'
import { ANCHOR, MOVES, type View } from './content'
import { Iso, cellPath, polyline, polylineLength, requestPath, type LayerKey } from './geometry'

const props = defineProps<{ view: View; width: number; height: number; scale: number }>()
const emit = defineEmits<{ select: [LayerKey] }>()

const g = computed(
  () => new Iso(props.scale, props.width / 2 - 133 * props.scale, props.height / 2 - 154 * props.scale)
)

function delta(a: number, b: number, c: number): [number, number] {
  const [x0, y0] = g.value.p(0, 0, 0)
  const [x1, y1] = g.value.p(a, b, c)
  return [x1 - x0, y1 - y0]
}

const moves = computed(() => {
  const out: Partial<Record<LayerKey, [number, number]>> = {}
  for (const k of ['http', 'app', 'core', 'data', 'async'] as LayerKey[]) {
    const m = props.view.moves?.[k]
    out[k] = m ? delta(...m) : [0, 0]
  }
  return out
})

/** The route through the mark, and how far along it each stop sits. */
const route = computed(() => {
  const p = requestPath(g.value)
  const main: [number, number][] = [p.entry, p.channel, p.drop, p.core, p.data, p.exit]
  const branch: [number, number][] = [p.core, p.front, p.fall, p.async]
  const at = (i: number) => polylineLength(main.slice(0, i + 1))
  const partial = (pt: [number, number]) => polylineLength([p.entry, pt])
  return {
    p,
    main,
    branch,
    mainD: polyline(main),
    branchD: polyline(branch),
    mainLen: polylineLength(main),
    branchLen: polylineLength(branch),
    reach: {
      route: partial(g.value.p(1.0, 1.5, 3)),
      mw: partial(g.value.p(2.1, 1.5, 3)),
      ctrl: at(1),
      svc: at(3),
      orm: at(4),
      event: at(3),
      resp: at(5)
    } as Record<string, number>,
    head: {
      route: g.value.p(1.0, 1.5, 3),
      mw: g.value.p(2.1, 1.5, 3),
      ctrl: p.channel,
      svc: p.core,
      orm: p.data,
      event: p.async,
      resp: p.exit
    } as Record<string, [number, number]>
  }
})

const isJourney = computed(() => props.view.kind === 'journey')
const stop = computed(() => props.view.stop)

/** How much of the route is behind the request, as a dash offset. */
const mainOffset = computed(() => {
  const r = route.value
  if (props.view.kind === 'hero') return r.mainLen - r.reach.svc
  if (!isJourney.value || !stop.value) return r.mainLen
  return r.mainLen - r.reach[stop.value]
})

const branchOffset = computed(() => {
  const r = route.value
  if (!isJourney.value || !stop.value) return r.branchLen
  return stop.value === 'event' || stop.value === 'resp' ? 0 : r.branchLen
})

const headAt = computed<[number, number]>(() => {
  const r = route.value
  if (props.view.kind === 'hero') return r.p.core
  if (isJourney.value && stop.value) return r.head[stop.value]
  return r.p.core
})

const showRequest = computed(() => props.view.kind === 'hero' || isJourney.value)

/** A dashed leader from where a piece sits to where it has been pulled out to. */
const leaders = computed(() => {
  if (props.view.kind !== 'map') return []
  return (Object.keys(MOVES) as LayerKey[])
    .filter((k) => props.view.moves?.[k])
    .map((k) => {
      const [ax, ay] = g.value.p(...ANCHOR[k])
      const [dx, dy] = moves.value[k]!
      return `M${ax.toFixed(1)} ${ay.toFixed(1)} L${(ax + dx).toFixed(1)} ${(ay + dy).toFixed(1)}`
    })
})
</script>

<template>
  <div class="g-stage-inner">
    <GoravelMark
      :width="width"
      :height="height"
      :scale="scale"
      lattice
      :states="view.states"
      :labels="view.labels"
      :moves="moves"
      :turn="view.turn || 0"
      :interactive="view.kind === 'map'"
      :title="view.caption"
      @select="emit('select', $event)"
    >
      <template #default>
        <g class="g-leaders" :class="{ 'is-on': leaders.length }">
          <path v-for="(d, i) in leaders" :key="i" :d="d" class="g-leader" />
        </g>

        <g class="g-request" :class="{ 'is-on': showRequest }">
          <path class="g-track is-next" :d="route.mainD" />
          <path class="g-track is-next" :d="route.branchD" />

          <path
            class="g-track is-done g-run"
            :d="route.branchD"
            :style="{ '--len': route.branchLen, '--off': branchOffset }"
          />
          <path
            class="g-track is-done g-run"
            :d="route.mainD"
            :style="{ '--len': route.mainLen, '--off': mainOffset }"
          />

          <path class="g-node is-done" :d="cellPath(route.p.entry[0], route.p.entry[1], 4.5)" />

          <g class="g-head" :style="{ transform: `translate(${headAt[0]}px, ${headAt[1]}px)` }">
            <path class="g-signal-halo" :d="cellPath(0, 0, 15)" />
            <path class="g-signal-core" :d="cellPath(0, 0, 8)" />
          </g>

          <text class="g-mono-ink" :x="route.p.entry[0] - 4" :y="route.p.entry[1] - 18">GET /tasks</text>
          <text
            class="g-mono-grey"
            :class="{ 'is-lit': stop === 'resp' }"
            text-anchor="end"
            :x="route.p.exit[0] + 6"
            :y="route.p.exit[1] - 20"
          >200 OK</text>
        </g>
      </template>
    </GoravelMark>

    <p v-if="view.meta" class="g-stage-meta g-meta">{{ view.meta }}</p>
  </div>
</template>
