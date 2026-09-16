<script setup lang="ts">
import { ref } from 'vue'

/** The version of the docs you are reading, at the top of the sidebar, as drawn. */
const versions = [
  { text: 'v1.18', note: 'Latest', link: 'https://www.goravel.dev/', host: 'goravel.dev' },
  { text: 'v1.17', note: '', link: 'https://v117.goravel.dev/', host: 'v117.goravel.dev' },
  { text: 'v1.16', note: '', link: 'https://v116.goravel.dev/', host: 'v116.goravel.dev' }
]
const open = ref(false)
const current = versions[0]
</script>

<template>
  <div class="goravel-version" :class="{ open }">
    <button class="trigger" type="button" :aria-expanded="open" @click="open = !open">
      <span class="v">{{ current.text }}</span>
      <span class="note">{{ current.note }}</span>
      <span class="caret" />
    </button>
    <div v-if="open" class="menu" role="listbox">
      <a v-for="v in versions" :key="v.text" class="option" :class="{ selected: v.text === current.text }" :href="v.link">
        <span class="v">{{ v.text }}</span>
        <span v-if="v.note" class="note">{{ v.note }}</span>
        <span class="host">{{ v.host }}</span>
      </a>
    </div>
  </div>
</template>
