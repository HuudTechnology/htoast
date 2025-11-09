<template>
  <div 
    class="fixed top-5 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 max-w-[400px] w-full px-4"
    ref="containerRef"
  >
    <div 
      v-for="toast in visibleToasts" 
      :key="toast.id"
      class="flex items-center gap-3 w-full max-w-[340px] min-h-[40px] relative overflow-hidden shadow-toast rounded-toast border transition-all duration-300"
      :class="[
        getThemeClasses(toast.type),
        toast.visible ? 'opacity-100 translate-y-0 animate-toast-in' : 'opacity-0 translate-y-[-10px] animate-toast-out'
      ]"
      @mouseenter="pauseProgress(toast)"
      @mouseleave="resumeProgress(toast)"
    >
      <div class="flex items-center gap-3 w-full justify-between px-2 py-1">
        <!-- Counter for hidden toasts -->
        <div 
          v-if="toast.showCounter"
          class="absolute top-[15px] right-1 left-[78%] h-1 flex items-center justify-center text-[10px] w-auto rounded-b-toast"
        >
          <span class="px-1.5 py-0.5 rounded-toast text-[10px] min-w-[16px] text-center inline-block font-medium" :class="getCounterClasses(toast.type)">
            {{ toast.counterValue }}
          </span>
        </div>
        
        <!-- Icon -->
        <div class="min-w-[30px] min-h-[30px] flex items-center justify-center text-[1.2rem]">
          <i :class="['bx', toast.icon]"></i>
        </div>
        
        <!-- Message -->
        <div class="text-xs font-medium leading-[1.4] flex-1 mr-2 truncate" :class="getThemeTextClasses(toast.type)">
          {{ toast.message }}
        </div>
        
        <!-- Undo button (conditionally shown) -->
        <div v-if="toast.undo" class="ml-auto">
          <button 
            @click.stop="handleUndo(toast)"
            class="bg-transparent border-none cursor-pointer text-xs font-semibold px-1.5 py-0.5 rounded transition-all duration-200 hover:underline"
            :class="getUndoButtonClasses(toast.type)"
          >
            UNDO
          </button>
        </div>
      </div>
      
      <!-- Progress bar (conditionally shown) -->
      <div v-if="toast.undo" class="absolute bottom-0 left-0 right-0 h-[3px] bg-opacity-5 overflow-hidden rounded-b-toast">
        <div 
          class="h-full rounded-b-toast-progress transition-[width] duration-100 ease-linear"
          :style="{ width: toast.progressWidth + '%' }"
          :class="getProgressBarClasses(toast.type)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useHtoastStore } from '../composables/useHtoast'

const { toasts, showHtoast, removeToast } = useHtoastStore()

const visibleToasts = ref([])
const queuedToasts = ref([])
const containerRef = ref(null)

const MAX_VISIBLE = 4
const DEFAULT_DURATION = 5000 // 5 seconds

const TOAST_TYPES = {
  success: { icon: 'bx-check-circle' },
  warning: { icon: 'bx-error-circle' },
  error: { icon: 'bx-x-circle' },
  info: { icon: 'bx-info-circle' }
}

// Expose showHtoast method to parent
defineExpose({ showHtoast })

// Theme classes based on Tailwind
const getThemeClasses = (type) => {
  const themes = {
    success: 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700',
    warning: 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700',
    error: 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700',
    info: 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
  }
  return themes[type] || themes.info
}

const getThemeTextClasses = (type) => {
  const themes = {
    success: 'text-gray-800 dark:text-gray-200',
    warning: 'text-gray-800 dark:text-gray-200',
    error: 'text-gray-800 dark:text-gray-200',
    info: 'text-gray-800 dark:text-gray-200'
  }
  return themes[type] || themes.info
}

const getCounterClasses = (type) => {
  const themes = {
    success: 'bg-green-500 text-white dark:bg-green-600',
    warning: 'bg-yellow-500 text-white dark:bg-yellow-600',
    error: 'bg-red-500 text-white dark:bg-red-600',
    info: 'bg-blue-500 text-white dark:bg-blue-600'
  }
  return themes[type] || themes.info
}

const getUndoButtonClasses = (type) => {
  const themes = {
    success: 'text-green-600 hover:bg-green-50/50 dark:text-green-400 dark:hover:bg-green-900/50',
    warning: 'text-yellow-600 hover:bg-yellow-50/50 dark:text-yellow-400 dark:hover:bg-yellow-900/50',
    error: 'text-red-600 hover:bg-red-50/50 dark:text-red-400 dark:hover:bg-red-900/50',
    info: 'text-blue-600 hover:bg-blue-50/50 dark:text-blue-400 dark:hover:bg-blue-900/50'
  }
  return themes[type] || themes.info
}

const getProgressBarClasses = (type) => {
  const themes = {
    success: 'bg-gradient-to-r from-green-500 to-green-400',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
    error: 'bg-gradient-to-r from-red-500 to-red-400',
    info: 'bg-gradient-to-r from-blue-500 to-blue-400'
  }
  return themes[type] || themes.info
}

// Add toast to visible list
const addToastToVisible = (toast) => {
  visibleToasts.value.unshift(toast)
  nextTick(() => {
    toast.visible = true
    startProgress(toast)
    setTimeout(() => removeToastInternal(toast), toast.duration)
  })
}

// Internal remove function
const removeToastInternal = (toast) => {
  toast.visible = false
  cancelAnimationFrame(toast.progressFrame)
  
  setTimeout(() => {
    visibleToasts.value = visibleToasts.value.filter(t => t.id !== toast.id)
    
    // Show next toast from queue if available
    if (queuedToasts.value.length > 0) {
      const nextToast = queuedToasts.value.shift()
      addToastToVisible(nextToast)
    }
    
    updateCounterOnFirstVisible()
  }, 350)
}

// Handle undo action
const handleUndo = (toast) => {
  cancelAnimationFrame(toast.progressFrame)
  toast.progressWidth = 100
  
  if (typeof toast.undoAction === 'function') {
    try {
      toast.undoAction()
    } catch (err) {
      console.error('Undo action failed:', err)
    }
  }
  
  // Visual feedback
  toast.message = 'Restored!'
  toast.undo = false
  
  // Auto-dismiss after undo
  setTimeout(() => removeToastInternal(toast), 1000)
}

// Progress bar management
const startProgress = (toast) => {
  if (!toast.undo) return
  
  let startTime = Date.now()
  
  const updateProgress = () => {
    const elapsedTime = Date.now() - startTime
    const progress = Math.min((elapsedTime / toast.duration) * 100, 100)
    toast.progressWidth = progress
    
    if (progress < 100) {
      toast.progressFrame = requestAnimationFrame(updateProgress)
    }
  }
  
  updateProgress()
}

const pauseProgress = (toast) => {
  if (!toast.undo || !toast.progressFrame) return
  cancelAnimationFrame(toast.progressFrame)
}

const resumeProgress = (toast) => {
  if (!toast.undo) return
  startProgress(toast)
}

// Counter management for hidden toasts
const updateCounterOnFirstVisible = () => {
  if (visibleToasts.value.length === 0) return
  
  // Reset all counters first
  visibleToasts.value.forEach(toast => {
    toast.showCounter = false
  })
  
  // Show counter on first visible toast if there are queued items
  if (queuedToasts.value.length > 0) {
    visibleToasts.value[0].showCounter = true
    visibleToasts.value[0].counterValue = queuedToasts.value.length
  }
  
  // Show countdown on toasts when there are more than 2 visible
  if (visibleToasts.value.length > 2) {
    visibleToasts.value.forEach((toast, index) => {
      if (index < 2) return // Skip first two
      
      toast.counterValue = Math.round((toast.duration - (Date.now() - toast.createdAt)) / 1000)
      toast.showCounter = true
      
      // Setup countdown interval
      const intervalId = setInterval(() => {
        const remaining = Math.round((toast.duration - (Date.now() - toast.createdAt)) / 1000)
        toast.counterValue = Math.max(0, remaining)
        
        if (remaining <= 0) {
          clearInterval(intervalId)
        }
      }, 1000)
      
      // Store interval ID for cleanup
      toast.countdownInterval = intervalId
    })
  }
}

// Watch for new toasts
toasts.value.forEach(toast => {
  if (visibleToasts.value.length < MAX_VISIBLE) {
    addToastToVisible(toast)
  } else {
    queuedToasts.value.push(toast)
    updateCounterOnFirstVisible()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  visibleToasts.value.forEach(toast => {
    cancelAnimationFrame(toast.progressFrame)
    if (toast.countdownInterval) {
      clearInterval(toast.countdownInterval)
    }
  })
  queuedToasts.value = []
})
</script>