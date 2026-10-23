import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
}

let nextId = 1

export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastItem[]>([])

  function push(type: ToastType, message: string, duration = 3500): void {
    const id = nextId++
    items.value.push({ id, type, message })
    window.setTimeout(() => dismiss(id), duration)
  }

  function success(message: string): void {
    push('success', message)
  }

  function error(message: string): void {
    push('error', message, 5000)
  }

  function info(message: string): void {
    push('info', message)
  }

  function dismiss(id: number): void {
    items.value = items.value.filter((t) => t.id !== id)
  }

  return { items, push, success, error, info, dismiss }
})
