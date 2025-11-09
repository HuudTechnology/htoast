import { reactive, readonly } from 'vue'

// Singleton store for toasts
const toastStore = reactive({
  toasts: [],
  showHtoast(type, message, options = {}) {
    const { 
      undo = false, 
      undoAction = null, 
      duration = 5000
    } = options

    const toast = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type,
      message,
      icon: this.getToastIcon(type),
      undo,
      undoAction,
      duration,
      visible: false,
      progressWidth: 0,
      progressFrame: null,
      counterValue: 0,
      showCounter: false,
      createdAt: Date.now()
    }

    this.toasts.push(toast)
  },
  getToastIcon(type) {
    const icons = {
      success: 'bx-check-circle',
      warning: 'bx-error-circle',
      error: 'bx-x-circle',
      info: 'bx-info-circle'
    }
    return icons[type] || icons.info
  },
  removeToast(toast) {
    this.toasts = this.toasts.filter(t => t.id !== toast.id)
  }
})

export function useHtoast() {
  return {
    show: toastStore.showHtoast.bind(toastStore),
    remove: toastStore.removeToast.bind(toastStore),
    toasts: readonly(toastStore.toasts)
  }
}

export const useHtoastStore = () => toastStore