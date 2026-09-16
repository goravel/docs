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

const groups = [
  {
    label: 'Project',
    links: [
      { text: 'GitHub', href: 'https://github.com/goravel/goravel' },
      { text: 'Release notes', href: '/prologue/releases' },
      { text: 'Compare with Laravel', href: '/prologue/compare-with-laravel' }
    ]
  },
  {
    label: 'Community',
    links: [
      { text: 'Discord', href: 'https://discord.gg/cFc5csczzS' },
      { text: 'X', href: 'https://x.com/goravel_dev' },
      { text: 'Video tutorials', href: 'https://www.youtube.com/playlist?list=PL40Xne4u-oXJ0Z5uFiPWHqIMvzZaG_BDf' }
    ]
  },
  {
    label: 'Contribute',
    links: [
      { text: 'Contribution guide', href: '/prologue/contributions' },
      { text: 'Add a language', href: '/prologue/contributions#add-a-new-language' },
      { text: 'Open Collective', href: 'https://opencollective.com/goravel' }
    ]
  }
]
</script>

<template>
  <div v-if="isDocs" class="g-docs-foot">
    <div class="g-docs-foot-grid">
      <section v-for="g in groups" :key="g.label" class="g-docs-foot-col">
        <p class="label">{{ g.label }}</p>
        <a v-for="l in g.links" :key="l.text" :href="l.href">{{ l.text }}</a>
      </section>
    </div>
  </div>
</template>
