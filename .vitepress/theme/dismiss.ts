import { onClickOutside, onKeyStroke } from '@vueuse/core'
import type { Ref } from 'vue'

// Closes a menu on Escape, on a click outside it, and when keyboard focus leaves it.
// A click outside is watched directly, since Safari does not focus a clicked button.
export function useDismiss(root: Ref<HTMLElement | null>, close: () => void) {
  onClickOutside(root, close)
  onKeyStroke('Escape', close)
  return (event: FocusEvent) => {
    if (!root.value?.contains(event.relatedTarget as Node)) close()
  }
}
