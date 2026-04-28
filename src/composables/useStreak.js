import { computed } from 'vue'

function monthKey(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function diffMonths(keyA, keyB) {
  const [yA, mA] = keyA.split('-').map(Number)
  const [yB, mB] = keyB.split('-').map(Number)
  return (yA - yB) * 12 + (mA - mB)
}

function uniqueMonthsDesc(visits) {
  return [...new Set(visits.map(v => monthKey(v.date)))].sort().reverse()
}

export function useCurrentStreak(visits) {
  return computed(() => {
    const months = uniqueMonthsDesc(visits.value ?? [])
    if (!months.length) return 0
    let count = 1
    for (let i = 1; i < months.length; i++) {
      if (diffMonths(months[i - 1], months[i]) === 1) count++
      else break
    }
    return count
  })
}

export function useBestStreak(visits) {
  return computed(() => {
    const months = uniqueMonthsDesc(visits.value ?? []).reverse()
    if (!months.length) return 0
    let best = 1
    let current = 1
    for (let i = 1; i < months.length; i++) {
      if (diffMonths(months[i], months[i - 1]) === 1) {
        current++
        if (current > best) best = current
      } else {
        current = 1
      }
    }
    return best
  })
}
