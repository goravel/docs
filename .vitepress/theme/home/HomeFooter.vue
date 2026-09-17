<script setup lang="ts">
import { useData } from 'vitepress'
import { LINKS } from '../../links'
import { useI18n } from '../i18n'

const { theme } = useData()
const { tr, link, languages } = useI18n()

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
      ['GitHub', LINKS.github],
      ['Discord', LINKS.discord],
      ['X', LINKS.x],
      ['Open Collective', LINKS.openCollective]
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
        <span class="g-label ink">{{ tr(c.title) }}</span>
        <a v-for="[label, href] in c.items" :key="label" class="g-small" :href="link(href)">{{ tr(label) }}</a>
      </div>
    </div>
    <div class="g-footer-bar">
      <span class="g-meta">{{ theme.footer?.message }} · {{ theme.footer?.copyright }}</span>
      <span class="g-meta">
        <template v-for="(l, i) in languages" :key="l.text">
          <template v-if="i"> · </template><a :href="l.link">{{ l.text }}</a>
        </template>
      </span>
    </div>
  </footer>
</template>
