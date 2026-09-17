<script setup lang="ts">
import { useSidebar } from 'vitepress/theme'

const { hasSidebar } = useSidebar()

const links = [
  { text: 'Documentation', href: '/getting-started/installation' },
  { text: 'Release notes', href: '/prologue/releases' },
  { text: 'GitHub', href: 'https://github.com/goravel/goravel' },
  { text: 'Discord', href: 'https://discord.gg/cFc5csczzS' },
  { text: 'Contribute', href: '/prologue/contributions' }
]
</script>

<template>
  <nav v-if="hasSidebar" class="foot" aria-label="Goravel">
    <span class="mark">Goravel</span>
    <a v-for="l in links" :key="l.text" :href="l.href">{{ l.text }}</a>
  </nav>
</template>

<style scoped>
.foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
  padding: 18px 24px;
  border-top: 1px solid var(--g-line);
  background: var(--g-white);
}

@media (min-width: 960px) {
  .foot {
    gap: 10px 26px;
    margin-left: var(--vp-sidebar-width);
    padding: 20px var(--g-shell-inset) 20px var(--g-gutter);
    border-left: 1px solid var(--g-line);
  }
}

.mark {
  margin-right: 6px;
  font-size: 14px;
  font-weight: 650;
  color: var(--g-ink);
}

a {
  font-size: 14px;
  line-height: 22px;
  color: var(--g-grey);
  transition: color 0.15s ease;
}

a:hover {
  color: var(--g-ink);
}
</style>
