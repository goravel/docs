<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'

/**
 * Which release of the documentation you are reading.
 *
 * Only the documentation is versioned. goravel.dev is about the framework, not about a release
 * of it, so the marketing page and the 404 do not carry this. A page with a sidebar is a docs
 * page.
 *
 * The list names versions and nothing else. It used to print each one's hostname beside it,
 * which is where the docs happen to be deployed, not something a reader is choosing between.
 */
const versions = [
  { text: 'v1.18', note: 'Latest', link: 'https://www.goravel.dev/' },
  { text: 'v1.17', note: '', link: 'https://v117.goravel.dev/' },
  { text: 'v1.16', note: '', link: 'https://v116.goravel.dev/' }
]

const { frontmatter } = useData()
const isDocs = computed(
  () => frontmatter.value.layout !== 'goravel-home' && frontmatter.value.sidebar !== false
)

const open = ref(false)
const current = versions[0]
</script>

<template>
  <div v-if="isDocs" class="goravel-version" :class="{ open }">
    <button class="trigger" type="button" :aria-expanded="open" @click="open = !open">
      <span class="v">{{ current.text }}</span>
      <span class="caret" />
    </button>
    <div v-if="open" class="menu" role="listbox">
      <a
        v-for="v in versions"
        :key="v.text"
        class="option"
        :class="{ selected: v.text === current.text }"
        :href="v.link"
      >
        <span class="v">{{ v.text }}</span>
        <span v-if="v.note" class="note">{{ v.note }}</span>
      </a>
    </div>
  </div>
</template>
