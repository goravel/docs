<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

/**
 * The line above every article: where the page sits, and which layer of the framework it belongs to.
 * Both are derived from the path, so no markdown and no config has to change.
 */

const SECTIONS: Record<string, string> = {
  'getting-started': 'Getting Started',
  'architecture-concepts': 'Architecture Concepts',
  'the-basics': 'The Basics',
  'digging-deeper': 'Digging Deeper',
  ai: 'AI',
  security: 'Security',
  database: 'Database',
  orm: 'ORM',
  testing: 'Testing',
  upgrade: 'Upgrade',
  prologue: 'Prologue'
}

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
