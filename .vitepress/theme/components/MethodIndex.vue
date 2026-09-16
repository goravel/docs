<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

/**
 * Reference pages write method names as a bold paragraph of their own, not as a heading, so the
 * outline cannot see them. This reads them out of the rendered page and lists them, with a filter.
 * Nothing in the markdown changes.
 */

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
    <div class="head">
      <span class="label">Methods</span>
    </div>
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
