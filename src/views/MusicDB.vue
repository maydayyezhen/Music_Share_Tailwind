<script setup>
import SongList from "@/components/SongList.vue";
import {onMounted, onUnmounted, ref, watch} from "vue";
import {
  apiGetAllSongs,
} from "@/api/song-api.js";
import {Song} from "@/models/song.js";
import {useAuthStore} from "@/stores/authStore.js";
import {apiGetCoverFileUrl} from "@/api/album-api.js";
const authStore = useAuthStore();
const songs = ref([{...Song}]);

const getAllSongs = async () => {
  const response = await apiGetAllSongs()
  songs.value = response.data;
}

const tagClasses = ref('');

const themeColorMap = {
  light: 'bg-white',             // 轻主题
  dark: 'bg-gray-100',           // 暗主题，改成较浅灰色
  cupcake: 'bg-pink-300',        // cupcake 主题
  bumblebee: 'bg-yellow-300',    // bumblebee 主题
  emerald: 'bg-green-300',       // emerald 主题
  corporate: 'bg-blue-300',      // corporate 主题
  synthwave: 'bg-purple-300',    // synthwave 主题
  retro: 'bg-red-300',           // retro 主题
  cyberpunk: 'bg-indigo-300',    // cyberpunk 主题
  valentine: 'bg-pink-400',      // valentine 主题
  halloween: 'bg-orange-300',    // halloween 主题
  garden: 'bg-green-400',        // garden 主题
  forest: 'bg-teal-300',         // forest 主题
  aqua: 'bg-teal-200',           // aqua 主题
  lofi: 'bg-yellow-200',         // lofi 主题
  pastel: 'bg-pink-200',         // pastel 主题
  fantasy: 'bg-purple-200',      // fantasy 主题
  wireframe: 'bg-gray-200',      // wireframe 主题
  black: 'bg-pink-500',          // black 主题改为亮粉色
  luxury: 'bg-yellow-400',       // luxury 主题
  dracula: 'bg-purple-400',      // dracula 主题
  cmyk: 'bg-cyan-50',  // 更浅的 cyan 颜色
  autumn: 'bg-orange-400',       // autumn 主题
  business: 'bg-blue-400',       // business 主题
  acid: 'bg-lime-300',           // acid 主题
  lemonade: 'bg-yellow-200',     // lemonade 主题
  night: 'bg-blue-400',          // night 主题
  coffee: 'bg-brown-400',        // coffee 主题
  winter: 'bg-sky-200' // winter 主题使用亮蓝色
};






onMounted(getAllSongs);

watch(
    () => authStore.theme, // 监听 `authStore.theme` 的变化
    (newTheme, oldTheme) => { // `newTheme` 是新的主题值，`oldTheme` 是变化前的主题值
      console.log('Theme changed from', oldTheme, 'to', newTheme); // 输出日志查看变化

      // 这里更新 `tagClasses`，根据新的主题值调整标签颜色
      tagClasses.value = themeColorMap[newTheme] || 'bg-gray-700 text-white'; // 默认使用灰色，如果没有匹配到主题
    },
    { immediate: true } // 只有 `theme` 变化时触发，不在初始加载时触发
);



</script>
<template>
  <div class="flex justify-center items-center">
    <div class="carousel w-full sm:w-full md:w-3/5 lg:w-1/2 h-auto sm:h-auto md:h-auto aspect-w-16 aspect-h-9 rounded-lg shadow-2xl">
      <div id="slide1" class="carousel-item relative w-full">
        <img
            src="https://images.unsplash.com/photo-1597577534602-722ff360b226?q=80&w=2643&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            class="w-full h-full object-cover" />
        <div class="absolute bottom-5 left-5 right-5 text-white text-2xl font-bold p-4 rounded-md text-center" style="font-family: 'Playfair Display', serif;">
          披头士传奇再现：终章《Let It Be》全新重制上线
        </div>
        <div class="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
          <a href="#slide4" class="btn btn-circle">❮</a>
          <a href="#slide2" class="btn btn-circle">❯</a>
        </div>
      </div>
      <div id="slide2" class="carousel-item relative w-full">
        <img
            src="https://images.unsplash.com/photo-1639023698782-71ef93c6af90?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            class="w-full h-full object-cover" />
        <div class="absolute bottom-5 left-5 right-5 text-white text-2xl font-bold p-4 rounded-md text-center" style="font-family: 'Playfair Display', serif;">
          2023年音乐盛宴：不容错过的热门歌曲推荐
        </div>
        <div class="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
          <a href="#slide1" class="btn btn-circle">❮</a>
          <a href="#slide3" class="btn btn-circle">❯</a>
        </div>
      </div>
      <div id="slide3" class="carousel-item relative w-full">
        <img
            src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            class="w-full h-full object-cover" />
        <div class="absolute bottom-5 left-5 right-5 text-white text-2xl font-bold p-4 rounded-md text-center" style="font-family: 'Playfair Display', serif;">
          摇滚乐的永恒经典：回顾那些让人热血沸腾的歌曲
        </div>
        <div class="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
          <a href="#slide2" class="btn btn-circle">❮</a>
          <a href="#slide4" class="btn btn-circle">❯</a>
        </div>
      </div>
      <div id="slide4" class="carousel-item relative w-full">
        <img
            src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            class="w-full h-full object-cover" />
        <div class="absolute bottom-5 left-5 right-5 text-white text-2xl font-bold p-4 rounded-md text-center" style="font-family: 'Playfair Display', serif;">
          梦幻旋律：探索那些让人陶醉的古典音乐
        </div>
        <div class="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
          <a href="#slide3" class="btn btn-circle">❮</a>
          <a href="#slide1" class="btn btn-circle">❯</a>
        </div>
      </div>
    </div>
  </div>
  <div class=" py-5 px-6 bg-base-300 shadow-2xl rounded-2xl">
    <h2 class="text-2xl font-bold mb-6">Discover music made by real artists</h2>
    <div class="flex gap-6 overflow-x-auto">
      <!-- Music Card -->
      <div class="w-48 shrink-0">
        <div class="relative group">
          <img src="https://telegra.ph/file/2acfcad8d39e49d95addd.jpg" class="rounded-lg" alt="Cover" />
          <!-- Play button -->
          <button class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 fill-white" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
        <div class="mt-3">
          <p class="font-semibold text-sm truncate">idk</p>
          <p class="text-gray-400 text-xs truncate">Highvyn, Taylor Shin</p>
        </div>
        <div class="mt-2 flex flex-wrap gap-1">
          <span :class="tagClasses" class="bg-gray-700 text-xs px-2 py-0.5 rounded-full">Pop</span>
          <span :class="tagClasses" class="bg-gray-700 text-xs px-2 py-0.5 rounded-full">Electronic</span>
        </div>
      </div>
      <!-- 可以复制上面的结构，改内容以增加多个卡片 -->
    </div>
  </div>

  <main class="grid place-items-center min-h-screen  p-5">
    <div>
      <h1 class="text-4xl sm:text-5xl md:text-7xl font-bold mb-5">为你推荐</h1>
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- CARD 1 -->
        <div class="bg-base-100 shadow-lg rounded-lg p-3 w-full md:w-72">
          <div class="relative group overflow-hidden rounded-lg">
            <img
                class="w-full h-auto block object-cover rounded-lg"
                src="https://telegra.ph/file/2acfcad8d39e49d95addd.jpg"
                alt="Album Cover"
            />
            <!-- Hover Overlay -->
            <div class="absolute inset-0 z-10 flex items-center justify-evenly
  bg-base-100 bg-opacity-0 group-hover:bg-opacity-60
  opacity-0 group-hover:opacity-100 transition duration-300">
              <!-- Like Button -->
              <button class=" hover:scale-110 transform transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                  <path d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
                </svg>
              </button>
              <!-- Play Button -->
              <button class=" hover:scale-110 transform transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-play-circle-fill" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z" />
                </svg>
              </button>
              <!-- More Button -->
              <button class=" hover:scale-110 transform transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                  <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
              </button>
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-lg font-semibold">Epoch</h3>
            <p class="text-base-content/80 text-sm">Tycho</p>
          </div>
        </div>

        <!-- END OF CARD 1 -->

        <!-- CARD 2 -->
        <div class="bg-base-100 shadow-lg rounded-lg p-3 w-full md:w-72">
          <div class="relative group overflow-hidden rounded-lg">
            <img
                class="w-full h-auto block object-cover rounded-lg"
                src="https://telegra.ph/file/2acfcad8d39e49d95addd.jpg"
                alt="Album Cover"
            />
            <!-- Hover Overlay -->
            <div class="absolute inset-0 z-10 flex items-center justify-evenly
  bg-base-100 bg-opacity-0 group-hover:bg-opacity-60
  opacity-0 group-hover:opacity-100 transition duration-300">
              <!-- Like Button -->
              <button class=" hover:scale-110 transform transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                  <path d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
                </svg>
              </button>
              <!-- Play Button -->
              <button class=" hover:scale-110 transform transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-play-circle-fill" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z" />
                </svg>
              </button>
              <!-- More Button -->
              <button class=" hover:scale-110 transform transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                  <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
              </button>
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-lg font-semibold">Epoch</h3>
            <p class="text-base-content/80 text-sm">Tycho</p>
          </div>
        </div>
        <!-- END OF CARD 2 -->

        <!-- CARD 3 -->
        <div class="bg-base-100 shadow-lg rounded-lg p-3 w-full md:w-72">
          <div class="relative group overflow-hidden rounded-lg">
            <img
                class="w-full h-auto block object-cover rounded-lg"
                src="https://telegra.ph/file/2acfcad8d39e49d95addd.jpg"
                alt="Album Cover"
            />
            <!-- Hover Overlay -->
            <div class="absolute inset-0 z-10 flex items-center justify-evenly
  bg-base-100 bg-opacity-0 group-hover:bg-opacity-60
  opacity-0 group-hover:opacity-100 transition duration-300">
              <!-- Like Button -->
              <button class=" hover:scale-110 transform transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                  <path d="M8 2.748l-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
                </svg>
              </button>
              <!-- Play Button -->
              <button class=" hover:scale-110 transform transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-play-circle-fill" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z" />
                </svg>
              </button>
              <!-- More Button -->
              <button class=" hover:scale-110 transform transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                  <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
              </button>
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-lg font-semibold">Epoch</h3>
            <p class="text-base-content/80 text-sm">Tycho</p>
          </div>
        </div>
        <!-- END OF CARD 3 -->
      </section>
    </div>
  </main>



  <SongList :songs="songs" @reload-songs="getAllSongs" />
</template>
<style scoped>

</style>