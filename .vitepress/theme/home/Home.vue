<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import HomeHero from './HomeHero.vue'
import HomeLaravel from './HomeLaravel.vue'
import HomeFacades from './HomeFacades.vue'
import HomeLite from './HomeLite.vue'
import HomeSupport from './HomeSupport.vue'
import HomeOpenSource from './HomeOpenSource.vue'
import HomeFooter from './HomeFooter.vue'

const { localeIndex } = useData()
const isZh = computed(() => localeIndex.value === 'zh_CN')
</script>

<template>
  <div class="g-home">
    <HomeHero />
    <HomeLaravel />
    <HomeFacades />
    <HomeLite />
    <HomeSupport v-if="isZh" />
    <div class="g-wrap">
      <HomeOpenSource />
      <HomeFooter />
    </div>
  </div>
</template>
