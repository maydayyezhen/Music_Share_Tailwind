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
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { HeartIcon as HeartOutlineIcon } from '@heroicons/vue/24/outline'
import { PlayIcon, EllipsisHorizontalIcon } from '@heroicons/vue/24/solid'
import {
  InformationCircleIcon,
  MusicalNoteIcon,
  ChatBubbleLeftEllipsisIcon,
  PlayCircleIcon,
  RectangleStackIcon,
  StarIcon
} from "@heroicons/vue/24/outline/index.js";
import formatDuration from "../Tools/Time.js";
import CarouselDisplay from "@/components/CarouselDisplay.vue";
import AlbumCard from "@/components/AlbumCard.vue";
import ImagePreview from "@/components/ImagePreview.vue";

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

onMounted(async () => {
  await getAlbumById(route.params.id);
  await getSongsByAlbumId(route.params.id);
  await getAlbumsByArtistId(album.value.artist.id);
  if (route.query.autoPlay === 'true')
    playAllSongs();
})

watch(() => route.params.id, async (newId) => {
  await getAlbumById(newId);
  await getSongsByAlbumId(newId);
  await getAlbumsByArtistId(album.value.artist.id);
  if (route.query.autoPlay === 'true')
    playAllSongs();
})

function playAllSongs() {
  musicStore.setCurrentPlayList(songs.value);
  musicStore.setCurrentSong(0);
}

</script>

<template>
  <div class="mx-auto py-6">
    <!-- 歌曲封面 + 标题 -->
    <div class="relative w-full h-[24rem] overflow-hidden">
      <!-- 背景图层 -->
      <div
          class="absolute inset-0 w-full h-full bg-cover bg-center scale-110"
          :style="{
      backgroundImage: `url(${album.cover})`,
      filter: 'blur(10px) brightness(60%)'
    }"
      ></div>

      <!-- 遮罩层：左右渐变 -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40 z-10"></div>

      <!-- 遮罩层：底部渐变 -->
      <div class="absolute inset-0 z-10 pointer-events-none">
        <div class="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      <!-- 内容层 -->
      <div class="relative z-20 flex flex-col justify-end h-full px-28 gap-8">
        <div class="flex">
          <!-- 专辑封面 -->
          <ImagePreview :src="album.cover" class="w-60 h-60 rounded-xl shadow-lg object-cover" />


          <!-- 专辑信息 -->
          <div class="ml-12 text-white  flex flex-col justify-center gap-3">
            <!-- 专辑标题 -->
            <h1 class="text-3xl font-semibold text-white/90">{{ album.title }}</h1>

            <!-- 艺术家名 -->
            <div class="text-base font-medium text-white/80">
              {{ album.artist.name }}
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
        <!-- 专辑封面 -->
        <div class="flex items-center gap-4  mb-10">
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

    <div>
      <!-- 歌曲列表 -->
      <div v-if="activeTab === 'songs'" class=" flex flex-col gap-16">
        <SongList :album="album" :show-track-num="true" :show-cover="false" :show-album="false" :songs="songs" class="px-23"/>
        <CarouselDisplay
            :title="album.artist.name + '的其他专辑'"
            :items="albums"
            :items-per-page="8"
            header-class="text-xl font-bold mb-4 ml-4"
            id-prefix="album"
            class="px-20"
        >
          <template #item="{ item }">
            <AlbumCard
                :album="item"
                :show-artist="false"
            />
          </template>
          <template #action>
            <button class="text-sm hover:underline cursor-pointer mr-6" @click="changeTab('albums')">查看全部</button>
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

</template>

<style scoped>

</style>