<script setup lang="ts">
/**
 * Open source. The numbers, the people who wrote it, and the two places to find them.
 * The contributor list and the group images are the ones the page has always carried.
 */
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
    <h2 class="g-h2">Open source.</h2>

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
      <p class="g-h3">MIT licensed. Built in the open.</p>
      <span class="links">
        <a class="g-link" href="https://github.com/goravel/goravel" target="_blank" rel="noreferrer">GitHub</a>
        <a class="g-link" href="https://discord.gg/cFc5csczzS" target="_blank" rel="noreferrer">Discord</a>
        <a class="g-link" href="https://opencollective.com/goravel" target="_blank" rel="noreferrer">Open Collective</a>
      </span>
    </div>

    <div class="g-places">
      <figure>
        <img src="/wechat.jpg" alt="WeChat group QR code" width="112" height="112" loading="lazy" />
        <figcaption class="g-small muted">WeChat group</figcaption>
      </figure>
      <figure>
        <a href="https://discord.gg/cFc5csczzS" target="_blank" rel="noreferrer" class="discord" aria-label="Discord">
          <svg viewBox="0 0 16 16" width="40" height="40" fill="currentColor" aria-hidden="true"><path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/></svg>
        </a>
        <figcaption class="g-small muted">Discord</figcaption>
      </figure>
      <figure>
        <img src="/reward-wechat.jpg" alt="WeChat reward QR code" width="112" height="112" loading="lazy" />
        <figcaption class="g-small muted">Support with WeChat</figcaption>
      </figure>
      <figure>
        <img src="/reward.png" alt="Open Collective QR code" width="112" height="112" loading="lazy" />
        <figcaption class="g-small muted">Open Collective</figcaption>
      </figure>
    </div>
  </section>
</template>
