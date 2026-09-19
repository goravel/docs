<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { StorageSerializers, useFetch, useLocalStorage } from '@vueuse/core'
import { LINKS } from '../../links'
import { useDismiss } from '../dismiss'
import { useI18n } from '../i18n'
import { CONTRIBUTORS } from './content'
import { data } from './github.data'

const { tr } = useI18n()

// live stars and forks: the browser asks GitHub at most once an hour, since the numbers move
// slowly and GitHub allows 60 requests an hour without a token. Until an answer arrives, or
// if GitHub refuses, the last numbers stay: the previous answer, else the build's.
const live = useLocalStorage<{ stars: number; forks: number; at: number } | null>('goravel-github', null, {
  serializer: StorageSerializers.object,
  initOnMounted: true
})
const { data: repo, execute } = useFetch('https://api.github.com/repos/goravel/goravel', { immediate: false, timeout: 5000 })
  .json<{ stargazers_count: number; forks_count: number }>()

onMounted(async () => {
  if (live.value && Date.now() - live.value.at < 3_600_000) return
  await execute()
  live.value = {
    stars: repo.value?.stargazers_count ?? live.value?.stars ?? data.stars,
    forks: repo.value?.forks_count ?? live.value?.forks ?? data.forks,
    at: Date.now()
  }
})

const stats = computed(() => [
  { value: (live.value?.stars ?? data.stars).toLocaleString('en-US'), label: 'GitHub stars' },
  { value: String(CONTRIBUTORS.length), label: 'contributors' },
  { value: (live.value?.forks ?? data.forks).toLocaleString('en-US'), label: 'forks' },
  { value: data.release, label: 'current release' }
])

const QR_CODES = [
  { label: 'WeChat group', src: '/wechat.jpg', alt: 'WeChat group QR code' },
  { label: 'Support with WeChat', src: '/reward-wechat.jpg', alt: 'WeChat reward QR code' }
]
const qr = ref<string | null>(null)
const links = ref<HTMLElement | null>(null)
const onFocusOut = useDismiss(links, () => (qr.value = null))
</script>

<template>
  <section class="g-community">
    <h2 class="g-h2">{{ tr('Open source.') }}</h2>

    <div class="g-stats">
      <div v-for="s in stats" :key="s.label" class="g-stat">
        <span class="value">{{ s.value }}</span>
        <span class="g-body muted">{{ tr(s.label) }}</span>
      </div>
    </div>

    <div class="g-people">
      <a
        v-for="name in CONTRIBUTORS"
        :key="name"
        class="g-person"
        :href="`https://github.com/${name}`"
        target="_blank"
        rel="noreferrer"
        :title="name"
      ><img :src="`https://avatars.githubusercontent.com/${name}?s=80`" :alt="name" width="40" height="40" loading="lazy" /></a>
    </div>

    <div class="g-community-foot">
      <p class="g-h3">{{ tr('MIT licensed. Built in the open.') }}</p>
      <nav ref="links" class="links" @focusout="onFocusOut">
        <a class="g-link" :href="LINKS.github" target="_blank" rel="noreferrer">GitHub</a>
        <a class="g-link" :href="LINKS.discord" target="_blank" rel="noreferrer">Discord</a>
        <span v-for="code in QR_CODES" :key="code.label" class="qr">
          <button type="button" class="g-link" :aria-expanded="qr === code.label" @click="qr = qr === code.label ? null : code.label">
            {{ tr(code.label) }}
          </button>
          <img v-if="qr === code.label" class="qr-card" :src="code.src" :alt="tr(code.alt)" width="140" height="140" />
        </span>
        <a class="g-link" :href="LINKS.openCollective" target="_blank" rel="noreferrer">Open Collective</a>
      </nav>
    </div>
  </section>
</template>
