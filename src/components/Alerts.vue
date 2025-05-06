<script setup>
import {ref, watch} from "vue";
const props = defineProps(['alertType', 'alertMessage','triggerId']);
const toasts = ref([])
function showToast(type, message) {
  toasts.value.push({ type, message })
  setTimeout(() => {
    toasts.value.shift()
  }, 3000)
}
defineExpose({
  showToast
})

watch(props, (newProps) => {
  showToast(newProps.alertType, newProps.alertMessage)
})

</script>

<template>
  <div class="fixed top-18 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
    <div v-for="(toast, index) in toasts" :key="index">
      <div v-if="toast.type === 'info'" class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Info! {{ toast.message }}</span>
      </div>
      <div v-if="toast.type === 'success'" class="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Success! {{ toast.message }}</span>
      </div>
      <div v-else-if="toast.type === 'warning'" class="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Warning! {{ toast.message }}</span>
      </div>
      <div v-else-if="toast.type === 'error'" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Error! {{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>


<style scoped>

</style>