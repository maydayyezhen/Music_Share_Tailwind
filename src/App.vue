<script setup>
import NavBar from "@/components/NavBar.vue";
import {onMounted, onUnmounted, computed, ref} from "vue";
import { useAuthStore } from "@/stores/authStore.js";
import BarPlayer from "@/components/BarPlayer.vue";
import { useRoute } from "vue-router";
import {useMusicStore} from "@/stores/musicStore.js";
import router from "@/router/index.js";
import {
  Home,
  Library,
  Users,
  DiscAlbum,
  Music,
  BarChart,
  ListMusic,
  Radio,
  Clapperboard,
  Heart
} from 'lucide-vue-next' // or 'lucide-vue' depending on your setup

const authStore = useAuthStore();
const musicStore = useMusicStore();
const route = useRoute();

const hidePlayerRoutes = ["/","/login", "/register"];
const showPlayer = computed(() => {
  return !hidePlayerRoutes.includes(route.path) && !!musicStore.currentPlaylist.length;
});

const showSidebar = ref(false);
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

const navigate = (path) => {
  router.push(path)
}


const isActive = (item) => {
  return route.path === item.route
}

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
const sidebarItems = [
  { label: '推荐', icon: Home, route: '/' },
  { label: '曲库', icon: Library, route: '/music_db' },
  { label: '艺人管理', icon: Users, route: '/music_manage' },
  { label: '专辑管理', icon: DiscAlbum, route: '/album_manage' },
  { label: '歌曲管理', icon: Music, route: '/song_manage' },
  { label: '排行榜', icon: BarChart },
  { label: '分类歌单', icon: ListMusic },
  { label: '电台', icon: Radio },
  { label: 'MV', icon: Clapperboard },
  { label: '我的收藏', icon: Heart, route: '/user_likes' }
]
</script>

<template>
  <div class="h-screen overflow-hidden flex">
    <!-- 侧边栏 -->
    <aside
        v-show="showSidebar"
        class="h-screen w-64 bg-base-200 shadow-lg p-4 pt-20"
    >
      <ul class="menu space-y-2 text-sm font-medium w-full">
        <li
            v-for="item in sidebarItems"
            :key="item.label"
            @click="item.route && navigate(item.route)"
            :class="[
            'rounded cursor-pointer transition-colors duration-200 w-full',
            isActive(item) ? 'bg-primary text-primary-content font-semibold' : 'hover:bg-base-300'
          ]"
        >
          <a class="flex items-center gap-3 w-full block px-3 py-2">
            <component :is="item.icon" class="w-5 h-5 ml-1" />
            {{ item.label }}
          </a>
        </li>
      </ul>
    </aside>
    <nav-bar class="fixed top-0 z-[9999] w-full" @toggle-sidebar="toggleSidebar" />
    <!-- 主内容区域 -->
    <div class="flex-1 h-full overflow-hidden">

      <div :class="{ 'pb-24': showPlayer }" class="h-full overflow-hidden">
        <div class="h-full overflow-auto scrollbar scrollbar-thumb-base-content scrollbar-track-transparent">
          <router-view class="animate-fade-in" />
        </div>
      </div>
      <bar-player v-show="showPlayer" class="fixed bottom-0  left-0 right-0 z-[9999]" />
    </div>
  </div>
</template>



<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}
</style>

