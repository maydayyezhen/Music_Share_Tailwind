import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
    const showSidebar = ref(false)

    const toggleSidebar = () => {
        showSidebar.value = !showSidebar.value
    }

    const openSidebar = () => {
        showSidebar.value = true
    }

    const closeSidebar = () => {
        showSidebar.value = false
    }

    return {
        showSidebar,
        toggleSidebar,
        openSidebar,
        closeSidebar
    }
})
