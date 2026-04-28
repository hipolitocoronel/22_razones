import { ref, onMounted, onUnmounted } from 'vue'
import { useHaptic } from './useHaptic'

export function usePullToRefresh(onRefresh, threshold = 80) {
  const pulling = ref(false)
  const progress = ref(0)
  const triggered = ref(false)

  const haptic = useHaptic()
  let startY = 0
  let currentDelta = 0
  let active = false
  let crossed = false

  function onTouchStart(e) {
    if (triggered.value) return
    if (window.scrollY > 0) return
    startY = e.touches[0].clientY
    active = true
    crossed = false
  }

  function onTouchMove(e) {
    if (!active || triggered.value) return
    const delta = e.touches[0].clientY - startY
    if (delta <= 0) {
      pulling.value = false
      progress.value = 0
      currentDelta = 0
      return
    }
    if (window.scrollY > 0) {
      active = false
      pulling.value = false
      progress.value = 0
      return
    }
    currentDelta = delta
    pulling.value = true
    progress.value = Math.min(1, delta / threshold)
    if (progress.value >= 1 && !crossed) {
      crossed = true
      haptic.light()
    }
  }

  async function onTouchEnd() {
    if (!active) return
    active = false
    const shouldFire = currentDelta >= threshold && !triggered.value
    pulling.value = false
    if (shouldFire) {
      triggered.value = true
      try {
        await onRefresh()
      } finally {
        triggered.value = false
        progress.value = 0
      }
    } else {
      progress.value = 0
    }
    currentDelta = 0
  }

  onMounted(() => {
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)
  })

  onUnmounted(() => {
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
    window.removeEventListener('touchcancel', onTouchEnd)
  })

  return { pulling, progress, triggered }
}
