<script setup lang="ts">
import { useI18n } from '../i18n'

defineProps<{ value: boolean }>()

const { tr } = useI18n()

const checkClass = 'icon-[lucide--check] support-mark-yes'
const crossClass = 'icon-[lucide--x] support-mark-no'
</script>

<template>
  <span
    :class="value ? checkClass : crossClass"
    role="img"
    :aria-label="value ? tr('Included') : tr('Not included')"
  />
</template>

<style scoped>
.support-mark-yes,
.support-mark-no {
  display: block;
  width: 17px;
  height: 17px;
  margin: 3px 0;
}

.support-mark-yes {
  color: var(--g-cyan);
}

.support-mark-no {
  color: var(--g-grey);
}
</style>
