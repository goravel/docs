<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

/**
 * The community links, at the end of a documentation page.
 *
 * The bar on a docs page carries no destinations, because the sidebar is the navigation there.
 * That left Discord, X and the contribution guide reachable only from the homepage, so they are
 * carried here instead, the way Laravel's docs put them in the footer rather than the header.
 */
const { frontmatter, theme } = useData()

const isDocs = computed(
  () => frontmatter.value.layout !== 'goravel-home' && frontmatter.value.sidebar !== false
)

/**
 * One row, not a second site. A reader at the foot of a twenty-minute page wants the few
 * places they might go next, not the whole ecosystem again; the homepage carries that.
 */
const links = [
  { text: 'Documentation', href: '/getting-started/installation' },
  { text: 'Release notes', href: '/prologue/releases' },
  { text: 'GitHub', href: 'https://github.com/goravel/goravel' },
  { text: 'Discord', href: 'https://discord.gg/cFc5csczzS' },
  { text: 'Contribute', href: '/prologue/contributions' }
]
</script>

<template>
  <div v-if="isDocs" class="g-docs-foot">
    <nav class="g-docs-foot-row" aria-label="Goravel">
      <span class="mark">Goravel</span>
      <a v-for="l in links" :key="l.text" :href="l.href">{{ l.text }}</a>
    </nav>
  </div>
</template>
