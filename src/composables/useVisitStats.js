import { computed } from 'vue'

const EMPTY = { count: 0, avg: 0 }

export function useVisitStats(visits) {
  const byPlace = computed(() => {
    const map = new Map()
    for (const v of visits.value ?? []) {
      let s = map.get(v.place_id)
      if (!s) {
        s = { count: 0, scoreSum: 0, scoreCount: 0, avg: 0 }
        map.set(v.place_id, s)
      }
      s.count++
      if (v.score) {
        s.scoreSum += v.score
        s.scoreCount++
      }
    }
    for (const s of map.values()) {
      s.avg = s.scoreCount ? s.scoreSum / s.scoreCount : 0
    }
    return map
  })

  function statsFor(placeId) {
    return byPlace.value.get(placeId) ?? EMPTY
  }

  return { byPlace, statsFor }
}
