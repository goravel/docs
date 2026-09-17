<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

type Entry = { id: string; text: string }

const route = useRoute()
const entries = ref<Entry[]>([])
const query = ref('')
const active = ref('')
let observer: IntersectionObserver | null = null

function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// A method name, as the docs write them: Latest, WhereIn, OrderBy / OrderByDesc.
const METHOD = /^[A-Z][A-Za-z0-9]*( \/ [A-Z][A-Za-z0-9]*)*$/

function collect() {
  observer?.disconnect()
  const found: Entry[] = []
  const seen = new Set<string>()

  // reference pages write some method names as headings and some as a bold paragraph of their own
  document.querySelectorAll<HTMLElement>('.vp-doc h3, .vp-doc h4, .vp-doc p > strong:only-child').forEach((node) => {
    const el = node.tagName === 'STRONG' ? (node.parentElement as HTMLElement) : node
    if (!el || el.textContent!.length > 80) return
    const text = (node.textContent || '').replace('​', '').replace(/#$/, '').trim().replace(/:$/, '')
    if (!METHOD.test(text) || seen.has(text)) return
    const id = el.id || 'method-' + slug(text)
    el.id = id
    seen.add(text)
    found.push({ id, text })
  })
  entries.value = found.length >= 6 ? found : []

  if (entries.value.length) {
    observer = new IntersectionObserver(
      (records) => {
        const seen = records.filter((r) => r.isIntersecting).map((r) => (r.target as HTMLElement).id)
        if (seen.length) active.value = seen[0]
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )
    entries.value.forEach((e) => {
      const el = document.getElementById(e.id)
      if (el) observer!.observe(el)
    })
  }
}

onMounted(collect)
watch(() => route.path, () => nextTick(collect))
</script>

<template>
  <div v-if="entries.length" class="goravel-methods">
    <div class="head">Methods</div>
    <input
      v-if="entries.length >= 14"
      v-model="query"
      class="filter"
      type="search"
      placeholder="Filter"
      aria-label="Filter methods"
    />
    <a
      v-for="entry in entries.filter((e) => e.text.toLowerCase().includes(query.toLowerCase()))"
      :key="entry.id"
      class="method"
      :class="{ active: entry.id === active }"
      :href="'#' + entry.id"
    >{{ entry.text }}</a>
  </div>
</template>

<style scoped>
.goravel-methods {
  display: flex;
  flex-direction: column;
  margin-bottom: 28px;
  padding: 0 var(--g-shell-inset) 0 var(--g-rail);
}

/* the label's rule runs across the whole rail, like the outline's */
.head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 calc(var(--g-shell-inset) * -1) 14px calc(var(--g-rail) * -1);
  padding: 0 var(--g-shell-inset) 12px var(--g-rail);
  border-bottom: 1px solid var(--g-line);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--g-grey);
}

.head::before {
  content: '';
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  background: var(--g-construct);
  transform: rotate(45deg);
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
  font-size: 11.5px;
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
