<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiGetAllArtists, apiGetArtistAvatarFileUrl } from '@/api/artist-api.js'

// 数据和状态
const artists = ref([])            // 存储所有歌手数据
const selectedArtist = ref(null)   // 存储选择的歌手
const selectedArtistName = ref('') // 存储输入框的值

// 获取歌手数据
const getAllArtists = async () => {
  const response = await apiGetAllArtists()
  artists.value = response.data

  // 获取每个歌手的头像
  for (const artist of artists.value) {
    artist.avatar = await apiGetArtistAvatarFileUrl(artist.avatarUrl)
  }

  // 如果有歌手，默认选择第一个
  if (artists.value.length > 0) {
    selectedArtist.value = artists.value[0]
    selectedArtistName.value = selectedArtist.value.name
  }
}

// 选择歌手
const selectArtist = (artist) => {
  selectedArtist.value = artist
  selectedArtistName.value = artist.name
}

// 获取过滤后的歌手列表
const filteredArtists = computed(() => {
  // 只有当输入框内容不等于选中的歌手名字时才进行过滤
  if (selectedArtistName.value !== selectedArtist.value?.name) {
    return artists.value.filter(artist =>
        artist.name.toLowerCase().includes(selectedArtistName.value.toLowerCase())
    )
  }
  return artists.value // 输入框内容与选中的歌手名字一致时，显示所有歌手
})

// 页面加载时获取数据
onMounted(() => {
  getAllArtists()
})
</script>

<template>
  <div class="dropdown dropdown-end">
    <!-- 输入框部分 -->
    <div class="input flex items-center gap-3 hover:bg-base-200">
      <img
          v-if="selectedArtist"
          :src="selectedArtist.avatar"
          class="size-10 rounded-box object-cover"
          alt="artist"
      />
      <input
          v-model="selectedArtistName"
          class="flex-1 bg-transparent border-none outline-none text-sm"
          placeholder="选择歌手"
      />
      <svg
          class="w-3 h-3 fill-current opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
      >
        <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
      </svg>
    </div>

    <!-- 歌手列表下拉 -->
    <ul tabindex="0" class="dropdown-content mt-3 z-[1] menu p-2 shadow bg-base-100 rounded-box w-64 max-h-80 overflow-y-auto">
      <li v-for="artist in filteredArtists" :key="artist.id">
        <button
            class="flex items-center gap-3 p-2 rounded-box hover:bg-base-200 w-full text-left"
            @click="selectArtist(artist)"
        >
          <img :src="artist.avatar" class="w-8 h-8 rounded object-cover" alt="avatar" />
          <span class="truncate">{{ artist.name }}</span>
          <!-- 对勾 SVG 放到最右边 -->
          <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-3 w-3 shrink-0 ml-auto"
          :class="{ 'visible': selectedArtist?.name === artist.name, 'invisible': selectedArtist?.name !== artist.name }"
          >
          <path
              d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"
          ></path>
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>



<style scoped>
/* 可以在这里自定义样式 */
</style>





