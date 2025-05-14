<script setup>
import { ref, watch} from "vue";
import {useMusicStore} from "@/stores/musicStore.js";
import router from "@/router/index.js";
import Pagination from "@/components/Pagination.vue";
import {useUserLikeStore} from "@/stores/userLikeStore.js";
import { HeartIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { PlayIcon, PauseIcon } from '@heroicons/vue/24/solid'



const props = defineProps({
      songs: Object,
      page: Object,
      showTrackNum: {
        type: Boolean,
        default: false
      },
      showCover:{
        type: Boolean,
        default: true
      },
      showAlbum:{
        type: Boolean,
        default: true
      }
    }
)

const currentMusic = useMusicStore();
const userLikeStore = useUserLikeStore();
const emit = defineEmits(["reloadSongs", "page-change"]);
const isSongModalVisible = ref(false)


const togglePlayPause = (currentSong) => {
  if(currentMusic.currentSong.id === currentSong.id) {
    if(currentMusic.isPlaying) {
      currentMusic.pause();
    }
    else {
      currentMusic.play();
    }
  }
  else {
    currentMusic.setCurrentPlayList(props.songs);
    const index =props.songs.findIndex(song => song.id === currentSong.id)
    currentMusic.setCurrentSong(index);
  }
};

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = String(seconds % 60).padStart(2, '0');
  return `${min}:${sec}`;
}
const getGridCols = (showTrackNum, showCover, showAlbum) => {
  if (showTrackNum && showCover && showAlbum) {
    return 'grid-cols-[3rem_4rem_1fr_1fr_1fr_3rem_5rem]';
  } else if (showTrackNum && showCover && !showAlbum) {
    return 'grid-cols-[3rem_4rem_1fr_1fr_3rem_5rem]';
  } else if (showTrackNum && !showCover && showAlbum) {
    return 'grid-cols-[3rem_1fr_1fr_1fr_3rem_5rem]';
  } else if (showTrackNum && !showCover && !showAlbum) {
    return 'grid-cols-[3rem_1fr_1fr_3rem_5rem]';
  } else if (!showTrackNum && showCover && showAlbum) {
    return 'grid-cols-[4rem_1fr_1fr_1fr_3rem_5rem]';
  } else if (!showTrackNum && showCover && !showAlbum) {
    return 'grid-cols-[4rem_1fr_1fr_3rem_5rem]';
  } else if (!showTrackNum && !showCover && showAlbum) {
    return 'grid-cols-[1fr_1fr_1fr_3rem_5rem]';
  } else {
    return 'grid-cols-[1fr_1fr_3rem_5rem]';
  }
};





watch(isSongModalVisible, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    emit("reloadSongs");
  }
})

</script>

<template>
  <div class="w-full">
    <ul class="list rounded-box">
      <!-- 表头 -->
      <li
          class="grid gap-4 px-4 py-2 text-sm font-semibold text-gray-500 items-center"
          :class="[
    getGridCols(showTrackNum, showCover,showAlbum),
  ]"
      >
        <div v-if="showTrackNum">#</div>
        <div v-if="showCover"></div>
        <div>歌曲名</div>
        <div>歌手</div>
        <div v-if="showAlbum">专辑</div>
        <div>时长</div>
        <div class="flex justify-end"></div>
      </li>

      <!-- 歌曲列表 -->
      <li
          v-for="song in songs"
          :key="song.id"
          class=" group grid gap-4 px-4 py-2 font-semibold items-center hover:bg-base-200"
          :class="[
    getGridCols(showTrackNum, showCover,showAlbum),
    currentMusic.currentSong?.id === song.id ? 'font-bold text-primary bg-base-200' : ''
  ]"
      >

      <!-- Track Number -->
        <!-- Track Number 或 播放按钮 -->
        <div
            v-if="showTrackNum"
            class="text-center tabular-nums text-sm text-white/40 font-normal w-8 relative "
        >
          <!-- 编号默认显示，悬浮时隐藏 -->
          <span class="block group-hover:opacity-0 transition-opacity duration-150">
    {{ song.trackNum != null ? String(song.trackNum).padStart(2, '0') : '00' }}
  </span>

          <!-- 播放按钮默认隐藏，悬浮时显示 -->
          <button
              class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
              @click.stop="togglePlayPause(song)"
          >
            <component
                :is="currentMusic.currentSong?.id === song.id && currentMusic.isPlaying ? PauseIcon : PlayIcon"
                class="w-4 h-4 text-white"
            />
          </button>
        </div>


        <!-- 封面 -->
        <div v-if="showCover" class="flex justify-center">
          <div  class="relative group size-10 rounded-box overflow-hidden cursor-pointer">
            <!-- 封面图或占位 -->
            <img
                v-if="song.album.cover"
                :src="song.album.cover"
                class="w-full h-full object-cover"
                alt="专辑封面"
            />
            <div v-else class="skeleton w-full h-full"></div>

            <!-- 播放按钮，默认隐藏，悬浮显示 -->
            <button
                class="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-opacity opacity-0 group-hover:opacity-100"
                @click.stop="togglePlayPause(song)"
            >
              <component
                  :is="currentMusic.currentSong?.id === song.id && currentMusic.isPlaying ? PauseIcon : PlayIcon"
                  class="w-5 h-5 text-white"
              />
            </button>
          </div>
        </div>

        <!-- 歌曲名 -->
        <div class="cursor-pointer hover:underline" @click="router.push(`/song_detail/${song.id}`)">
          {{ song.title }}
        </div>

        <!-- 歌手 -->
        <div class="text-xs uppercase opacity-60 cursor-pointer hover:underline"
             @click="router.push(`/artist_detail/${song.artist.id}`)">
          {{ song.artist.name }}
        </div>

        <!-- 专辑 -->
        <div v-if="showAlbum" class="text-xs uppercase opacity-60 cursor-pointer hover:underline"
             @click="router.push(`/album_detail/${song.album.id}`)">
          {{ song.album.title }}
        </div>

        <!-- 时长 -->
        <div class="flex text-xs text-white/60">
          {{ formatDuration(song.duration) }}
        </div>

        <!-- 操作区 -->
        <div class="flex justify-end">
          <button
              class="p-0 text-red-500 hover:opacity-80"
              @click="
      userLikeStore.toggleLike(song.id, 'song');
      song.likeCount -= userLikeStore.isLiked(song.id, 'song') ? 1 : -1;
    "
          >
            <component
                :is="userLikeStore.isLiked(song.id, 'song') ? HeartSolidIcon : HeartIcon"
                class="w-5 h-5"
            />
          </button>
        </div>

      </li>
    </ul>


    <!-- 分页组件 -->
    <div class="mt-4 mb-4"> <!-- 增加一些顶部空间 -->
      <pagination
          v-if="page"
          :number="page.number"
          :size="page.size"
          :total-pages="page.totalPages"
          @change="(number, size) => emit('page-change', number, size)"
          :sizeInput="false"
          :numberInput="false"
      >
      </pagination>
    </div>
  </div>
</template>


<style scoped>

</style>