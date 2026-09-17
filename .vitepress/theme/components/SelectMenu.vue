<script setup lang="ts">
import { ref } from 'vue'
import { useDismiss } from '../dismiss'

defineProps<{ label: string; options: { text: string; link: string; note?: string; selected?: boolean }[] }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const onFocusOut = useDismiss(root, () => (open.value = false))
</script>

<template>
  <div ref="root" class="select" @focusout="onFocusOut">
    <button class="trigger" type="button" :aria-expanded="open" @click="open = !open">
      {{ label }}<span class="caret vpi-chevron-down" />
    </button>
    <div v-if="open" class="menu">
      <a v-for="o in options" :key="o.text" class="option" :class="{ selected: o.selected }" :href="o.link">
        {{ o.text }}<span v-if="o.note" class="note">{{ o.note }}</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.select {
  position: relative;
  display: flex;
}

.trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: var(--g-control);
  padding: 0 8px;
  border-radius: 2px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 500;
  color: var(--g-ink);
  transition: background-color 0.15s ease;
}

.trigger:hover,
.trigger[aria-expanded='true'] {
  background: var(--g-hover);
}

.caret {
  width: 14px;
  height: 14px;
  color: var(--g-grey);
  transition: transform 0.2s ease;
}

.trigger[aria-expanded='true'] .caret {
  transform: rotate(-90deg); /* the theme's down chevron is a right chevron turned 90deg */
}

.menu {
  position: absolute;
  top: calc(var(--g-control) + 8px);
  right: 0;
  z-index: 40;
  min-width: 168px;
  padding: 4px;
  border: 1px solid var(--g-line);
  border-radius: 2px;
  background: var(--g-white);
  box-shadow: 0 4px 12px rgba(16, 24, 32, 0.06);
}

.option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px 7px 8px;
  border-radius: 2px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  color: var(--g-ink);
}

.option:hover {
  background: var(--g-soft);
}

.option::before {
  content: '';
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  transform: rotate(45deg);
}

.selected {
  color: var(--g-cyan-text);
}

.selected::before {
  background: var(--g-cyan);
}

.note {
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--g-grey);
}
</style>
