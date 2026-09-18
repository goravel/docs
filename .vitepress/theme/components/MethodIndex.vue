<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import { useI18n } from '../i18n'

const route = useRoute()
const { tr } = useI18n()
const methods = ref<{ id: string; name: string }[]>([])
const query = ref('')
const active = ref('')
const shown = computed(() => methods.value.filter((m) => m.name.toLowerCase().includes(query.value.toLowerCase())))
let observer: IntersectionObserver | undefined

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

function collect() {
  observer?.disconnect()
  const found = new Map<string, HTMLElement>()
  for (const el of document.querySelectorAll<HTMLElement>('.vp-doc h3, .vp-doc h4, .vp-doc p:has(> strong:only-child)')) {
    const name = methodName(el)
    if (name && !found.has(name)) found.set(name, el)
  }
  methods.value = []
  if (found.size < 6) return

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.find((entry) => entry.isIntersecting)
      if (visible) active.value = visible.target.id
    },
    { rootMargin: '-80px 0px -70% 0px' }
  )
  for (const [name, el] of found) {
    el.id ||= 'method-' + name.toLowerCase().replace(/\W+/g, '-')
    observer.observe(el)
    methods.value.push({ id: el.id, name })
  }
}

onMounted(collect)
onUnmounted(() => observer?.disconnect())
watch(() => route.path, () => nextTick(collect))
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
    <a
      v-for="method in shown"
      :key="method.id"
      class="method"
      :class="{ active: method.id === active }"
      :href="`#${method.id}`"
    >{{ method.name }}</a>
  </div>
</template>

<style scoped>
.goravel-methods {
  display: flex;
  flex-direction: column;
  margin-bottom: 28px;
  padding: 0 var(--g-shell-inset) 0 var(--g-rail);
}

.filter {
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
