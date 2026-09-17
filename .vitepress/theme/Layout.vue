<script setup lang="ts">
import { nextTick, onMounted, watch } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import DocMeta from './components/DocMeta.vue'
import MethodIndex from './components/MethodIndex.vue'
import NotFound from './components/NotFound.vue'
import DocsFooterLinks from './components/DocsFooterLinks.vue'

const { Layout } = DefaultTheme
const route = useRoute()
const { page } = useData()

function drawCoverage() {
  if (!page.value.relativePath.includes('getting-started/packages')) return
  document.querySelectorAll<HTMLTableCellElement>('.vp-doc table td:last-child').forEach((cell) => {
    if (cell.querySelector('.goravel-coverage')) return
    const match = cell.textContent?.match(/([\d.]+)\s*%/)
    if (!match) return
    const value = Math.max(0, Math.min(100, parseFloat(match[1])))
    const bar = document.createElement('span')
    bar.className = 'goravel-coverage'
    bar.innerHTML = `<span class="track"><span class="fill" style="width:${value}%"></span></span>`
    cell.appendChild(bar)
  })
}

onMounted(drawCoverage)
watch(() => route.path, () => nextTick(drawCoverage))
</script>

<template>
  <Layout>
    <template #doc-before><DocMeta /></template>
    <template #aside-outline-after><MethodIndex /></template>
    <template #not-found><NotFound /></template>
    <template #layout-bottom><DocsFooterLinks /></template>
  </Layout>
</template>
