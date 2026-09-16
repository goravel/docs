<script setup lang="ts">
import { useData, withBase } from 'vitepress'

const { site } = useData()
const base = (path: string) => withBase(`/${path}`)

const suggestions = [
  ['Installation', 'getting-started/installation.html'],
  ['Routing', 'the-basics/routing.html'],
  ['Upgrading To v1.18 From v1.17', 'upgrade/v1.18.html'],
  ['Excellent Packages', 'getting-started/packages.html']
]
</script>

<template>
  <div class="goravel-404">
    <div class="left">
      <p class="code">404</p>
      <h1 class="title">This page does not exist.</h1>
      <p class="lead">It may have moved in a newer version of the docs, or the address may be wrong.</p>
      <a class="home" :href="base('')">Go to the documentation</a>
    </div>
    <div class="right">
      <span class="label">Try these</span>
      <a v-for="[text, link] in suggestions" :key="link" class="suggestion" :href="base(link)">{{ text }}</a>
    </div>
  </div>
</template>
