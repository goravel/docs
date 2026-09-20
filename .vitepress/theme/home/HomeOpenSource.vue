<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import { StorageSerializers, useFetch, useLocalStorage } from '@vueuse/core'
import { useDismiss } from '../dismiss'
import { useI18n } from '../i18n'
import { CONTRIBUTORS, CORE_TEAM, OPEN_SOURCE } from './config'
import { data as github } from './github.data'
import { data as plan } from './releases.data'

const { tr, link } = useI18n()
const { localeIndex } = useData()
const wechat = computed(() => localeIndex.value === 'zh_CN')

const others = CONTRIBUTORS.filter((name) => !CORE_TEAM.includes(name))

const live = useLocalStorage<{ stars: number; at: number } | null>('goravel-github', null, {
  serializer: StorageSerializers.object,
  initOnMounted: true
})
const { data: repo, execute } = useFetch('https://api.github.com/repos/goravel/goravel', { immediate: false, timeout: 5000 })
  .json<{ stargazers_count: number }>()
const now = ref(plan.now)

onMounted(async () => {
  now.value = new Date().toISOString().slice(0, 10)
  if (live.value && Date.now() - live.value.at < 3_600_000) return
  await execute()
  live.value = {
    stars: repo.value?.stargazers_count ?? live.value?.stars ?? github.stars,
    at: Date.now()
  }
})

const stars = computed(() => (live.value?.stars ?? github.stars).toLocaleString('en-US'))

const time = (date: string) => Date.parse(date)
const years = computed(() => {
  const first = new Date(Math.min(...plan.releases.map((r) => time(r.from)))).getUTCFullYear()
  const last = new Date(Math.max(...plan.releases.map((r) => time(r.until)))).getUTCFullYear()
  return Array.from({ length: last - first + 1 }, (_, i) => first + i)
})
const start = computed(() => Date.UTC(years.value[0], 0, 1))
const span = computed(() => Date.UTC(years.value[years.value.length - 1] + 1, 0, 1) - start.value)
const at = (date: string) => ((time(date) - start.value) / span.value) * 100

const rows = computed(() =>
  plan.releases.map((r) => ({
    ...r,
    left: at(r.from),
    width: at(r.until) - at(r.from),
    state: r.planned ? 'planned' : time(r.until) >= time(now.value) ? 'current' : 'ended'
  }))
)

const qr = ref<string | null>(null)
const joins = ref<HTMLElement | null>(null)
const onFocusOut = useDismiss(joins, () => (qr.value = null))
</script>

<template>
  <section class="g-community os">
    <h2 class="g-h2">{{ tr(OPEN_SOURCE.title) }}</h2>

    <div class="os-row is-pulse">
      <div class="os-cell os-stats">
        <p><span class="os-value">{{ stars }}</span><span class="g-body muted">{{ tr('GitHub stars') }}</span></p>
        <p><span class="os-value">{{ CONTRIBUTORS.length }}</span><span class="g-body muted">{{ tr('contributors') }}</span></p>
      </div>

      <div class="os-cell os-plan">
        <div class="os-plan-head">
          <span class="g-label">{{ tr('Releases') }}</span>
          <span class="os-legend" aria-hidden="true">
            <span><i class="os-dot" />{{ tr('release') }}</span>
            <span><i class="os-bar" />{{ tr('bug fixes') }}</span>
            <span class="is-ended"><i class="os-bar" />{{ tr('ended') }}</span>
            <span class="is-planned"><i class="os-dot" />{{ tr('planned') }}</span>
          </span>
        </div>
        <div class="os-chart" role="group" :aria-label="tr('Releases')">
          <div class="os-grid" aria-hidden="true">
            <span v-for="(y, i) in years" :key="y" :style="{ left: `${(i / years.length) * 100}%` }">{{ y }}</span>
            <i :style="{ left: `${at(now)}%` }"><b>{{ tr('today') }}</b></i>
          </div>
          <div
            v-for="r in rows"
            :key="r.version"
            class="os-bar-row"
            :class="`is-${r.state}`"
            role="img"
            tabindex="0"
            :aria-label="`v${r.version}: ${r.fromText} to ${r.untilText}`"
            :data-tip="`${r.fromText} → ${r.untilText}`"
          >
            <span class="os-version">v{{ r.version }}</span>
            <div class="os-track">
              <span class="os-bar" :style="{ left: `${r.left}%`, width: `${r.width}%` }" />
              <span class="os-dot" :style="{ left: `${r.left}%` }" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="os-row is-people">
      <div class="os-cell">
        <span class="g-label">{{ tr('Core team') }}</span>
        <div class="os-core">
          <a v-for="name in CORE_TEAM" :key="name" :href="`https://github.com/${name}`" target="_blank" rel="noreferrer">
            <img :src="`https://avatars.githubusercontent.com/${name}?s=128`" :alt="name" width="56" height="56" loading="lazy" />
            <span>{{ name }}</span>
          </a>
        </div>
      </div>
      <div class="os-cell">
        <span class="g-label">{{ others.length }} {{ tr('more contributors') }}</span>
        <div class="os-people">
          <a v-for="name in others" :key="name" :href="`https://github.com/${name}`" target="_blank" rel="noreferrer" :title="name">
            <img :src="`https://avatars.githubusercontent.com/${name}?s=80`" :alt="name" width="40" height="40" loading="lazy" />
          </a>
        </div>
      </div>
    </div>

    <div ref="joins" class="os-row is-join" @focusout="onFocusOut">
      <div v-for="join in OPEN_SOURCE.joins" :key="join.title" class="os-cell">
        <a
          class="os-go"
          :href="link(join.link)"
          :target="join.link.startsWith('http') ? '_blank' : undefined"
          :rel="join.link.startsWith('http') ? 'noreferrer' : undefined"
        >
          {{ tr(join.title) }}<span class="icon-[lucide--arrow-up-right]" aria-hidden="true" />
        </a>
        <span v-if="wechat && join.wechat" class="os-qr">
          <button type="button" class="g-link" :aria-expanded="qr === join.title" @click="qr = qr === join.title ? null : join.title">
            {{ tr(join.wechat.label) }}
          </button>
          <img v-if="qr === join.title" :src="join.wechat.src" :alt="tr(join.wechat.alt)" width="140" height="140" />
        </span>
        <span v-else class="g-body muted">{{ tr(join.says) }}</span>
      </div>
    </div>
  </section>
</template>

<style>
.g-community.os {
  padding-top: 112px;
  padding-bottom: 0;
}

.os-row {
  display: grid;
  margin: 0 calc(var(--g-bleed-right) * -1) 0 calc(var(--g-bleed-left) * -1);
  padding: 0 var(--g-bleed-right) 0 var(--g-bleed-left);
  border-top: 1px solid var(--g-line);
}

.os-row.is-pulse {
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  margin-top: 56px;
}

.os-row.is-people {
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
}

.os-row.is-join {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.g-home .os-cell .g-label {
  font-size: 13px;
}

.os-cell {
  position: relative;
  min-width: 0;
  padding: 44px 40px 48px;
  border-left: 1px solid var(--g-line);
}

.os-cell:first-child {
  padding-left: 0;
  border-left: 0;
}

.os-cell:not(:first-child)::before {
  content: '';
  position: absolute;
  left: -3px;
  top: -3px;
  z-index: 1;
  width: 5px;
  height: 5px;
  background: var(--g-cyan);
}

.os-stats {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 36px;
}

.os-stats p {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
}

.os-value {
  font-size: 60px;
  line-height: 58px;
  font-weight: 600;
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
}

.os-plan-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.os-chart {
  position: relative;
  margin-top: 40px;
  padding-bottom: 28px;
}

.os-grid {
  position: absolute;
  inset: 0 0 0 64px;
}

.os-grid span {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  padding-left: 8px;
  border-left: 1px solid var(--g-line);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 16px;
  color: var(--g-grey);
}

.os-grid i {
  position: absolute;
  top: 0;
  bottom: 22px;
  width: 1px;
  background: var(--g-ink);
}

.os-grid b {
  position: absolute;
  top: -18px;
  left: 0;
  transform: translateX(-50%);
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  font-weight: 400;
  line-height: 14px;
  color: var(--g-ink);
}

.os-bar-row {
  position: relative;
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  align-items: center;
  height: 32px;
}

.os-bar-row::after {
  content: attr(data-tip);
  position: absolute;
  right: 0;
  top: 3px;
  z-index: 2;
  padding: 2px 8px;
  border: 1px solid var(--g-line);
  background: var(--g-white);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  color: var(--g-ink);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.os-bar-row:hover::after,
.os-bar-row:focus-visible::after {
  opacity: 1;
}

.os-version {
  font-family: var(--vp-font-family-mono);
  font-size: 13.5px;
  color: var(--g-ink);
}

.os-bar-row.is-planned .os-version {
  color: var(--g-grey);
}

.os-track {
  position: relative;
  height: 10px;
}

.os-bar {
  position: absolute;
  top: 3px;
  height: 4px;
  background: var(--g-line);
}

.os-dot {
  position: absolute;
  top: 0;
  width: 10px;
  height: 10px;
  margin-left: -5px;
  border-radius: 50%;
  background: var(--g-grey);
}

.os-bar-row.is-current .os-bar,
.os-bar-row.is-current .os-dot {
  background: var(--g-cyan);
}

.os-bar-row.is-planned .os-bar {
  top: 4px;
  height: 0;
  border-top: 2px dashed var(--g-cyan);
  background: none;
}

.os-bar-row.is-planned .os-dot,
.os-legend .is-planned .os-dot {
  border: 2px solid var(--g-cyan);
  background: var(--g-white);
}

.os-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 18px;
  color: var(--g-grey);
}

.os-legend span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.os-legend i {
  position: static;
  flex-shrink: 0;
  margin: 0;
}

.os-legend .os-dot,
.os-legend .os-bar {
  background: var(--g-cyan);
}

.os-legend .os-bar {
  width: 18px;
  height: 4px;
}

.os-legend .is-ended .os-bar {
  background: var(--g-line);
}

.os-core {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(164px, 1fr));
  gap: 20px 16px;
  margin-top: 24px;
}

.os-core a {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  white-space: nowrap;
  color: var(--g-ink);
}

.os-core a:hover {
  color: var(--g-cyan-text);
}

.os-core img,
.os-people img {
  display: block;
  border-radius: 50%;
}

.os-core img {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
}

.os-people {
  display: grid;
  grid-template-columns: repeat(auto-fill, 46px);
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
}

.os-people img {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
}

.os-row.is-join .os-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding-top: 36px;
  padding-bottom: 40px;
}

.os-go {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
  line-height: 28px;
  font-weight: 650;
  letter-spacing: -0.02em;
  color: var(--g-ink);
  transition: color 0.15s ease;
}

.os-go::after {
  content: '';
  position: absolute;
  inset: 0;
}

.os-go:hover {
  color: var(--g-cyan-text);
}

.os-go [class^='icon-'] {
  width: 18px;
  height: 18px;
  color: var(--g-cyan);
}

.os-qr {
  position: relative;
  z-index: 2;
  font-size: 15px;
}

.os-qr button {
  text-align: left;
}

.os-qr img {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  box-sizing: content-box;
  width: 140px;
  height: 140px;
  max-width: none;
  padding: 12px;
  border: 1px solid var(--g-line);
  background: var(--g-white);
}

@media (max-width: 1100px) {
  .os-row.is-join {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .os-row.is-join .os-cell:nth-child(3) {
    padding-left: 0;
    border-left: 0;
  }

  .os-row.is-join .os-cell:nth-child(3)::before {
    content: none;
  }

  .os-row.is-join .os-cell:nth-child(n + 3) {
    border-top: 1px solid var(--g-line);
  }


  .os-cell {
    padding: 36px 28px 40px;
  }
}

@media (max-width: 900px) {
  .g-community.os {
    padding-top: 64px;
  }

  .os-row.is-pulse,
  .os-row.is-people {
    grid-template-columns: minmax(0, 1fr);
    margin-top: 32px;
  }

  .os-row.is-people {
    margin-top: 0;
  }

  .os-row.is-pulse .os-cell,
  .os-row.is-people .os-cell {
    padding: 28px 0 32px;
    border-left: 0;
  }

  .os-row.is-pulse .os-cell + .os-cell,
  .os-row.is-people .os-cell + .os-cell {
    margin: 0 calc(var(--g-bleed-right) * -1) 0 calc(var(--g-bleed-left) * -1);
    padding-left: var(--g-bleed-left);
    padding-right: var(--g-bleed-right);
    border-top: 1px solid var(--g-line);
  }

  .os-row.is-pulse .os-cell::before,
  .os-row.is-people .os-cell::before {
    content: none;
  }

  .os-stats {
    flex-direction: row;
    justify-content: flex-start;
    gap: 48px;
  }

  .os-value {
    font-size: 40px;
    line-height: 42px;
  }

  .os-plan-head {
    flex-direction: column;
    gap: 6px;
  }

  .os-grid {
    left: 52px;
  }

  .os-bar-row {
    grid-template-columns: 52px minmax(0, 1fr);
  }

  .os-people {
    grid-template-columns: repeat(auto-fill, 36px);
    gap: 8px;
  }

  .os-row.is-join .os-cell {
    padding: 24px 16px 28px;
  }

  .os-row.is-join .os-cell:nth-child(odd) {
    padding-left: 0;
  }

  .os-go {
    font-size: 18px;
    line-height: 24px;
  }
}
</style>
