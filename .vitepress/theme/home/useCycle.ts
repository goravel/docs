import { ref, watchEffect } from 'vue'
import {
  useDocumentVisibility,
  useElementHover,
  useFocusWithin,
  useIntersectionObserver,
  useIntervalFn,
  usePreferredReducedMotion
} from '@vueuse/core'

// steps through a section's examples while it is on screen, until the reader picks one
export function useCycle(count: number | (() => number), ms: number, threshold = 0.35, limit = Infinity) {
  const index = ref(0)
  const root = ref<HTMLElement | null>(null)
  const held = ref(false)
  const inView = ref(false)
  const visibility = useDocumentVisibility()
  const motion = usePreferredReducedMotion()
  const hovered = useElementHover(root)
  const { focused } = useFocusWithin(root)
  let ticks = 0
  const wait = ref(700)

  const length = () => (typeof count === 'function' ? count() : count) || 1
  const { pause, resume } = useIntervalFn(
    () => {
      index.value = (index.value + 1) % length()
      wait.value = ms
      if (++ticks >= limit) held.value = true
    },
    wait,
    { immediate: false }
  )
  useIntersectionObserver(root, ([entry]) => (inView.value = entry.isIntersecting), { threshold })
  watchEffect(() =>
    inView.value && !held.value && !hovered.value && !focused.value && visibility.value === 'visible' && motion.value !== 'reduce'
      ? resume()
      : pause()
  )

  const set = (i: number) => {
    held.value = true
    index.value = i
  }

  const hold = () => (held.value = true)

  return { index, set, hold, root }
}
