<script setup>
import {useAuthStore} from "@/stores/authStore.js";
import {PencilSquareIcon} from "@heroicons/vue/24/outline/index.js";
import {onMounted, ref} from "vue";
import {useUserLikeStore} from "@/stores/userLikeStore.js";
import {apiGetAudio, apiGetLyric, apiGetSongById} from "@/api/song-api.js";
import {apiGetAlbumById} from "@/api/album-api.js";
import SongList from "@/components/SongList.vue";
import AlbumCards from "@/components/AlbumCards.vue";
import router from "@/router/index.js";
import {createAvatarUrl} from "@/Tools/tools.js";
const authStore = useAuthStore();
const tabs = [
  { label: '歌曲', value: 'songs' },
  { label: '专辑', value: 'albums' },
  { label: '歌单', value: 'playlists' },
  { label: '歌手', value: 'artists' },
  { label: '视频', value: 'videos' },
  { label: '关注', value: 'follows' }
]

const userLikeStore = useUserLikeStore()
const songs = ref([]);
const albums = ref([]);

const getSongs = async () => {
  const result = [];
  for (const id of userLikeStore.likedSongIds) {
    const song = await apiGetSongById(id);
    result.push({
      ...song,
      lyric: null,
      album: {
        ...song.album,
        cover: null,
      },
    });
  }
  songs.value = result;
};

const getAlbums = async () =>{
  for(const id of userLikeStore.likedAlbumIds){
    const album = await apiGetAlbumById(id);
    album.cover = await apiGetAudio(album.coverUrl);
    albums.value.push(album)
  }
}
onMounted(
    async () => {
      await getSongs();
      await getAlbums();
    }
)

const activeTab = ref('songs')
</script>

<template>
  <div class="flex flex-col w-full">
    <!-- 顶部背景和信息 -->
    <div class="relative w-full h-[18rem] overflow-hidden">
      <!-- 背景图 -->
      <div
          class="absolute inset-0 bg-cover bg-center"
          :style="{
          backgroundImage: `url(${authStore.user.avatar||createAvatarUrl(authStore.user.username)})`,
          filter: 'blur(40px) brightness(60%)',
          transform: 'scale(1.2)'
        }"
      ></div>
      <!-- 遮罩 -->
      <div class="absolute inset-0 bg-black/40 z-10"></div>

      <!-- 用户信息 -->
      <div class="relative z-20 w-full h-full flex items-center justify-between px-16 text-white">
        <div class="flex items-center gap-6">
          <img
              class="w-28 h-28 rounded-full object-cover shadow-lg"
              :src="authStore.user.avatar||createAvatarUrl(authStore.user.username)"
              alt="User Avatar"
          />
          <div class="flex flex-col gap-2">
            <h1 class="text-3xl font-bold">{{ authStore.user.nickname }}</h1>
            <div class="text-sm text-white/80 space-x-4">
              <span>粉丝：{{ 1 }}</span>
              <span>关注：{{ 2 }}</span>
            </div>
          </div>
        </div>
        <button
            class="flex flex-col items-center text-white hover:text-gray-300 transition duration-200"
            @click="router.push('/account')"
        >
          <PencilSquareIcon class="h-6 w-6" />
          <span class="text-sm mt-1">编辑</span>
        </button>
      </div>
    </div>

    <!-- Tab栏 -->
    <div class="px-16 sticky  top-0 z-30 w-full bg-base-100">
      <div class="flex space-x-4  py-4">
        <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="[
            'btn btn-ghost rounded-lg transition duration-200',
            activeTab === tab.value
              ? 'bg-white text-black'
              : 'hover:bg-white/20'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="p-16">
      <div v-if="activeTab === 'songs'">
        <song-list :songs="songs"></song-list>
      </div>
      <div v-else-if="activeTab === 'albums'">
        <album-cards :albums="albums"></album-cards>
      </div>
      <div v-else-if="activeTab === 'playlists'">
        <p>📁 这里展示收藏的歌单</p>
      </div>
      <div v-else-if="activeTab === 'artists'">
        <p>🎤 这里展示收藏的歌手</p>
      </div>
      <div v-else-if="activeTab === 'videos'">
        <p>🎬 这里展示收藏的视频</p>
      </div>
      <div v-else-if="activeTab === 'follows'">
        <p>👥 这里展示关注的用户</p>
      </div>
    </div>
  </div>
</template>


<style scoped>

</style>