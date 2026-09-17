<script setup lang="ts">
import { ref } from 'vue'
import { useHomeI18n } from './i18n'

const { tr } = useHomeI18n()

const QR_CODES = [
  { label: 'WeChat group', src: '/wechat.jpg', alt: 'WeChat group QR code' },
  { label: 'Support with WeChat', src: '/reward-wechat.jpg', alt: 'WeChat reward QR code' }
]
const qr = ref<string | null>(null)
const onFocusOut = (e: FocusEvent) => {
  if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) qr.value = null
}
const STATS = [
  { value: '4,831', label: 'GitHub stars' },
  { value: '43', label: 'contributors' },
  { value: '271', label: 'forks' },
  { value: 'v1.18', label: 'current release' }
]

const PEOPLE = [
  { name: 'hwbrzzl', img: 'https://avatars.githubusercontent.com/u/24771476?v=4' },
  { name: 'DevHaoZi', img: 'https://avatars.githubusercontent.com/u/115467771?v=4' },
  { name: 'kkumar-gcc', img: 'https://avatars.githubusercontent.com/u/84431594?v=4' },
  { name: 'almas-x', img: 'https://avatars.githubusercontent.com/u/9382335?v=4' },
  { name: 'merouanekhalili', img: 'https://avatars.githubusercontent.com/u/1122628?v=4' },
  { name: 'hongyukeji', img: 'https://avatars.githubusercontent.com/u/23145983?v=4' },
  { name: 'sidshrivastav', img: 'https://avatars.githubusercontent.com/u/28773690?v=4' },
  { name: 'Juneezee', img: 'https://avatars.githubusercontent.com/u/20135478?v=4' },
  { name: 'dragoonchang', img: 'https://avatars.githubusercontent.com/u/1432336?v=4' },
  { name: 'dhanusaputra', img: 'https://avatars.githubusercontent.com/u/35093673?v=4' },
  { name: 'mauri870', img: 'https://avatars.githubusercontent.com/u/10168637?v=4' },
  { name: 'Marian0', img: 'https://avatars.githubusercontent.com/u/624592?v=4' },
  { name: 'ahmed3mar', img: 'https://avatars.githubusercontent.com/u/12982325?v=4' },
  { name: 'flc1125', img: 'https://avatars.githubusercontent.com/u/14297703?v=4' },
  { name: 'zzpwestlife', img: 'https://avatars.githubusercontent.com/u/12382180?v=4' },
  { name: 'juantarrel', img: 'https://avatars.githubusercontent.com/u/7213379?v=4' },
  { name: 'Kamandlou', img: 'https://avatars.githubusercontent.com/u/77993374?v=4' },
  { name: 'livghit', img: 'https://avatars.githubusercontent.com/u/108449432?v=4' },
  { name: 'jeff87218', img: 'https://avatars.githubusercontent.com/u/29706585?v=4' },
  { name: 'shayan-yousefi', img: 'https://avatars.githubusercontent.com/u/19957980?v=4' },
  { name: 'zxdstyle', img: 'https://avatars.githubusercontent.com/u/38398954?v=4' },
  { name: 'milwad-dev', img: 'https://avatars.githubusercontent.com/u/98118400?v=4' },
  { name: 'mdanialr', img: 'https://avatars.githubusercontent.com/u/48054961?v=4' },
  { name: 'KlassnayaAfrodita', img: 'https://avatars.githubusercontent.com/u/113383200?v=4' },
  { name: 'YlanzinhoY', img: 'https://avatars.githubusercontent.com/u/102574758?v=4' },
  { name: 'gouguoyin', img: 'https://avatars.githubusercontent.com/u/13517412?v=4' },
  { name: 'dzham', img: 'https://avatars.githubusercontent.com/u/10853451?v=4' },
  { name: 'praem90', img: 'https://avatars.githubusercontent.com/u/6235720?v=4' },
  { name: 'vendion', img: 'https://avatars.githubusercontent.com/u/145018?v=4' },
  { name: 'tzsk', img: 'https://avatars.githubusercontent.com/u/13273787?v=4' },
  { name: 'ycb1986', img: 'https://avatars.githubusercontent.com/u/12908032?v=4' },
  { name: 'BadJacky', img: 'https://avatars.githubusercontent.com/u/113529280?v=4' },
  { name: 'NiteshSingh17', img: 'https://avatars.githubusercontent.com/u/79739154?v=4' },
  { name: 'alfanzain', img: 'https://avatars.githubusercontent.com/u/4216529?v=4' },
  { name: 'oprudkyi', img: 'https://avatars.githubusercontent.com/u/3018472?v=4' },
  { name: 'zoryamba', img: 'https://avatars.githubusercontent.com/u/21248500?v=4' },
  { name: 'oguzhankrcb', img: 'https://avatars.githubusercontent.com/u/7572058?v=4' },
  { name: 'ChisThanh', img: 'https://avatars.githubusercontent.com/u/93512710?v=4' },
  { name: 'wyicwx', img: 'https://avatars.githubusercontent.com/u/1241187?v=4' },
  { name: 'LinboLen', img: 'https://avatars.githubusercontent.com/u/5467712?v=4' },
  { name: 'president-tuychiyev', img: 'https://avatars.githubusercontent.com/u/68532523?v=4' },
  { name: 'eddyjj92', img: 'https://avatars.githubusercontent.com/u/96251056?v=4' },
  { name: 'codedsultan', img: 'https://avatars.githubusercontent.com/u/86793301?v=4' }
]
</script>

<template>
  <section class="g-community">
    <h2 class="g-h2">{{ tr('Open source.') }}</h2>

    <div class="g-stats">
      <div v-for="s in STATS" :key="s.label" class="g-stat">
        <span class="value">{{ s.value }}</span>
        <span class="g-body muted">{{ s.label }}</span>
      </div>
    </div>

    <div class="g-people">
      <a
        v-for="p in PEOPLE"
        :key="p.name"
        class="g-person"
        :href="`https://github.com/${p.name}`"
        target="_blank"
        rel="noreferrer"
        :title="p.name"
      ><img :src="p.img" :alt="p.name" width="40" height="40" loading="lazy" /></a>
    </div>

    <div class="g-community-foot">
      <p class="g-h3">{{ tr('MIT licensed. Built in the open.') }}</p>
      <nav class="links" @focusout="onFocusOut" @keydown.escape="qr = null">
        <a class="g-link" href="https://github.com/goravel/goravel" target="_blank" rel="noreferrer">GitHub</a>
        <a class="g-link" href="https://discord.gg/cFc5csczzS" target="_blank" rel="noreferrer">Discord</a>
        <span v-for="code in QR_CODES" :key="code.label" class="qr">
          <button type="button" class="g-link" :aria-expanded="qr === code.label" @click="qr = qr === code.label ? null : code.label">
            {{ tr(code.label) }}
          </button>
          <img v-if="qr === code.label" class="qr-card" :src="code.src" :alt="tr(code.alt)" width="140" height="140" />
        </span>
        <a class="g-link" href="https://opencollective.com/goravel" target="_blank" rel="noreferrer">Open Collective</a>
      </nav>
    </div>
  </section>
</template>
