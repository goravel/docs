<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useElementHover, useTimeoutFn } from '@vueuse/core'
import { useI18n } from '../i18n'
import { useTicker } from './useTicker'
import CodeLines from './CodeLines.vue'
import { LARAVEL } from './config'

const { tr, link } = useI18n()
const concepts = LARAVEL.concepts

const DWELL = 3
const IDLE = 8000

const at = ref(0)
const tabs = ref<HTMLElement | null>(null)
const line = ref(0)
const dwell = ref(0)
const touring = ref(true)
const concept = computed(() => concepts[at.value])
const pair = computed(() => concept.value.ties[line.value] ?? [0, 0])

const { ticks, root: card } = useTicker(1500)
const hovered = useElementHover(card)
const { start: wake } = useTimeoutFn(() => (touring.value = true), IDLE, { immediate: false })

watch(at, async () => {
  await nextTick()
  const tab = tabs.value?.children[at.value] as HTMLElement | undefined
  if (tab) tabs.value!.scrollLeft = tab.offsetLeft - 16
})

watch(ticks, () => {
  dwell.value++
  if (line.value + 1 < concept.value.ties.length) {
    line.value++
    return
  }
  line.value = 0
  if (!touring.value || hovered.value || dwell.value < DWELL) return
  dwell.value = 0
  at.value = (at.value + 1) % concepts.length
})

const choose = (i: number) => {
  touring.value = false
  at.value = i
  line.value = 0
  dwell.value = 0
  wake()
}

function onTabKey(event: KeyboardEvent) {
  const last = concepts.length - 1
  const next = { ArrowRight: at.value === last ? 0 : at.value + 1, ArrowLeft: at.value === 0 ? last : at.value - 1, Home: 0, End: last }[event.key]
  if (next === undefined) return
  event.preventDefault()
  choose(next)
  nextTick(() => document.getElementById(`home-tab-${next}`)?.focus())
}
</script>

<template>
<section class="home-sec">
  <div class="g-wrap home-feat">
    <div class="home-feat-say">
      <h2 class="g-h2">{{ tr(LARAVEL.title) }}</h2>
      <ul class="home-checks">
        <li v-for="c in LARAVEL.checks" :key="c"><span class="icon-[lucide--check]" aria-hidden="true" />{{ tr(c) }}</li>
      </ul>
      <a class="home-more" :href="link(LARAVEL.compare.link)">
        {{ tr(LARAVEL.compare.text) }}<span class="icon-[lucide--arrow-up-right]" aria-hidden="true" />
      </a>
    </div>

    <div ref="card" class="home-feat-show">
      <div ref="tabs" class="g-tabs" role="tablist" :aria-label="tr('Concepts')" @keydown="onTabKey">
        <button
          v-for="(c, i) in LARAVEL.concepts"
          :id="`home-tab-${i}`"
          :key="c.name"
          type="button"
          role="tab"
          class="g-tab"
          :class="{ 'is-active': i === at }"
          :aria-selected="i === at"
          :tabindex="i === at ? 0 : -1"
          aria-controls="home-panel"
          @click="choose(i)"
        >{{ tr(c.name) }}</button>
      </div>
      <div id="home-panel" :key="at" role="tabpanel" tabindex="0" :aria-labelledby="`home-tab-${at}`" class="home-card g-swap">
        <div class="home-file">
          <div class="g-file-head">
            <span class="g-label home-brand"><span class="icon-[simple-icons--laravel]" aria-hidden="true" />Laravel · PHP</span>
            <span class="g-meta">{{ concept.phpFile }}</span>
          </div>
          <CodeLines class="is-plain" :code="concept.php" lang="php" :pair="pair[0]" />
        </div>
        <div class="home-file is-go">
          <div class="g-file-head">
            <span class="g-label cyan home-brand"><img src="/logo.svg" alt="" width="14" height="14" />Goravel · Go</span>
            <span class="g-meta">{{ concept.goFile }}</span>
          </div>
          <CodeLines class="is-plain" :code="concept.go" :pair="pair[1]" />
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<style>
.home-feat {
  display: grid;
  grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
  column-gap: clamp(40px, 5vw, 88px);
  align-items: start;
}

.home-checks {
  display: grid;
  row-gap: 12px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.home-checks li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}

.home-checks [class^='icon-'] {
  flex-shrink: 0;
  width: 17px;
  height: 17px;
  color: var(--g-cyan);
}

.home-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  padding: 9px 14px;
  border: 1px solid var(--g-line);
  font-size: 14.5px;
  font-weight: 500;
  color: var(--g-ink);
  transition: border-color 0.15s ease;
}

.home-more:hover {
  border-color: var(--g-cyan);
}

.home-more [class^='icon-'] {
  width: 15px;
  height: 15px;
  color: var(--g-cyan);
}

.home-feat-show {
  --g-bleed-left: 0px;
  --g-bleed-right: 0px;
}

.home-feat-show .g-tabs {
  justify-content: space-between;
  gap: 0 10px;
  margin-top: 0;
  padding: 0 28px;
  white-space: nowrap;
  border: 1px solid var(--g-line);
  border-bottom-color: var(--g-line);
}

.home-feat-show .g-tab {
  padding: 16px 0 15px;
  font-size: 15px;
}

.home-card {
  display: flex;
  flex-direction: column;
  min-height: 512px;
  border: 1px solid var(--g-line);
  border-top: 0;
}

.home-file {
  --g-bleed-left: 28px;
  --g-bleed-right: 28px;
  padding: 24px 28px 28px;
}

.home-file.is-go {
  flex: 1;
  border-top: 1px solid var(--g-line);
}

.home-brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.home-brand [class^='icon-'],
.home-brand img {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
}

.home-brand [class*='laravel'] {
  color: #ff2d20;
}

.home-file .g-code {
  margin: 0 -28px;
  padding-top: 14px;
  font-size: 14px;
  line-height: 26px;
}

.home-file .g-code .ln {
  padding: 0 28px;
}

.home-file.is-go .ln {
  color: var(--g-ink);
}

@media (max-width: 1100px) {
  .home-feat {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 48px;
  }
}

@media (max-width: 900px) {
  .home-feat {
    row-gap: 40px;
  }

  .home-feat-show .g-tabs {
    position: relative;
    flex-wrap: nowrap;
    justify-content: flex-start;
    gap: 0 18px;
    overflow-x: auto;
    padding: 0 16px;
    scrollbar-width: none;
  }

  .home-feat-show .g-tab {
    flex-shrink: 0;
    white-space: nowrap;
  }

  .home-feat-show .g-tab::after {
    bottom: 0;
  }

  .home-file {
    --g-bleed-left: 16px;
    --g-bleed-right: 16px;
  }

  .home-file .g-code {
    margin: 0 -16px;
  }

  .home-file .g-code .ln {
    padding: 0 16px 0 calc(16px + 2ch);
    text-indent: -2ch;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .home-feat-show .g-tab {
    padding: 11px 0 9px;
  }

  .home-card {
    min-height: 0;
  }

  .home-file {
    padding: 20px 16px 24px;
  }

  .home-file .g-code {
    font-size: 12.5px;
  }
}

@media (max-width: 600px) {
  .home-file .g-file-head {
    flex-direction: column;
    gap: 4px;
  }

  .home-brand {
    white-space: nowrap;
  }
}
</style>
