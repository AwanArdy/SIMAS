<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)

async function handleLogin() {
  const success = await auth.login(username.value.trim(), password.value)
  if (success) {
    router.push({ name: 'dashboard' })
  }
}
</script>

<template>
  <!-- Latar gradient dengan dekorasi -->
  <div class="relative -mx-4 -my-8 overflow-hidden bg-gradient-to-br from-slate-100 via-emerald-50 to-teal-100 px-4 py-14 md:py-20">
    <div class="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl" aria-hidden="true" />
    <div class="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" aria-hidden="true" />

    <div class="relative mx-auto w-full max-w-md">
      <div class="overflow-hidden rounded-3xl shadow-2xl shadow-emerald-900/20 ring-1 ring-white/60">
        <!-- Header gradient -->
        <div class="panel-brand px-8 py-9 text-center text-white">
          <div class="pattern-islamic absolute inset-0" aria-hidden="true" />
          <div class="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-amber-300/20 blur-2xl" aria-hidden="true" />

          <div class="relative">
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/25 backdrop-blur-sm"
              aria-hidden="true"
            >
              <svg class="h-8 w-8 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 class="text-2xl font-extrabold tracking-tight">Login Pengurus</h1>
            <p class="mt-1.5 text-sm text-emerald-100/90">
              Masuk untuk mengelola kegiatan, kas, dan inventaris
            </p>
          </div>
        </div>

        <!-- Form -->
        <div class="bg-white p-8">
          <div
            v-if="auth.error"
            class="animate-toast-in mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700"
            role="alert"
          >
            <svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.345c-1.73 0-2.813-1.874-1.948-3.374L10.95 3.378c.866-1.5 3.032-1.5 3.898 0l8.555 14.748zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span>{{ auth.error }}</span>
          </div>

          <form class="space-y-5" @submit.prevent="handleLogin">
            <div>
              <label for="username" class="label-text">Username</label>
              <input
                id="username"
                v-model="username"
                type="text"
                required
                autocomplete="username"
                autofocus
                placeholder="Masukkan username"
                class="input"
              />
            </div>

            <div>
              <label for="password" class="label-text">Password</label>
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="input pr-12"
                />
                <button
                  type="button"
                  class="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="showPassword" class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                  <svg v-else class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" class="btn-primary w-full" :disabled="auth.loading">
              <span v-if="auth.loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              {{ auth.loading ? 'Memproses...' : 'Masuk' }}
            </button>
          </form>

          <div class="mt-6 border-t border-slate-100 pt-4 text-center">
            <router-link to="/" class="text-sm font-bold text-emerald-700 transition-colors hover:text-emerald-800 hover:underline">
              ← Kembali ke Beranda
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
