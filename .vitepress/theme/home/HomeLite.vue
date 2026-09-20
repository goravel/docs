<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  TransitionPresets,
  useIntersectionObserver,
  useIntervalFn,
  usePreferredReducedMotion,
  useTransition
} from '@vueuse/core'
import { useI18n } from '../i18n'
import GoravelMark from './GoravelMark.vue'
import { FACADES, LITE, PIECES, type PieceKey, type PieceState } from './config'

const { tr } = useI18n()
const TOTAL = Object.keys(FACADES).length
const LAST = LITE.steps.length - 1

const step = ref(0)
const added = (i: number) => LITE.steps.slice(1, i + 1).flatMap((s) => s.add)
const after = (i: number) => (i === LAST ? TOTAL : LITE.base.length + added(i).length)
const installed = computed(() => (step.value === LAST ? Object.keys(FACADES) : [...LITE.base, ...added(step.value)]))

const states = computed(() => {
  const out: Partial<Record<PieceKey, PieceState>> = {}
  for (const piece of PIECES) {
    const have = piece.facades.filter((f) => installed.value.includes(f)).length
    out[piece.key] = have === 0 ? 'ghost' : have < piece.facades.length ? 'dim' : 'solid'
  }
  return out
})
const pulled = computed(() => PIECES.filter((p) => states.value[p.key] === 'ghost').map((p) => p.key))
const caption = computed(() => `${installed.value.length} / ${TOTAL} ${tr('facades installed')}`)

const lite = ref<HTMLElement | null>(null)
const still = usePreferredReducedMotion()
const count = useTransition(() => installed.value.length, {
  duration: 450,
  transition: TransitionPresets.easeOutCubic,
  disabled: () => still.value === 'reduce'
})
const { pause, resume } = useIntervalFn(() => (step.value < LAST ? step.value++ : pause()), 1100, { immediate: false })
const { stop } = useIntersectionObserver(
  lite,
  ([entry]) => {
    if (!entry.isIntersecting || still.value === 'reduce') return
    resume()
    stop()
  },
  { threshold: 0.6 }
)

onMounted(() => {
  if (still.value === 'reduce') step.value = LAST
})

const pick = (i: number) => {
  pause()
  step.value = i
}
</script>

<template>
<section class="home-sec home-lite-sec">
  <div ref="lite" class="g-wrap home-lite">
    <div class="home-lite-figure">
      <GoravelMark :states="states" :pulled="pulled" :caption="caption" :scale="0.92" />
      <p class="g-count">
        <span class="n">{{ Math.round(count) }}</span><span class="muted"> / {{ TOTAL }}</span>
        <span class="g-body muted">{{ tr('facades installed') }}</span>
      </p>
    </div>

    <header class="home-lite-head">
      <h2 class="g-h2">{{ tr(LITE.title) }}</h2>
      <p class="g-lead">{{ tr(LITE.lead) }}</p>
    </header>

    <div class="home-lite-steps">
      <ol class="home-term" :aria-label="tr('Install steps')">
        <li v-for="(s, i) in LITE.steps" :key="s.cmd">
          <button
            type="button"
            class="home-term-row"
            :class="{ 'is-done': i < step, 'is-active': i === step }"
            :aria-current="i === step"
            @click="pick(i)"
          >
            <code>$ {{ s.cmd }}</code>
            <span class="home-term-n">{{ after(i) }}</span>
            <code v-if="s.pick" class="home-term-pick">&gt; {{ s.pick }}</code>
          </button>
        </li>
      </ol>
    </div>
  </div>
</section>
</template>

<style>
.g-home .g-count .n {
  display: inline-block;
  min-width: 2ch;
  text-align: right;
}

.home-lite {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-areas:
    'figure head'
    'figure steps';
}

.home-lite-figure {
  grid-area: figure;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding-right: 56px;
}

.home-lite-head,
.home-lite-steps {
  padding-left: 72px;
  border-left: 1px solid var(--g-line);
}

.home-lite-head {
  grid-area: head;
  margin-top: calc(var(--g-secpad) * -1);
  padding-top: var(--g-secpad);
}

.home-lite-head .g-lead {
  margin-top: 16px;
}

.home-lite-steps {
  grid-area: steps;
  margin-bottom: calc(var(--g-secpad) * -1);
  padding-top: 40px;
  padding-bottom: var(--g-secpad);
}

.home-term {
  margin: 0;
  padding: 10px 0;
  border: 1px solid var(--g-line);
  background: var(--g-soft);
  list-style: none;
}

.home-term-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: 16px;
  align-items: baseline;
  width: 100%;
  padding: 8px 18px;
  font-family: var(--vp-font-family-mono);
  font-size: 13.5px;
  line-height: 24px;
  text-align: left;
  color: var(--g-grey);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.home-term-row:hover,
.home-term-row.is-done,
.home-term-row.is-active {
  color: var(--g-ink);
}

.home-term-row.is-active {
  background: var(--g-cyan-tint);
}

.home-term-n {
  font-variant-numeric: tabular-nums;
  color: var(--g-grey);
}

.home-term-row.is-active .home-term-n {
  color: var(--g-cyan-text);
}

.home-term-pick {
  grid-column: 1 / -1;
  padding-left: 2ch;
  font-size: 13px;
  color: var(--g-grey);
}

@media (max-width: 900px) {
  .home-lite {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'head'
      'figure'
      'steps';
  }

  .home-lite-head,
    .home-lite-steps {
    margin: 0;
    padding: 0;
    border-left: 0;
  }

  .home-lite-figure {
    padding: 36px 0 28px;
  }

  .home-lite-figure .g-mark {
    width: min(100%, 260px);
    height: auto;
  }

  .home-lite-figure .g-count {
    gap: 10px;
    white-space: nowrap;
  }

  .home-lite-figure .g-count .n {
    font-size: 44px;
    line-height: 44px;
  }

  .home-lite-figure .g-count .muted {
    font-size: 20px;
  }

  .home-term-row {
    column-gap: 8px;
    padding: 8px 12px;
    font-size: 11px;
  }
}

@media (max-height: 700px) and (min-width: 901px) {
  .home-sec.home-lite-sec {
    --g-secpad: 50px;
  }

  .home-lite-figure .g-mark {
    width: 300px;
    height: auto;
  }

  .home-lite-steps {
    padding-top: 28px;
  }

  .home-term-row {
    padding-top: 5px;
    padding-bottom: 5px;
  }
}
</style>
