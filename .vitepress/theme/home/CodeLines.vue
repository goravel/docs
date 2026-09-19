<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ code: string; lang?: 'go' | 'php'; numbered?: boolean; lit?: number[]; pair?: number }>()

function tokenize(src: string, marker: 'go' | 'php' = 'go') {
  const re = marker === 'go' ? /(\[\[[^\]]+\]\])/ : /(\{\{[^}]+\}\})/
  return src.split('\n').map((line) =>
    line.split(re).filter(Boolean).map((part) => {
      const call = marker === 'go' ? part.startsWith('[[') : part.startsWith('{{')
      return { call, text: call ? part.slice(2, -2) : part }
    })
  )
}

const lines = computed(() => tokenize(props.code, props.lang))
</script>

<template>
  <pre class="g-code"><code><span
    v-for="(tokens, n) in lines"
    :key="n"
    class="ln"
    :class="{ 'is-lit': lit?.includes(n + 1), 'is-pair': pair === n + 1, 'is-note': /^\s*(\/\/|#)/.test(tokens[0]?.text ?? '') }"
  ><span v-if="numbered" class="no">{{ n + 1 }}</span><span
    v-for="(token, i) in tokens"
    :key="i"
    :class="{ call: token.call }"
  >{{ token.text }}</span>
</span></code></pre>
</template>
