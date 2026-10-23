<script setup lang="ts">
import HomeHero from './HomeHero.vue'
import HomeLaravel from './HomeLaravel.vue'
import HomeFacades from './HomeFacades.vue'
import HomeLite from './HomeLite.vue'
import HomeOpenSource from './HomeOpenSource.vue'
import HomeFooter from './HomeFooter.vue'
</script>

<template>
  <div class="g-home">
    <HomeHero />
    <HomeLaravel />
    <HomeFacades />
    <HomeLite />
    <div class="g-wrap">
      <HomeOpenSource />
      <HomeFooter />
    </div>
  </div>
</template>
