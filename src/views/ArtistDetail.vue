<script setup>
import {onMounted, ref} from 'vue'
import{Artist} from "@/models/artist.js";
import {apiGetArtistAvatarFileUrl, apiGetArtistById} from "@/api/artist-api.js";
import {useRoute} from "vue-router";
import {apiGetAlbumsByArtistId} from "@/api/album-api.js";
import {apiGetSongsByArtistId} from "@/api/song-api.js";
import SongList from "@/components/SongList.vue";
import AlbumCards from "@/components/AlbumCards.vue";
import {useUserLikeStore} from "@/stores/userLikeStore.js";
import { CheckIcon, PlusIcon, EllipsisHorizontalIcon } from '@heroicons/vue/24/solid'
const route = useRoute()
const artist = ref({...Artist})

const getArtistById = async (artistId) => {
  debugger
  const artistResponse = await apiGetArtistById(artistId);
  artist.value = artistResponse.data;
  artist.value.avatar = await apiGetArtistAvatarFileUrl(artist.value.avatarUrl);
  artist.value.albums = await apiGetAlbumsByArtistId(artistId);
  for(let album of artist.value.albums)
    album.cover = await apiGetArtistAvatarFileUrl(album.coverUrl);
  artist.value.songs = await apiGetSongsByArtistId(artistId);
  for (let song of artist.value.songs) {
    const matchedAlbum = artist.value.albums.find(album => album.id === song.album.id);
    if (matchedAlbum) {
      song.album.cover = matchedAlbum.cover;
    }
    song.audio = await apiGetArtistAvatarFileUrl(song.audioUrl);
  }
}

onMounted(() => {
  getArtistById(route.params.id)
})

const tabs = [
  { key: 'featured', label: '精选' },
  { key: 'songs', label: '歌曲' },
  { key: 'album', label: '专辑' },
  { key: 'videos', label: '视频' },
  { key: 'detail', label: '详情' },
];
const activeTab = ref('featured');
const changeTab = (key) => {
  activeTab.value = key;
}


</script>

<template>
  <!-- 歌曲封面 + 标题 -->
  <div class="flex items-center px-8 py-8 mb-10 gap-8">
    <!-- 专辑封面 -->
    <img v-if="artist.avatar"
         :src="artist.avatar"
         alt=""
         class="w-48 h-48 rounded-full"
    />
    <div v-else class="skeleton w-48 h-48 rounded-full"></div>

    <!-- 专辑信息 -->
    <div class="flex-1 min-w-0">
      <h1 class="text-3xl font-bold leading-tight mb-3 truncate">{{ artist.name }}</h1>
      <p class="text-lg text-base-content/60  mb-2 truncate">外文名：Cheer 国籍：中国职业：歌手 、演员</p>
      <p class="text-lg text-base-content/70  mb-4">粉丝数：87.0万</p>

      <!-- 操作按钮组 -->
      <div class="flex items-center gap-4 flex-wrap">
        <!-- 关注按钮 -->
        <button
            class="px-5 py-3 bg-primary text-primary-content text-lg rounded-full hover:brightness-75 transition cursor-pointer"
            @click="useUserLikeStore().toggleLike(artist.id, 'artist')"
        >
      <span v-if="!useUserLikeStore().isLiked(artist.id, 'artist')" class="flex items-center gap-1">
        <PlusIcon class="w-4 h-4 text-white" /> 关注
      </span>
          <span v-else class="flex items-center gap-1">
        <CheckIcon class="w-4 h-4 text-white" />
        已关注
      </span>
        </button>

        <!-- 歌手节目按钮 -->
        <button
            class="px-5 py-3 bg-base-200 text-lg rounded-full hover:bg-base-300 transition"
        >
          歌手节目
        </button>

        <!-- 更多按钮 -->
        <button
            class="w-12 h-12 flex items-center justify-center bg-base-200 rounded-full hover:bg-base-300 transition"
        >
          <EllipsisHorizontalIcon class="w-6 h-6" />
        </button>
      </div>
    </div>
  </div>

  <div role="tablist" class="tabs tabs-bordered mb-10">
    <a
        v-for="tab in tabs"
        :key="tab.key"
        role="tab"
        class="tab inline-block relative py-2 px-4 hover:text-primary"
        :class="{ 'tab-active text-primary': activeTab === tab.key }"
        @click="changeTab(tab.key)"
    >
      {{ tab.label }}
      <span
          v-if="activeTab === tab.key"
          class="absolute bottom-0 left-1/4 w-1/2 h-1 bg-primary rounded-box"
      ></span>
    </a>
  </div>

  <div v-if="activeTab === 'songs'">
    <song-list :songs="artist.songs"></song-list>
  </div>
  <div v-else-if="activeTab === 'album'">
    <album-cards :albums="artist.albums"></album-cards>
  </div>
  <div v-else-if="activeTab === 'detail'">
    <div class="text-base-content max-w-3xl ml-0" v-html="artist.bio"></div>
  </div>

</template>

<style scoped>

</style>