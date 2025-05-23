<script setup>
import {onMounted, ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import {Album} from "@/models/album.js"
import {Song} from "@/models/song.js"
import {apiGetAlbumById, apiGetAlbumsByArtistId, apiGetCover} from "@/api/album-api.js"
import {apiGetSongsByAlbumId} from "@/api/song-api.js"
import SongList from "@/components/SongList.vue"
import {useMusicStore} from "@/stores/musicStore.js";
import {useUserLikeStore} from "@/stores/userLikeStore.js";
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { HeartIcon as HeartOutlineIcon } from '@heroicons/vue/24/outline'
import { PlayIcon} from '@heroicons/vue/24/solid'
import {
  InformationCircleIcon,
  MusicalNoteIcon,
  ChatBubbleLeftEllipsisIcon,

} from "@heroicons/vue/24/outline/index.js";
import {formatDuration} from "../Tools/tools.js";
import CarouselDisplay from "@/components/CarouselDisplay.vue";
import AlbumCard from "@/components/AlbumCard.vue";
import ImagePreview from "@/components/ImagePreview.vue";
import {useSidebarStore} from "@/stores/sidebarStore.js";
import {apiGetArtistAvatar} from "@/api/artist-api.js";
import router from "@/router/index.js";

const route = useRoute()
const musicStore = useMusicStore();
const userLikeStore = useUserLikeStore();
const album = ref({...Album})
const albums = ref([{...Album}])
const songs = ref([{...Song}])
const getAlbumById = async (id) => {
  album.value = await apiGetAlbumById(id)
  album.value.cover = await apiGetCover(album.value.coverUrl);
  album.value.duration = 0;
  album.value.artist.avatar = await apiGetArtistAvatar(album.value.artist.avatarUrl);
}

const getSongsByAlbumId = async (albumId) => {
  try {
    const songsResponse = await apiGetSongsByAlbumId(albumId);
    songs.value = songsResponse.data;
    for (let i = 0; i < songs.value.length; i++) {
      const song = songs.value[i];
      song.album = album.value;
    }
    album.value.duration = songs.value.reduce(
        (sum, song) => sum + (song.duration || 0),
        0
    );
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

const tabs = [
  { key: 'songs', label: '歌曲', icon: MusicalNoteIcon },
  { key: 'info', label: '专辑信息', icon: InformationCircleIcon },
  { key: 'comments', label: '评论', icon: ChatBubbleLeftEllipsisIcon },
];
const activeTab = ref('songs');
const changeTab = (key) => {
  activeTab.value = key;
}

const isPageReady = ref(false);

const loadAlbumPage = async (albumId, autoPlay = false) => {
  isPageReady.value = false;

  await getAlbumById(albumId);

  await Promise.all([
    getSongsByAlbumId(albumId),
    getAlbumsByArtistId(album.value.artist.id)
  ]);

  if (autoPlay) {
    playAllSongs();
  }
  isPageReady.value = true;
};


onMounted(() => {
  loadAlbumPage(route.params.id, route.query.autoPlay === 'true');
});

watch(() => route.params.id, (newId) => {
  loadAlbumPage(newId, route.query.autoPlay === 'true');
});


function playAllSongs() {
  if(songs.value.length > 0) {
    musicStore.setCurrentPlayList(songs.value);
    musicStore.setCurrentSong(0);
  }
}

</script>

<template>
  <div v-if="isPageReady">
    <!-- 歌曲封面 + 标题 -->
    <div class="relative w-full h-[29rem] overflow-hidden ">
      <!-- 背景图层 -->
      <div
          class="absolute inset-0 w-full h-full bg-cover bg-center scale-110"
          :style="{
      backgroundImage: `url(${album.cover})`,
      filter: 'brightness(60%)'
    }"
      ></div>

      <!-- 遮罩层：左右渐变 -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40 z-10"></div>

      <!-- 遮罩层：底部渐变 -->
      <div class="absolute inset-0 z-10 pointer-events-none">
        <div class="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      <!-- 内容层 -->
      <div class="relative flex flex-col justify-end h-full gap-8"
           :class="useSidebarStore().showSidebar ? 'px-21' : 'px-30'"
      >
        <div class="flex">
          <!-- 专辑封面 -->
          <ImagePreview :src="album.cover" class="w-60 h-60 rounded-xl  shadow-lg object-cover" />


          <div class="flex z-20">
            <div class="ml-12 text-white  flex flex-col justify-center gap-3">
              <!-- 专辑标题 -->
              <h1 class="text-3xl font-semibold text-white/90">{{ album.title }}</h1>

              <div class="flex items-center gap-4">
                <img :src="album.artist.avatar" class="w-10 h-10 rounded-full object-cover" alt="Artist Avatar">
                <!-- 艺术家名 -->
                <div class="text-base font-medium text-white/80 hover:underline cursor-pointer" @click="router.push('/artist_detail/'+album.artist.id)">
                  {{ album.artist.name }}
                </div>
              </div>

              <!-- 歌曲数量和总时长 -->
              <div class="text-sm text-white/60">
                共{{ songs.length }} 首 ({{ formatDuration(album.duration) }})
              </div>

              <!-- 发布日期 -->
              <div class="text-xs text-white/60">
                {{ album.releaseDate }}
              </div>
            </div>
          </div>

        </div>
        <div class="flex items-center gap-4  mb-10 z-20">
          <button
              class="w-35 h-11 px-5 py-2 bg-white text-black text-sm font-bold rounded-2xl hover:bg-gray-200 transition"
              @click="playAllSongs"
          >
            <span class="flex items-center justify-center">
              <PlayIcon class="inline-block w-8 h-6 mr-1" /> 播放
            </span>
          </button>
          <button
              class="w-35 h-11 rounded-2xl flex items-center text-sm font-bold justify-center transition bg-[#2a2a2a] hover:bg-[#1f1f1f]"
              @click="userLikeStore.toggleLike(album.id, 'album')"
          >
        <span v-if="userLikeStore.isLiked(album.id,'album')" class="font-bold flex items-center justify-center">
          <HeartOutlineIcon class="w-8 h-6 text-white mr-1" /> 收藏
        </span>
            <span v-else class="font-bold flex items-center justify-center">
          <HeartSolidIcon class="w-8 h-6 text-white mr-1" /> 已收藏
        </span>
          </button>
          <div class="flex gap-6 ml-auto mr-6">
            <div v-for="tab in tabs" :key="tab.key" class="flex flex-col items-center">
              <!-- 按钮 -->
              <button
                  @click="changeTab(tab.key)"
                  class="w-10 h-10 rounded-full transition flex items-center justify-center cursor-pointer"
                  :class="{
          'bg-white text-black': activeTab === tab.key,
          'bg-white/20 text-white': activeTab !== tab.key
        }"
                  :title="tab.label"
              >
                <component :is="tab.icon" class="w-5 h-5" />
              </button>
              <!-- 小字提示 -->
              <span class="text-xs mt-1">{{ tab.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class=" mt-10"
         :class="useSidebarStore().showSidebar ? 'px-21' : 'px-30'"
    >
      <!-- 歌曲列表 -->
      <div v-if="activeTab === 'songs'" class=" flex flex-col gap-16">
        <SongList :album="album" :show-track-num="true" :show-cover="false" :show-album="false" :songs="songs"/>
        <CarouselDisplay
            :title="album.artist.name + '的其他专辑'"
            :items="albums"
            :items-per-page="8"
            header-class="text-xl font-bold mb-4"
            id-prefix="album"
        >
          <template #item="{ item }">
            <AlbumCard
                :album="item"
                :show-artist="false"
            />
          </template>
          <template #action>
            <button class="text-sm hover:underline cursor-pointer" @click="changeTab('albums')">查看全部</button>
          </template>
        </CarouselDisplay>
      </div>
      <!-- 专辑信息 -->
      <div v-else-if="activeTab === 'info'" class="relative overflow-hidden">
        <!-- 背景层：极度模糊 + 压暗晕影 -->
        <div
            class="absolute inset-0 z-[-2] bg-cover bg-center"
            :style="{
      backgroundImage: `url(${album.cover})`,
      filter: 'blur(80px) brightness(30%)',
      transform: 'scale(1.2)',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backgroundBlendMode: 'overlay'
    }"
        ></div>

        <!-- 主要内容区域 -->
        <div class="text-base-content bg-base-200 max-w-4xl mx-auto p-6 backdrop-blur-md backdrop-filter rounded-lg shadow-lg relative z-10 mt-10">
          <div class="leading-relaxed text-lg mb-6 whitespace-pre-line font-serif">
            <div v-html="album.description"></div>
          </div>
          <hr class="border-t-2 border-gray-300 mb-6" />
          <div class="text-sm text-gray-600">
            <p>如有错误欢迎联系修改。</p>
          </div>
        </div>
      </div>
    </div>

  </div>
  <div v-else class=" w-full h-full inset-0 flex justify-center items-center">
    <span class="loading loading-spinner loading-lg w-10 h-10"></span>
  </div>

</template>

<style scoped>

</style>