<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

/* The line above every article: where the page sits, and which layer of the framework it belongs to. */

// Every facade belongs to exactly one layer of the mark, and so does every guide.
const LAYERS: Record<string, string> = {
  'architecture-concepts': 'Core',
  'the-basics': 'HTTP',
  ai: 'Application',
  security: 'Application',
  database: 'Data',
  orm: 'Data',
  testing: 'Core'
}

const DIGGING: Record<string, string> = {
  'artisan-console': 'Core',
  cache: 'Data',
  collections: 'Core',
  color: 'Core',
  event: 'Async',
  filesystem: 'Data',
  helpers: 'Core',
  'http-client': 'HTTP',
  localization: 'Application',
  mail: 'Async',
  'package-development': 'Core',
  pluralization: 'Application',
  processes: 'Core',
  queues: 'Async',
  strings: 'Core',
  'task-scheduling': 'Async',
  telemetry: 'Async'
}

const { page, theme } = useData()

const parts = computed(() => {
  const relative = page.value.relativePath
  const path = '/' + relative.replace(/\.md$/, '')
  const stripped = relative.replace(/^(en|zh_CN|uz_UZ)\//, '')
  const [dir, file] = stripped.split('/')
  if (!file) return null

  // the section name comes from the sidebar itself, so it is already translated
  const groups = (theme.value.sidebar ?? []) as { text?: string; base?: string }[]
  const group = groups.find((g) => g.base && path.startsWith(g.base.replace(/\/$/, '')))

  const name = file.replace(/\.md$/, '')
  const layer = dir === 'digging-deeper' ? DIGGING[name] : LAYERS[dir]
  return { section: group?.text ?? null, layer: layer ?? null }
})
</script>

<template>
  <div v-if="parts" class="goravel-doc-meta">
    <span class="crumbs">
      <span>Docs</span>
      <span v-if="parts.section" class="sep">/</span>
      <span v-if="parts.section">{{ parts.section }}</span>
      <span class="sep">/</span>
      <span class="current">{{ page.title }}</span>
    </span>
    <span v-if="parts.layer" class="layer">{{ parts.layer }} layer</span>
  </div>
</template>

<style scoped>
.goravel-doc-meta {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 20px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.02em;
  color: var(--g-grey);
}

.crumbs {
  display: flex;
  gap: 8px;
  min-width: 0;
  white-space: nowrap;
}

.current {
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--g-ink);
}

.sep {
  opacity: 0.55;
}

.layer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--g-cyan-text);
}

.layer::before {
  content: '';
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  background: currentColor;
  transform: rotate(45deg);
}

/* on a phone the trail is just the page and its layer */
@media (max-width: 599px) {
  .crumbs > span:not(.current) {
    display: none;
  }
}
</style>
