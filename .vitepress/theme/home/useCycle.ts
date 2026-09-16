import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * A section that walks through its own examples while it is on screen.
 *
 * The homepage should not need to be clicked to be read. Each section advances itself while it is
 * in view, stops the moment the reader takes over, and never runs when it is off screen, when the
 * tab is hidden, or when the reader has asked for less motion.
 */
export function useCycle(count: number, ms: number) {
  const index = ref(0)
  const root = ref<HTMLElement | null>(null)
  const held = ref(false) // the reader has taken over

  let timer: ReturnType<typeof setInterval> | null = null
  let inView = false

  const reduced = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function start() {
    if (timer || held.value || !inView || reduced() || document.hidden) return
    timer = setInterval(() => {
      index.value = (index.value + 1) % count
    }, ms)
  }

  /** The reader chose one: stop moving and stay where they put it. */
  function set(i: number) {
    held.value = true
    stop()
    index.value = i
  }

  function onVisibility() {
    document.hidden ? stop() : start()
  }

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        inView ? start() : stop()
      },
      { threshold: 0.35 }
    )
    if (root.value) observer.observe(root.value)
    document.addEventListener('visibilitychange', onVisibility)
  })

  onBeforeUnmount(() => {
    stop()
    observer?.disconnect()
    document.removeEventListener('visibilitychange', onVisibility)
  })

  return { index, set, root, held }
}

/**
 * Walks the pairs of matching lines between two files, one pair at a time, so the reader is shown
 * which line becomes which instead of being asked to trace a curve across a gutter.
 */
export function usePairs(pairsFor: () => [number, number][], ms: number) {
  const step = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null
  let inView = false
  const root = ref<HTMLElement | null>(null)

  const reduced = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function start() {
    if (timer || !inView || reduced() || document.hidden) return
    timer = setInterval(() => {
      const n = pairsFor().length || 1
      step.value = (step.value + 1) % n
    }, ms)
  }

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        inView ? start() : stop()
      },
      { threshold: 0.3 }
    )
    if (root.value) observer.observe(root.value)
  })

  onBeforeUnmount(() => {
    stop()
    observer?.disconnect()
  })

  return { step, root }
}
