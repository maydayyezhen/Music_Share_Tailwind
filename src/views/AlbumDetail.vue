<script setup>
import {onMounted, ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import {Album} from "@/models/album.js"
import {Song} from "@/models/song.js"
import {apiGetAlbumById, apiGetAlbumsByArtistId, apiGetCover} from "@/api/album-api.js"
import {apiGetAudio, apiGetLyric, apiGetSongsByAlbumId} from "@/api/song-api.js"
import SongList from "@/components/SongList.vue"
import {useMusicStore} from "@/stores/musicStore.js";
import AlbumCards from "@/components/AlbumCards.vue";
import {useUserLikeStore} from "@/stores/userLikeStore.js";
import router from "@/router/index.js";
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { HeartIcon as HeartOutlineIcon } from '@heroicons/vue/24/outline'
import { PlayIcon, EllipsisHorizontalIcon } from '@heroicons/vue/24/solid'

const route = useRoute()
const activeTab = ref('playlist')
const musicStore = useMusicStore();
const userLikeStore = useUserLikeStore();

const album = ref({...Album})
const albums = ref([{...Album}])
const songs = ref([{...Song}])
const getAlbumById = async (id) => {
  album.value = await apiGetAlbumById(id)
  album.value.cover = await apiGetCover(album.value.coverUrl);
}

const getSongsByAlbumId = async (albumId) => {
  try {
    const songsResponse = await apiGetSongsByAlbumId(albumId);
    songs.value = songsResponse.data;

    for (let i = 0; i < songs.value.length; i++) {
      const song = songs.value[i];
      song.album = album.value;

      try {
        song.audio = await apiGetAudio(song.audioUrl);
      } catch (e) {
        console.error(`加载音频失败: ${song.audioUrl}`, e);
        song.audio = null;
      }

      try {
        song.lyric = await apiGetLyric(song.lyricUrl);
      } catch (e) {
        console.error(`加载歌词失败: ${song.lyricUrl}`, e);
        song.lyric = null;
      }
    }
  } catch (e) {
    console.error("获取歌曲列表失败", e);
    songs.value = [];
  }
};


const getAlbumsByArtistId = async (artistId) => {
  debugger;

  const currentAlbumId = Number(route.params.id);
  const allAlbums = await apiGetAlbumsByArtistId(artistId);

  albums.value = allAlbums.filter(album => album.id !== currentAlbumId);

  await Promise.all(
      albums.value.map(async (album) => {
        album.cover = await apiGetCover(album.coverUrl);
      })
  );
};

function changeTab(tab) {
  activeTab.value = tab
}

onMounted(async () => {
  await getAlbumById(route.params.id);
  await getSongsByAlbumId(route.params.id);
  await getAlbumsByArtistId(album.value.artist.id);
})

watch(() => route.params.id, async (newId) => {
  await getAlbumById(newId);
  await getSongsByAlbumId(newId);
  await getAlbumsByArtistId(album.value.artist.id);
})

function playAllSongs() {
  musicStore.setCurrentPlayList(songs.value);
  musicStore.setCurrentSong(0);
}

</script>

<template>
  <div class="mx-auto px-8 py-6">
    <!-- 歌曲封面 + 标题 -->
    <div class="flex items-center px-8 py-8 mb-10 gap-8">
      <!-- 专辑封面 -->
      <img v-if="album.cover"
           :src="album.cover"
           alt="专辑封面"
           class="w-48 h-48 rounded-lg object-cover"
      />
      <div v-else class="skeleton w-48 h-48 rounded-lg object-cover"></div>

      <!-- 专辑信息 -->
      <div class="flex-1 min-w-0">
        <h1 class="text-3xl font-bold leading-tight mb-3 truncate">{{ album.title }}</h1>
        <p class="text-lg text-gray-700 mb-2 truncate cursor-pointer hover:text-primary" @click="router.push('/artist_detail/'+album.artist.id)">{{ album.artist.name }}</p>
        <p class="text-lg text-gray-500 mb-4">{{ album.releaseDate }}</p>

        <!-- 操作按钮组 -->
        <div class="flex items-center gap-4 flex-wrap">
          <!-- 播放全部按钮 -->
          <button
              class="flex items-center gap-2 px-5 py-3 bg-primary text-primary-content text-lg rounded-full hover:brightness-75 transition"
              @click="playAllSongs"
          >
            <PlayIcon class="w-5 h-5" />
            播放全部
          </button>

          <!-- 收藏按钮 -->
          <button
              class="flex items-center gap-2 px-5 py-3 bg-base-200 text-lg rounded-full hover:bg-base-300 transition"
              @click="userLikeStore.toggleLike(album.id, 'album')"
          >
            <component
                :is="userLikeStore.isLiked(album.id, 'album') ? HeartSolidIcon : HeartOutlineIcon"
                class="w-6 h-6 text-red-500"
            />
            <span class="leading-none">
        {{ userLikeStore.isLiked(album.id, 'album') ? '已收藏' : '收藏' }}
      </span>
          </button>

          <!-- 更多操作按钮 -->
          <button
              class="w-12 h-12 flex items-center justify-center bg-base-200 rounded-full hover:bg-base-300 transition"
          >
            <EllipsisHorizontalIcon class="w-6 h-6 text-base-content" />
          </button>
        </div>
      </div>
    </div>


    <div class="tabs tabs-bordered mb-10" role="tablist">
      <a
          :class="{
      'tab-active text-primary': activeTab === 'playlist'
    }"
          class="tab inline-block relative py-2 px-4 hover:text-primary"
          role="tab"
          @click="changeTab('playlist')"
      >
        歌曲信息
        <span
            v-if="activeTab === 'playlist'"
            class="absolute bottom-0 left-1/4 w-1/2 h-1 bg-primary rounded-box"
        ></span>
      </a>

      <a
          :class="{
      'tab-active text-primary': activeTab === 'info'
    }"
          class="tab inline-block relative py-2 px-4 hover:text-primary"
          role="tab"
          @click="changeTab('info')"
      >
        专辑信息
        <span
            v-if="activeTab === 'info'"
            class="absolute bottom-0 left-1/4 w-1/2 h-1 bg-primary rounded-box"
        ></span>
      </a>

      <a
          :class="{
      'tab-active text-primary': activeTab === 'comments'
    }"
          class="tab inline-block relative py-2 px-4 hover:text-primary"
          role="tab"
          @click="changeTab('comments')"
      >
        评论
        <span
            v-if="activeTab === 'comments'"
            class="absolute bottom-0 left-1/4 w-1/2 h-1 bg-primary rounded-box"
        ></span>
      </a>
    </div>





    <div class="px-4">
      <!-- 歌曲列表 -->
      <div v-if="activeTab === 'playlist'" :key="songListKey">
        <SongList :album="album" :show-track-num="true" :songs="songs"/>
        <div class="px-6 py-4">
          <h2 class="text-xl font-semibold mb-6">该歌手的其它专辑</h2>
          <album-cards :albums="albums"/>
        </div>


      </div>
      <!-- 专辑信息 -->


      <div v-else-if="activeTab === 'info'">
        <div class="text-base-content max-w-3xl ml-0" v-html="album.description"></div>
      </div>
    </div>

  </div>

</template>

<style scoped>

</style>