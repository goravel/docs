<script setup lang="ts">
import { ref } from 'vue'
import { LINKS } from '../../links'
import { useDismiss } from '../dismiss'
import { useI18n } from '../i18n'

const { tr } = useI18n()

const STATS = [
  { value: '4,831', label: 'GitHub stars' },
  { value: '43', label: 'contributors' },
  { value: '271', label: 'forks' },
  { value: 'v1.18', label: 'current release' }
]

const PEOPLE = [
  'hwbrzzl', 'DevHaoZi', 'kkumar-gcc', 'almas-x', 'merouanekhalili', 'hongyukeji', 'sidshrivastav',
  'Juneezee', 'dragoonchang', 'dhanusaputra', 'mauri870', 'Marian0', 'ahmed3mar', 'flc1125',
  'zzpwestlife', 'juantarrel', 'Kamandlou', 'livghit', 'jeff87218', 'shayan-yousefi', 'zxdstyle',
  'milwad-dev', 'mdanialr', 'KlassnayaAfrodita', 'YlanzinhoY', 'gouguoyin', 'dzham', 'praem90',
  'vendion', 'tzsk', 'ycb1986', 'BadJacky', 'NiteshSingh17', 'alfanzain', 'oprudkyi', 'zoryamba',
  'oguzhankrcb', 'ChisThanh', 'wyicwx', 'LinboLen', 'president-tuychiyev', 'eddyjj92',
  'codedsultan'
]

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
      <div v-for="s in STATS" :key="s.label" class="g-stat">
        <span class="value">{{ s.value }}</span>
        <span class="g-body muted">{{ tr(s.label) }}</span>
      </div>
    </div>

    <div class="g-people">
      <a
        v-for="name in PEOPLE"
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
