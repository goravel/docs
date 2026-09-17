<script setup lang="ts">
import { computed } from 'vue'
import { tokenize } from './content'

const props = defineProps<{ code: string; lang?: 'go' | 'php'; numbered?: boolean; lit?: number[]; pair?: number }>()
const lines = computed(() => tokenize(props.code, props.lang))
</script>

<template>
  <pre class="g-code"><code><span
    v-for="(tokens, n) in lines"
    :key="n"
    class="ln"
    :class="{ 'is-lit': lit?.includes(n + 1), 'is-pair': pair === n + 1 }"
  ><span v-if="numbered" class="no">{{ n + 1 }}</span><span
    v-for="(token, i) in tokens"
    :key="i"
    :class="{ call: token.call }"
  >{{ token.text }}</span>
</span></code></pre>
</template>
