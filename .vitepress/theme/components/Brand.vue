<script setup lang="ts">
defineProps<{ laravel?: boolean; goravel?: boolean; no?: boolean }>()
</script>

<template>
  <span class="brand" :class="{ 'is-no': no }" aria-hidden="true">
    <span v-if="laravel" class="brand-mark icon-[simple-icons--laravel]" />
    <img v-else-if="goravel" class="brand-mark" src="/logo.svg" alt="" width="14" height="14" />
    <span v-if="no" class="brand-state icon-[lucide--x]" />
  </span>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: 8px;
  vertical-align: -2px;
}

.brand-mark {
  width: 14px;
  height: 14px;
  color: var(--g-laravel);
}

.brand-state {
  width: 14px;
  height: 14px;
  color: var(--g-grey);
}

.brand.is-no .brand-mark {
  color: var(--g-grey);
  opacity: 0.45;
  filter: grayscale(1);
}
</style>
