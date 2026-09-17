<script setup lang="ts">
import { useHomeI18n } from './i18n'

const { tr } = useHomeI18n()
/* The end of the page: where to go next, and the licence. */
const COLUMNS = [
  {
    title: 'Documentation',
    items: [
      ['Installation', '/getting-started/installation.html'],
      ['Routing', '/the-basics/routing.html'],
      ['ORM', '/orm/getting-started.html'],
      ['Queues', '/digging-deeper/queues.html'],
      ['Testing', '/testing/getting-started.html']
    ]
  },
  {
    title: 'Project',
    items: [
      ['Release Notes', '/prologue/releases.html'],
      ['Upgrading To v1.18', '/upgrade/v1.18.html'],
      ['Compare With Laravel', '/prologue/compare-with-laravel.html'],
      ['Contribution Guide', '/prologue/contributions.html'],
      ['Privacy Policy', '/prologue/privacy.html']
    ]
  },
  {
    title: 'Community',
    items: [
      ['GitHub', 'https://github.com/goravel/goravel'],
      ['Discord', 'https://discord.gg/cFc5csczzS'],
      ['X', 'https://x.com/goravel_dev'],
      ['Open Collective', 'https://opencollective.com/goravel']
    ]
  }
]
</script>

<template>
  <footer class="g-footer">
    <div class="g-footer-cols">
      <div class="g-footer-brand">
        <img src="/logo@2x.png" alt="Goravel" height="24" />
        <p class="g-small muted">{{ tr('A Go framework with the structure of Laravel.') }}</p>
      </div>
      <div v-for="c in COLUMNS" :key="c.title" class="g-footer-col">
        <span class="g-label ink">{{ c.title }}</span>
        <a v-for="[label, href] in c.items" :key="label" class="g-small" :href="href">{{ label }}</a>
      </div>
    </div>
    <div class="g-footer-bar">
      <span class="g-meta">Released under the MIT License · Copyright © 2021–2026 Goravel</span>
      <span class="g-meta">English · 简体中文 · Oʻzbekcha</span>
    </div>
  </footer>
</template>
