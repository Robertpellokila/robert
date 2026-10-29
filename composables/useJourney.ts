import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { getCinematicState } from '~/utils/cinematicJourney'

/**
 * v0.8.3 — One deliberate wheel gesture or touch swipe = one chapter.
 * The next gesture is accepted only after the current trip finishes AND
 * the previous wheel gesture has gone quiet. A huge deltaY cannot skip chapters.
 * Explicit navigation buttons may jump directly to a chapter.
 */
export function useJourney(chapterCount: number, canNavigate: () => boolean = () => true) {
  const journeyElement = shallowRef<HTMLElement | null>(null)
  const progress = ref(0)
  const activeIndex = computed(() => {
    const state = getCinematicState(progress.value)
    return Math.min(chapterCount - 1, state.leg + (state.phase === 'arrive' ? 1 : 0))
  })
  const progressPercent = computed(() => Math.round(progress.value * 100))
  const completedStop = ref(0)
  const travelling = ref(false)
  let generation = 0
  let activeTrigger: { kill: () => void } | undefined
  let stopWatching: (() => void) | undefined
  let tween: { kill: () => void } | undefined
  let wheelIdle: ReturnType<typeof setTimeout> | undefined
  let wheelGestureActive = false
  let touchStartY: number | null = null

  function getCurrentStop() {
    return Math.max(0, Math.min(chapterCount - 1, Math.round(progress.value * (chapterCount - 1))))
  }
  function getTop(index: number) {
    const sections = journeyElement.value?.querySelectorAll<HTMLElement>('.journey-section')
    const section = sections?.[index]
    return section ? section.getBoundingClientRect().top + window.scrollY : null
  }
  async function animateTo(index: number, direct = false) {
    if (typeof window === 'undefined') return
    const target = Math.max(0, Math.min(chapterCount - 1, index))
    const y = getTop(target)
    if (y === null) return
    tween?.kill()
    travelling.value = true
    const from = window.scrollY
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({ top: y, behavior: 'instant' })
      progress.value = target / (chapterCount - 1)
      completedStop.value = target
      travelling.value = false
      return
    }
    const { gsap } = await import('gsap')
    const position = { y: from }
    tween = gsap.to(position, {
      y,
      // Give the scroll animation time to show each vehicle and camera phase.
      duration: direct ? Math.max(.85, Math.min(2.7, Math.abs(target - getCurrentStop()) * .65)) : 2.15,
      ease: 'power1.inOut',
      onUpdate: () => window.scrollTo({ top: position.y, behavior: 'instant' }),
      onComplete: () => {
        window.scrollTo({ top: y, behavior: 'instant' })
        progress.value = target / (chapterCount - 1)
        completedStop.value = target
        travelling.value = false
      },
    })
  }
  function interactiveTarget(target: EventTarget | null) {
    return target instanceof Element && !!target.closest('button,a,input,textarea,select,.chapter-card,.mobile-tools-drawer,.room-object-panel,.room-explorer-controls,[role="dialog"]')
  }
  function step(direction: number) {
    if (!canNavigate() || travelling.value) return
    const next = Math.max(0, Math.min(chapterCount - 1, getCurrentStop() + direction))
    if (next !== getCurrentStop()) void animateTo(next)
  }
  function onWheel(event: WheelEvent) {
    if (!journeyElement.value || !canNavigate() || interactiveTarget(event.target) || event.ctrlKey) return
    event.preventDefault()
    if (Math.abs(event.deltaY) < 1.5) return
    // Trackpad inertial wheel events are ONE gesture, not 20 chapter changes.
    if (wheelIdle) clearTimeout(wheelIdle)
    wheelIdle = setTimeout(() => { wheelGestureActive = false }, 480)
    if (wheelGestureActive) return
    wheelGestureActive = true
    step(event.deltaY > 0 ? 1 : -1)
  }
  function onKeyDown(event: KeyboardEvent) {
    if (!journeyElement.value || !canNavigate() || interactiveTarget(event.target)) return
    const directions: Record<string, number> = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 }
    const direction = directions[event.key]
    if (!direction) return
    event.preventDefault()
    if (!event.repeat) step(direction)
  }
  function onTouchStart(event: TouchEvent) {
    if (!canNavigate() || interactiveTarget(event.target) || event.touches.length !== 1) { touchStartY = null; return }
    touchStartY = event.touches[0]?.clientY ?? null
  }
  function onTouchMove(event: TouchEvent) {
    if (touchStartY !== null && canNavigate() && event.cancelable) event.preventDefault()
  }
  function onTouchEnd(event: TouchEvent) {
    if (touchStartY === null || !canNavigate()) return
    const endY = event.changedTouches[0]?.clientY ?? touchStartY
    const dy = touchStartY - endY
    touchStartY = null
    if (Math.abs(dy) > 44) step(dy > 0 ? 1 : -1)
  }
  onMounted(() => {
    stopWatching = watch(journeyElement, async (element, _old, onCleanup) => {
      const id = ++generation
      activeTrigger?.kill()
      activeTrigger = undefined
      onCleanup(() => { generation++; activeTrigger?.kill(); activeTrigger = undefined })
      if (!element) return
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      if (id !== generation || !element.isConnected) return
      gsap.registerPlugin(ScrollTrigger)
      const trigger = ScrollTrigger.create({
        trigger: element, start: 'top top', end: 'bottom bottom',
        onUpdate: self => { progress.value = self.progress },
      })
      activeTrigger = trigger
      progress.value = trigger.progress
      completedStop.value = getCurrentStop()
      ScrollTrigger.refresh()
    }, { immediate: true, flush: 'post' })
    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true, capture: true })
  })
  onUnmounted(() => {
    generation++; stopWatching?.(); activeTrigger?.kill(); tween?.kill()
    if (wheelIdle) clearTimeout(wheelIdle)
    window.removeEventListener('wheel', onWheel, true)
    window.removeEventListener('keydown', onKeyDown, true)
    window.removeEventListener('touchstart', onTouchStart, true)
    window.removeEventListener('touchmove', onTouchMove, true)
    window.removeEventListener('touchend', onTouchEnd, true)
  })
  function goToChapter(index: number) { void animateTo(index, true) }
  return { journeyElement, progress, activeIndex, progressPercent, completedStop, travelling, goToChapter }
}
