import { ref, watchEffect } from 'vue'
import {
  useDocumentVisibility,
  useEventListener,
  useIntersectionObserver,
  useIntervalFn,
  usePreferredReducedMotion
} from '@vueuse/core'

export function useTicker(ms: number, threshold = 0.3) {
  const ticks = ref(0)
  const root = ref<HTMLElement | null>(null)
  const inView = ref(false)
  const focused = ref(false)
  const visibility = useDocumentVisibility()
  const motion = usePreferredReducedMotion()
  const wait = ref(700)

  const { pause, resume } = useIntervalFn(
    () => {
      ticks.value++
      wait.value = ms
    },
    wait,
    { immediate: false }
  )

  useIntersectionObserver(root, ([entry]) => (inView.value = entry.isIntersecting), { threshold })
  useEventListener(root, 'focusin', () => (focused.value = !!root.value?.querySelector(':focus-visible')))
  useEventListener(root, 'focusout', () => (focused.value = false))

  watchEffect(() =>
    inView.value && !focused.value && visibility.value === 'visible' && motion.value !== 'reduce' ? resume() : pause()
  )

  return { ticks, root }
}
