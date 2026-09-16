<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData, useRoute } from 'vitepress'

/**
 * The language of the documentation.
 *
 * Built exactly like the version chooser beside it: a word, a caret, and a list. The default
 * theme's control was a glyph button instead, so two controls doing the same job (pick one of a
 * short list) looked like two different kinds of thing sitting next to each other.
 */
const LOCALES = [
  { code: 'en', label: 'English', prefix: '' },
  { code: 'zh_CN', label: '简体中文', prefix: '/zh_CN' },
  { code: 'uz_UZ', label: "O'zbekcha", prefix: '/uz_UZ' }
]

const { lang } = useData()
const route = useRoute()
const open = ref(false)

const current = computed(() => {
  const path = route.path
  return (
    LOCALES.find((l) => l.prefix && path.startsWith(l.prefix + '/')) ||
    LOCALES.find((l) => l.code === (lang.value || '').replace('-', '_')) ||
    LOCALES[0]
  )
})

/** The same page in another language, when it exists; the language's root otherwise. */
function hrefFor(target: (typeof LOCALES)[number]) {
  let rest = route.path
  for (const l of LOCALES) {
    if (l.prefix && rest.startsWith(l.prefix + '/')) {
      rest = rest.slice(l.prefix.length)
      break
    }
  }
  return (target.prefix + rest) || '/'
}
</script>

<template>
  <div class="goravel-lang goravel-version" :class="{ open }">
    <button class="trigger" type="button" :aria-expanded="open" @click="open = !open">
      <span class="v">{{ current.label }}</span>
      <span class="caret" />
    </button>
    <div v-if="open" class="menu" role="listbox">
      <a
        v-for="l in LOCALES"
        :key="l.code"
        class="option"
        :class="{ selected: l.code === current.code }"
        :href="hrefFor(l)"
      >
        <span class="v">{{ l.label }}</span>
      </a>
    </div>
  </div>
</template>
