<script setup lang="ts">
import { useData } from 'vitepress'
import { useI18n } from '../i18n'
import { FOOTER } from './config'

const { theme } = useData()
const { tr, link, languages } = useI18n()
</script>

<template>
  <footer class="g-footer">
    <div class="g-footer-cols">
      <div class="g-footer-brand">
        <img src="/logo@2x.png" alt="Goravel" width="89" height="24" />
        <p class="g-small muted">{{ tr('A Go framework with the structure of Laravel.') }}</p>
      </div>
      <div v-for="c in FOOTER" :key="c.title" class="g-footer-col">
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
