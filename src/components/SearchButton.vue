<script setup>
import {ref, computed, onMounted, onBeforeUnmount} from 'vue'
import { useRouter } from 'vue-router'
import {apiGetAllArtists} from "@/api/artist-api.js";
import {apiGetAllAlbums} from "@/api/album-api.js";
import {apiGetAllSongs} from "@/api/song-api.js";
import {Album} from "@/models/album.js";
import {Song} from "@/models/song.js";
import {Artist} from "@/models/artist.js";


const router = useRouter()

// 显示与搜索状态
const showInput = ref(false)
const query = ref('')
const filteredResults = ref([])

// 原始数据
const artists = ref([{...Artist}])
const albums = ref([{...Album}])
const songs = ref([{...Song}])

// 加载数据
const getAllArtists = async () => {
  const response = await apiGetAllArtists()
  artists.value = response.data
}

const getAllAlbums = async () => {
  const response = await apiGetAllAlbums()
  albums.value = response.data
}

const getAllSongs = async () => {
  const response = await apiGetAllSongs()
  songs.value = response.data
}

onMounted(() => {
  getAllArtists()
  getAllAlbums()
  getAllSongs()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 整合所有数据为统一格式
const allItems = computed(() => [
  ...artists.value.map(artist => ({
    id: artist.id,
    name: artist.name,
    type: 'artist',
    route: `/artist_detail/${artist.id}`,
  })),
  ...albums.value.map(album => ({
    id: album.id,
    name: album.title,
    type: 'album',
    route: `/album_detail/${album.id}`,
  })),
  ...songs.value.map(song => ({
    id: song.id,
    name: song.title,
    type: 'song',
    route: `/song_detail/${song.id}`,
  })),
])

// 实时搜索匹配
const onInput = () => {
  const q = query.value.toLowerCase().trim()
  if (!q) {
    filteredResults.value = []
    return
  }
  filteredResults.value = allItems.value.filter(item =>
      item.name.toLowerCase().includes(q)
  )
}

// 跳转
const goTo = (item) => {
  router.push(item.route)
  resetSearch()
}

// 显示控制
const handleClickOutside = (event) => {
  const searchEl = document.getElementById('search-container')
  if (searchEl && !searchEl.contains(event.target)) {
    showInput.value = false
    resetSearch()
  }
}

const resetSearch = () => {
  query.value = ''
  filteredResults.value = []
}
</script>

<template>
  <div id="search-container" class="relative">
    <!-- 搜索按钮 -->
    <button @mouseenter="showInput = true" class="btn btn-ghost btn-circle">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>

    <!-- 搜索框 -->
    <div
        v-if="showInput"
        class="absolute top-0 right-full mr-2 bg-white shadow-lg rounded-md w-72 p-2 z-50"
    >
      <input
          v-model="query"
          type="text"
          placeholder="搜索歌手、专辑、歌曲..."
          class="w-full border border-gray-300 rounded p-2"
          @input="onInput"
      />
      <ul v-if="filteredResults.length" class="mt-2 max-h-60 overflow-auto">
        <li
            v-for="item in filteredResults"
            :key="`${item.type}-${item.id}`"
            class="p-2 hover:bg-gray-100 cursor-pointer"
            @click="goTo(item)"
        >
          <span class="font-semibold">{{ item.name }}</span>
          <span class="text-sm text-gray-500 ml-2">({{ item.type }})</span>
        </li>
      </ul>
    </div>
  </div>
</template>



