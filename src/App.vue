<script setup>
import NavBar from "@/components/NavBar.vue";
import {onMounted, onUnmounted, computed, ref} from "vue";
import { useAuthStore } from "@/stores/authStore.js";
import BarPlayer from "@/components/BarPlayer.vue";
import SideBar from "@/components/SideBar.vue";
import { useRoute } from "vue-router";
import {useMusicStore} from "@/stores/musicStore.js";

const authStore = useAuthStore();
const musicStore = useMusicStore();
const route = useRoute();

// 不显示侧边栏的路由路径
const hideSidebarRoutes = ["/", "/login", "/register"];
const showSidebar = computed(() => !hideSidebarRoutes.includes(route.path));

// 不显示播放器的路由路径
const hidePlayerRoutes = ["/","/login", "/register"];
const showPlayer = computed(() => {
  return !hidePlayerRoutes.includes(route.path) && !!musicStore.currentSong?.id;
});


// 监听 token 状态变化（跨标签页同步）
const handleStorage = (event) => {
  if (event.key === "token" && event.newValue === null && authStore.isLoggedIn) {
    authStore.logout(false);
  }
  if (event.key === "token" && event.newValue !== null && !authStore.isLoggedIn) {
    authStore.autoLogin();
  }
};

onMounted(() => {
  window.addEventListener("storage", handleStorage);
  if (authStore.isLoggedIn) authStore.autoLogin();
});

onUnmounted(() => {
  window.removeEventListener("storage", handleStorage);
});
</script>

<template>
  <div>
    <!-- 顶部导航栏固定 -->
    <nav-bar class="fixed top-0 z-20 w-full" />

    <!-- 内容区域 -->
    <div :class="['pt-16 flex', showPlayer ? 'pb-84' : '']">
      <!-- 条件渲染侧边栏（仅在大屏且该页面需要显示时） -->
      <side-bar
          v-if="showSidebar"
          class="hidden lg:block fixed left-0 top-16 h-full w-80"
      />

      <!-- 主体内容区域，lg 屏幕下仅在显示侧边栏时添加 margin -->
      <div :class="['flex-1', showSidebar ? 'lg:ml-80' : '']">
        <router-view />
      </div>
    </div>

    <!-- 播放器 -->
    <bar-player v-show="showPlayer" />
  </div>
</template>

<style scoped>
</style>

