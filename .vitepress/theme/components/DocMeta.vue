<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { useHomeI18n } from '../home/i18n'

const LAYER_OF: Record<string, string> = {
  'architecture-concepts': 'Core',
  'the-basics': 'HTTP',
  ai: 'Application',
  security: 'Application',
  database: 'Data',
  orm: 'Data',
  testing: 'Core',
  'digging-deeper/artisan-console': 'Core',
  'digging-deeper/cache': 'Data',
  'digging-deeper/collections': 'Core',
  'digging-deeper/color': 'Core',
  'digging-deeper/event': 'Async',
  'digging-deeper/filesystem': 'Data',
  'digging-deeper/helpers': 'Core',
  'digging-deeper/http-client': 'HTTP',
  'digging-deeper/localization': 'Application',
  'digging-deeper/mail': 'Async',
  'digging-deeper/package-development': 'Core',
  'digging-deeper/pluralization': 'Application',
  'digging-deeper/processes': 'Core',
  'digging-deeper/queues': 'Async',
  'digging-deeper/strings': 'Core',
  'digging-deeper/task-scheduling': 'Async',
  'digging-deeper/telemetry': 'Async'
}

const { page, theme } = useData()
const { tr } = useHomeI18n()

const meta = computed(() => {
  const path = page.value.filePath.replace(/^(en|zh_CN|uz_UZ)\//, '').replace(/\.md$/, '')
  const [dir, name] = path.split('/')
  if (!name) return null
  const groups = theme.value.sidebar as { text: string; base: string }[]
  return {
    section: groups.find((group) => group.base.endsWith(`/${dir}/`))?.text,
    layer: LAYER_OF[path] ?? LAYER_OF[dir]
  }
})
</script>

<template>
  <div v-if="meta" class="goravel-doc-meta">
    <span class="crumbs">
      <span>{{ theme.nav?.[0]?.text }}</span>
      <template v-if="meta.section">
        <span class="sep">/</span>
        <span>{{ meta.section }}</span>
      </template>
      <span class="sep">/</span>
      <span class="current">{{ page.title }}</span>
    </span>
    <span v-if="meta.layer" class="layer">{{ tr(`${meta.layer} layer`) }}</span>
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

@media (max-width: 599px) {
  .crumbs > span:not(.current) {
    display: none;
  }
}
</style>
