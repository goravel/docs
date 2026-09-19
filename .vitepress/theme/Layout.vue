<script setup lang="ts">
import DefaultTheme from 'vitepress/theme-without-fonts'
import DocMeta from './components/DocMeta.vue'
import MethodIndex from './components/MethodIndex.vue'
import NotFound from './components/NotFound.vue'
import DocsFooterLinks from './components/DocsFooterLinks.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #doc-before><DocMeta /></template>
    <template #aside-outline-after><MethodIndex /></template>
    <template #not-found><NotFound /></template>
    <template #layout-bottom><DocsFooterLinks /></template>
  </Layout>
</template>
