<template>
  <Transition name="toast">
    <div
      v-if="state.visible"
      :key="state.id"
      role="alert"
      aria-live="polite"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
      :class="state.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
    >
      <CheckCircle v-if="state.type === 'success'" :size="16" />
      <XCircle v-else :size="16" />
      {{ state.message }}
    </div>
  </Transition>
</template>

<script setup>
import { CheckCircle, XCircle } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

const { state } = useToast()
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-12px); }
</style>
