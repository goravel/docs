<script setup lang="ts">
import { useI18n } from '../i18n'
import CodeLines from './CodeLines.vue'
import { CAPABILITIES, FACADES, FACADES_TITLE, FRESH } from './config'

const { tr, link } = useI18n()
const names = Object.keys(FACADES).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
</script>

<template>
<section class="home-sec">
  <div class="g-wrap">
    <header class="g-sec-head">
      <h2 class="g-h2">{{ names.length }} {{ tr(FACADES_TITLE) }}</h2>
    </header>

    <div class="home-box">
      <article class="home-cell is-wide">
        <ul class="home-facades">
          <li v-for="name in names" :key="name">
            <a :href="link(FACADES[name][0])" :title="FACADES[name][1]">{{ name }}</a>
            <span v-if="FRESH.includes(name)" class="home-new">{{ tr('new') }}</span>
          </li>
        </ul>
      </article>

      <article v-for="cell in CAPABILITIES" :key="cell.title" class="home-cell">
        <h3 class="g-h3">
          {{ tr(cell.title) }}<span v-if="FRESH.includes(cell.facade ?? '')" class="home-new">{{ tr('new') }}</span>
        </h3>
        <p class="g-body muted">{{ tr(cell.says) }}</p>
        <CodeLines class="is-plain home-code" :code="cell.code" :lit="cell.lit" />
      </article>
    </div>
  </div>
</section>
</template>

<style>
.home-box {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 56px;
  border-top: 1px solid var(--g-line);
  border-left: 1px solid var(--g-line);
}

.home-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  padding: 36px 28px 32px;
  border-right: 1px solid var(--g-line);
  border-bottom: 1px solid var(--g-line);
}

.home-cell::after {
  content: '';
  position: absolute;
  right: -3px;
  bottom: -3px;
  z-index: 1;
  width: 5px;
  height: 5px;
  background: var(--g-cyan);
}

.home-cell.is-wide {
  grid-column: 1 / -1;
  padding-top: 52px;
  padding-bottom: 56px;
}

.home-cell .home-new {
  display: inline-block;
  padding: 2px 7px;
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  vertical-align: middle;
  color: var(--g-white);
  background: var(--g-cyan-text);
}

.g-h3 .home-new {
  position: relative;
  top: -3px;
  margin-left: 12px;
}

.home-cell .home-new + .g-h3 {
  margin-top: 16px;
}

.home-cell .g-body {
  margin-top: 10px;
}

.home-cell .home-code {
  align-self: stretch;
  min-height: 148px;
  margin-top: auto;
  padding: 14px 0;
  border: 1px solid var(--g-line);
  background: var(--g-soft);
  font-size: 12.5px;
  line-height: 24px;
  scrollbar-width: thin;
}

.home-cell .home-code .ln {
  padding: 0 16px;
}

.home-cell .g-body:has(+ .home-code) {
  margin-bottom: 28px;
}

.home-facades {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  flex: 1;
  align-content: space-between;
  gap: 18px 24px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-facades a {
  font-family: var(--vp-font-family-mono);
  font-size: 17px;
  line-height: 32px;
  color: var(--g-ink);
  transition: color 0.15s ease;
}

.home-facades a:hover {
  color: var(--g-cyan-text);
}

.home-facades li {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.home-new {
  padding: 1px 6px;
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  line-height: 16px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--g-ink);
  background: var(--g-cyan-tint);
}

.home-cell .ln {
  color: var(--g-ink);
}

@media (max-width: 1399px) {
  .home-cell .home-code {
    font-size: 13.5px;
    line-height: 26px;
  }

  .home-cell .home-code .ln {
    padding-left: calc(16px + 2ch);
    text-indent: -2ch;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .home-box {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .home-box {
    grid-template-columns: minmax(0, 1fr);
  }

  .home-cell.is-wide {
    grid-column: auto;
  }

  .home-cell .home-code {
    font-size: 12px;
    line-height: 24px;
  }

  .home-cell {
    padding: 28px 20px 32px;
  }

  .home-facades {
    grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
    gap: 4px 12px;
  }

  .home-facades a {
    font-size: 14px;
    line-height: 28px;
  }
}
</style>
