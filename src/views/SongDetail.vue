<script setup>
import {onMounted, ref} from 'vue'
import { useRoute } from 'vue-router'

import { Album } from "@/models/album.js"
import { Song } from "@/models/song.js"

import {apiGetCoverFileUrl} from "@/api/album-api.js"
import { apiGetSongById, apiGetAlbumBySongId, apiGetLyric} from "@/api/song-api.js"
import {useMusicStore} from "@/stores/musicStore.js";

const route = useRoute()
const album = ref({ ...Album })
const song = ref({ ...Song })
const activeTab = ref('playlist') // 当前选中的 tab
const lyricsRef = ref(null)
const lyrics = ref([]);
const currentMusic = useMusicStore();
const isSongModalVisible = ref(false)
const selectedSong = ref(null) // 当前要编辑的歌曲


const parseLRC = (lrcText) => {
  return lrcText
      .split('\n')
      .map(line => {
        const match = line.match(/\[(\d+):(\d+\.\d+)](.+)/)
        if (match) {
          const time = parseInt(match[1]) * 60 + parseFloat(match[2])
          return { time, text: match[3] }
        }
        return null
      })
      .filter(Boolean)
}

const loadLRC = async () => {
  const text = await apiGetLyric(song.value.lyricUrl)
  lyrics.value = parseLRC(text)
}

const togglePlayPause = async (currentSong) => {
  if (currentMusic.currentSong.id === currentSong.id) {
    if (currentMusic.isPlaying) {
      currentMusic.pause();
    } else {
      currentMusic.play();
    }
  } else {
    currentMusic.setCurrentPlayList([song.value]);
    currentMusic.setCurrentAlbumUrlList([albumCoverUrl.value]);
    currentMusic.setCurrentSong(0);
  }
};

function changeTab(tab) {
  activeTab.value = tab
}

const getSongById = async (songId) => {
  const songResponse = await apiGetSongById(songId)
  song.value = songResponse.data
}

const getAlbumBySongId = async (songId) => {
  const albumResponse = await apiGetAlbumBySongId(songId)
  album.value = albumResponse.data
}

const coverImageKey = ref(Date.now());

const refreshCoverImage = () => {
  coverImageKey.value = Date.now()
}
const albumCoverUrl = ref('');
const refreshAll = async () =>{
  await getSongById(route.params.id);
  await getAlbumBySongId(route.params.id);
  albumCoverUrl.value = await apiGetCoverFileUrl(album.value.coverUrl);
  refreshCoverImage();
  await loadLRC();
}

onMounted(async () => {
  await refreshAll();
})

</script>

<template>
  <div class="mx-auto px-8 py-6">
    <!-- 歌曲封面 + 标题 -->
    <div class="flex flex-col sm:flex-row items-center gap-4 mb-6 px-4 py-4">
      <!-- 封面图 + 播放按钮 -->
      <div class="w-28 h-28 shrink-0">
        <div class="relative group w-full h-full rounded-box overflow-hidden">
          <img :src="albumCoverUrl" alt="Cover" class="w-full h-full object-cover" />
          <!-- 悬浮播放按钮 -->
          <button
              class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-70 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 fill-white" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 歌曲信息 -->
      <div class="text-center sm:text-left space-y-1">
        <h1 class="text-3xl font-extrabold">{{ song.title }}</h1>
        <p class="text-sm text-base-content/70">
          歌手：{{ song.artist.name }}
          <span class="mx-2 text-base-content/40">|</span>
          专辑：{{ song.album.title }}
        </p>
      </div>
    </div>




    <!-- Tabs -->
    <div role="tablist" class="tabs tabs-bordered mb-4">
      <a
          role="tab"
          class="tab inline-block relative py-2 px-4 tab-active:text-primary hover:text-primary"
      :class="{
      'tab-active': activeTab === 'playlist'
      }"
      @click="changeTab('playlist')"
      >
      歌曲信息
      <!-- 底部条 -->
      <span
          v-if="activeTab === 'playlist'"
          class="absolute bottom-0 left-1/4 w-1/2 h-1 bg-primary rounded-box"
      ></span>
      </a>
      <a
          role="tab"
          class="tab inline-block relative py-2 px-4 tab-active:text-primary hover:text-primary"
          :class="{
      'tab-active': activeTab === 'comments'
      }"
          @click="changeTab('comments')"
      >
      评论
        <!-- 底部条 -->
        <span
            v-if="activeTab === 'comments'"
            class="absolute bottom-0 left-1/4 w-1/2 h-1 bg-primary rounded-box"
        ></span>
      </a>
    </div>




    <!-- Tab 内容 -->
    <div class="bg-base-100 p-4 rounded-box">
      <!-- 歌曲信息 -->
      <div v-if="activeTab === 'playlist'" class="space-y-2">
        <p><span class="font-bold">演唱者：</span>{{ song.genre }}</p>
        <p><span class="font-bold">作词：</span>{{ song.genre }}</p>
        <p><span class="font-bold">作曲：</span>{{ song.genre }}</p>
        <p><span class="font-bold">编曲：</span>{{ song.genre }}</p>
        <p><span class="font-bold">歌曲语种：</span>{{ song.genre }}</p>
        <p><span class="font-bold">歌曲流派：</span>{{ song.genre }}</p>
        <p><span class="font-bold">唱片公司：</span>{{ song.genre }}</p>
      </div>

      <!-- 评论 -->
      <div v-if="activeTab === 'comments'" class="space-y-2">
        这里是评论
      </div>
    </div>
  </div>
</template>


<style scoped>

</style>