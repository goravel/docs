<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { onContentUpdated } from 'vitepress'
import { useIntersectionObserver } from '@vueuse/core'
import { useI18n } from '../i18n'

const { tr } = useI18n()
const methods = ref<{ id: string; name: string }[]>([])
const query = ref('')
const active = ref('')
const shown = computed(() => methods.value.filter((m) => m.name.toLowerCase().includes(query.value.toLowerCase())))
const list = ref<HTMLElement | null>(null)
const targets = ref<HTMLElement[]>([])

// `After`, `path.App()`
const CODE_NAME = /^[\w.]+(\(\))?$/
// WithSession, Where / OrWhere; a plain word like Cursor is a section, not a method
const HEADING_NAME = /^([A-Z][a-z]+[A-Z]\w*|[A-Z]\w*( \/ [A-Z]\w*)+)$/
// **Latest**
const BOLD_NAME = /^[A-Z]\w*( \/ [A-Z]\w*)*$/

function methodName(el: HTMLElement) {
  const name = (el.textContent ?? '').replace(/[\u200b#:]/g, '').trim()
  if (el.tagName === 'P') return BOLD_NAME.test(name) ? name : null
  if (el.querySelector(':scope > code')) return CODE_NAME.test(name) ? name : null
  return HEADING_NAME.test(name) ? name : null
}

// `Path` named in a section's text and called as .Path( in that section's code;
// a heading written as `### Input {methods="Input InputInt"}` lists exactly those instead
const PROSE_NAME = /^[A-Z]\w*(\(\))?$/
const CALL = /(?<!facades)\.([A-Z]\w*)\(/g

function collect() {
  const named = new Map<string, HTMLElement>()
  const add = (name: string | null, el: Element | null) => {
    if (name && el && !named.has(name)) named.set(name, el as HTMLElement)
  }

  const pinned = new Map<string, HTMLElement>()
  let heading: HTMLElement | null = null
  let listed = false
  let mentions: HTMLElement[] = []
  let calls = new Set<string>()
  const closeSection = () => {
    const title = (heading?.textContent ?? '').replace(/[\u200b#]/g, '').trim()
    if (calls.has(title)) add(title, heading)
    for (const code of mentions) {
      const name = code.textContent!.replace('()', '')
      if (calls.has(name)) add(name, code.closest('p, li'))
    }
    mentions = []
    calls = new Set()
  }

  for (const node of document.querySelector('.vp-doc > div')?.children ?? []) {
    if (/^H[2-4]$/.test(node.tagName)) {
      closeSection()
      heading = node as HTMLElement
      listed = heading.hasAttribute('methods')
      for (const name of heading.getAttribute('methods')?.split(/[\s,]+/).filter(Boolean) ?? []) pinned.set(name, heading)
      if (!listed && node.tagName !== 'H2') add(methodName(heading), node)
      continue
    }
    if (listed) continue
    if (node.matches('p') && node.querySelector(':scope > strong:only-child')) add(methodName(node as HTMLElement), node)
    for (const row of node.querySelectorAll('tbody tr')) {
      const name = row.querySelector('td')?.textContent?.trim() ?? ''
      const hash = row.querySelector<HTMLAnchorElement>('a[href^="#"]')?.hash
      if (hash && PROSE_NAME.test(name)) add(name, document.getElementById(decodeURIComponent(hash.slice(1))))
    }
    const blocks = node.matches('div[class*="language-"]') ? [node] : [...node.querySelectorAll('div[class*="language-"]')]
    for (const block of blocks) for (const call of block.textContent!.matchAll(CALL)) calls.add(call[1])
    for (const code of node.querySelectorAll<HTMLElement>('code')) {
      if (!code.closest('pre, table') && PROSE_NAME.test(code.textContent ?? '')) mentions.push(code)
    }
  }
  closeSection()
  for (const [name, el] of pinned) named.set(name, el)

  const found = named.size < 6 ? [] : [...named].sort(([, a], [, b]) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : a === b ? 0 : 1))
  for (const [name, el] of found) el.id ||= 'method-' + name.toLowerCase().replace(/\W+/g, '-')
  methods.value = found.map(([name, el]) => ({ id: el.id, name }))
  targets.value = [...new Set(found.map(([, el]) => el))]
}

onContentUpdated(collect)
useIntersectionObserver(
  targets,
  (entries) => {
    const visible = entries.find((entry) => entry.isIntersecting)
    if (visible) active.value = visible.target.id
  },
  { rootMargin: '-80px 0px -70% 0px' }
)
watch(active, async () => {
  await nextTick()
  list.value?.querySelector('.active')?.scrollIntoView({ block: 'nearest' })
})
</script>

<template>
  <div v-if="methods.length" class="goravel-methods">
    <div class="outline-title">{{ tr('Methods') }}</div>
    <input
      v-if="methods.length >= 14"
      v-model="query"
      class="filter"
      type="search"
      :placeholder="tr('Filter')"
      :aria-label="tr('Filter methods')"
    />
    <div ref="list" class="list">
      <a
        v-for="method in shown"
        :key="method.name"
        class="method"
        :class="{ active: method.id === active }"
        :href="`#${method.id}`"
      >{{ method.name }}</a>
    </div>
  </div>
</template>

<style scoped>
.goravel-methods {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  margin-bottom: 28px;
  padding: 0 var(--g-shell-inset) 0 var(--g-rail);
}

.list {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--g-line) transparent;
}

.filter {
  flex-shrink: 0;
  width: 100%;
  height: 30px;
  margin: 0 0 6px;
  padding: 0 10px;
  border-radius: 2px;
  background: var(--g-soft);
  font-size: 13px;
  color: var(--g-ink);
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.filter::placeholder {
  color: var(--g-grey);
}

.filter:hover {
  background: var(--g-hover);
}

.filter:focus {
  outline: none;
  background: var(--g-white);
  box-shadow: inset 0 0 0 1px var(--g-cyan);
}

.method {
  position: relative;
  padding: 2px 0 2px 12px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  line-height: 18px;
  overflow-wrap: anywhere;
  color: var(--g-grey);
  transition: color 0.15s ease;
}

.method:hover {
  color: var(--g-ink);
}

.method.active {
  color: var(--g-cyan-text);
}

.method.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 5px;
  bottom: 5px;
  width: 2px;
  background: var(--g-cyan);
}
</style>
