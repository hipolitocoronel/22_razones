<template>
  <div class="min-h-dvh bg-app flex flex-col items-center justify-center px-6 py-6">

    <!-- Branding -->
    <div class="text-center mb-6">
      <div class="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-2 shadow-brand">
        <Heart :size="26" class="text-brand" />
      </div>
      <h1 class="text-xl font-bold text-main" style="font-family: var(--font-heading)">22 Razones</h1>
      <p class="text-xs text-muted mt-1 italic">Porque una razón nunca es suficiente</p>
    </div>

    <Transition name="step" mode="out-in">
      <!-- Step 1: seleccionar usuario -->
      <div v-if="step === 'select'" key="select" class="w-full max-w-xs flex flex-col gap-6">
        <p class="text-center text-soft text-sm font-medium">¿Quién sos?</p>
        <div class="grid grid-cols-2 gap-4">
          <button
            v-for="user in USERS"
            :key="user.id"
            @click="selectUser(user)"
            class="card flex flex-col items-center gap-3 py-7 cursor-pointer active:scale-95 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              :class="user.bgClass"
            >
              {{ user.initial }}
            </div>
            <span class="text-sm font-semibold text-main">{{ user.name }}</span>
          </button>
        </div>
      </div>

      <!-- Step 2: PIN -->
      <div v-else key="pin" class="w-full max-w-xs flex flex-col items-center gap-5">

        <!-- Volver + usuario -->
        <div class="w-full flex items-center gap-3">
          <button
            @click="goBack"
            class="text-muted hover:text-soft cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Volver"
          >
            <ArrowLeft :size="20" />
          </button>
          <div class="flex items-center gap-2.5 flex-1">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
              :class="selectedUser?.bgClass"
            >
              {{ selectedUser?.initial }}
            </div>
            <span class="font-semibold text-main text-sm">{{ selectedUser?.name }}</span>
          </div>
        </div>

        <!-- Dots -->
        <div
          class="flex gap-4"
          role="status"
          :aria-label="`PIN: ${pin.length} de ${PIN_LENGTH} dígitos`"
        >
          <div
            v-for="i in PIN_LENGTH"
            :key="i"
            class="w-4 h-4 rounded-full transition-all duration-150"
            :class="[
              pin.length >= i
                ? (error ? 'bg-red-400 scale-110' : 'bg-brand scale-110')
                : 'bg-surface-2 border-2 border-app',
              error ? 'shake' : ''
            ]"
          />
        </div>

        <p v-if="errorMsg" role="alert" class="text-red-500 text-sm -mt-3 text-center">{{ errorMsg }}</p>
        <p v-else-if="selectedUser?.hint" class="text-xs text-muted -mt-3 text-center">{{ selectedUser.hint }}</p>

        <!-- Teclado numérico -->
        <div class="grid grid-cols-3 gap-3 w-full">
          <template v-for="(key, idx) in KEYPAD" :key="idx">
            <button
              v-if="key !== ''"
              @click="pressKey(key)"
              :disabled="loading"
              class="flex items-center justify-center rounded-2xl h-14 text-xl font-semibold cursor-pointer transition-all duration-100 active:scale-90 disabled:opacity-40"
              :class="key === '⌫' ? 'bg-surface-2 text-muted' : 'card text-main hover:shadow-app-md'"
              :aria-label="key === '⌫' ? 'Borrar' : key"
            >
              <Delete v-if="key === '⌫'" :size="20" />
              <span v-else>{{ key }}</span>
            </button>
            <div v-else />
          </template>
        </div>

        <div v-if="loading" class="flex items-center gap-2 text-sm text-muted">
          <Loader2 :size="16" class="animate-spin" /> Entrando...
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Heart, ArrowLeft, Loader2, Delete } from 'lucide-vue-next'

const PIN_LENGTH = 4
const PIN_PREFIX = 'el22_'
const KEYPAD = ['1','2','3','4','5','6','7','8','9','','0','⌫']

const USERS = [
  {
    id: 'user1',
    name: import.meta.env.VITE_USER1_NAME || 'Vos',
    email: import.meta.env.VITE_USER1_EMAIL,
    initial: (import.meta.env.VITE_USER1_NAME || 'V')[0].toUpperCase(),
    bgClass: 'bg-amber-500',
    hint: import.meta.env.VITE_USER1_HINT || '',
  },
  {
    id: 'user2',
    name: import.meta.env.VITE_USER2_NAME || 'Ella',
    email: import.meta.env.VITE_USER2_EMAIL,
    initial: (import.meta.env.VITE_USER2_NAME || 'E')[0].toUpperCase(),
    bgClass: 'bg-rose-400',
    hint: import.meta.env.VITE_USER2_HINT || '',
  },
]

const auth = useAuthStore()
const router = useRouter()

const step = ref('select')
const selectedUser = ref(null)
const pin = ref('')
const loading = ref(false)
const error = ref(false)
const errorMsg = ref('')

function selectUser(user) {
  selectedUser.value = user
  pin.value = ''
  error.value = false
  errorMsg.value = ''
  step.value = 'pin'
}

function goBack() {
  step.value = 'select'
  pin.value = ''
  error.value = false
  errorMsg.value = ''
}

async function pressKey(key) {
  if (loading.value) return
  if (key === '⌫') {
    pin.value = pin.value.slice(0, -1)
    error.value = false
    errorMsg.value = ''
    return
  }
  if (pin.value.length >= PIN_LENGTH) return
  pin.value += key
  if (pin.value.length === PIN_LENGTH) await submit()
}

async function submit() {
  loading.value = true
  error.value = false
  errorMsg.value = ''
  try {
    await auth.login(selectedUser.value.email, PIN_PREFIX + pin.value)
    router.push('/')
  } catch (e) {
    error.value = true
    errorMsg.value = isNetworkError(e) ? 'Error de conexión' : 'PIN incorrecto'
    setTimeout(() => {
      pin.value = ''
      error.value = false
      errorMsg.value = ''
    }, 900)
  } finally {
    loading.value = false
  }
}

function isNetworkError(e) {
  const msg = (e?.message || '').toLowerCase()
  return msg.includes('fetch') || msg.includes('network') || e?.name === 'TypeError'
}

function onKeyDown(e) {
  if (step.value !== 'pin') return
  if (/^[0-9]$/.test(e.key)) {
    pressKey(e.key)
  } else if (e.key === 'Backspace') {
    pressKey('⌫')
  } else if (e.key === 'Escape') {
    goBack()
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
.step-enter-active,
.step-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

@keyframes shake-x {
  0%, 100% { transform: translateX(0) scale(1.1); }
  20%, 60% { transform: translateX(-4px) scale(1.1); }
  40%, 80% { transform: translateX(4px) scale(1.1); }
}
.shake {
  animation: shake-x 400ms ease;
}
</style>
