import { onBeforeUnmount, onMounted, ref } from 'vue'

/* Step through a section's examples while it is on screen, until the reader picks one. */
export function useCycle(count: number | (() => number), ms: number, threshold = 0.35) {
  const index = ref(0)
  const root = ref<HTMLElement | null>(null)
  let held = false
  let inView = false
  let timer: ReturnType<typeof setInterval> | undefined
  let observer: IntersectionObserver | undefined

  function stop() {
    clearInterval(timer)
    timer = undefined
  }

  function start() {
    if (timer || held || !inView || document.hidden) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    timer = setInterval(() => {
      const n = typeof count === 'function' ? count() : count
      index.value = (index.value + 1) % (n || 1)
    }, ms)
  }

  /* The reader chose one: stop moving and stay where they put it. */
  function set(i: number) {
    held = true
    stop()
    index.value = i
  }

  const onVisibility = () => (document.hidden ? stop() : start())

  onMounted(() => {
    observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        inView ? start() : stop()
      },
      { threshold }
    )
    if (root.value) observer.observe(root.value)
    document.addEventListener('visibilitychange', onVisibility)
  })

  onBeforeUnmount(() => {
    stop()
    observer?.disconnect()
    document.removeEventListener('visibilitychange', onVisibility)
  })

  return { index, set, root }
}
