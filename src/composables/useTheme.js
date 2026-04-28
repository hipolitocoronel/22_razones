import { ref, watchEffect } from 'vue'

const saved = localStorage.getItem('theme')
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
const isDark = ref(saved ? saved === 'dark' : !!prefersDark)
const followSystem = ref(!saved)

if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (followSystem.value) isDark.value = e.matches
  })
}

watchEffect(() => {
  const html = document.documentElement
  if (isDark.value) html.classList.add('dark')
  else html.classList.remove('dark')
})

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
    followSystem.value = false
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }
  return { isDark, toggle }
}
