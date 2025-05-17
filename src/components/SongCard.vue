<script setup>
import { useRouter } from 'vue-router'
import {apiGetCover} from "@/api/album-api.js";
import {useMusicStore} from "@/stores/musicStore.js";
const props = defineProps({
  song: Object,
  imageSize: {
    type: String,
    default: 'w-40 h-40'
  },
  titleClass: {
    type: String,
    default: 'text-sm font-bold font-[Inter] text-left mt-2'
  },
  artistClass: {
    type: String,
    default: 'text-xs font-[Inter] text-base-content/60 text-left'
  }
})


const router = useRouter()
const musicStore = useMusicStore()

function goToSong() {
  router.push(`/song_detail/${props.song.id}`)
}
function playSong() {
  musicStore.setCurrentPlayList([props.song]);
  musicStore.setCurrentSong(0);
}
const song = props.song;
async function loadCover() {
  song.album.cover = await apiGetCover(song.album.coverUrl);
}
</script>


<template>
  <div class="flex flex-col">
    <div
        class="relative hover:-translate-y-1 transform transition duration-300  group cursor-pointer w-[160px] h-[160px]"
        v-lazy-img="loadCover"
    >
      <!-- 图片封面 -->
      <img
          v-show="song.album.cover"
          :src="song.album.cover"
          alt="专辑封面"
          class="w-full h-full object-cover rounded-lg duration-300 group-hover:shadow-lg group-hover:brightness-50"
          @click="goToSong"
      />

      <!-- 骨架图 -->
      <div
          v-show="!song.album.cover"
          class="w-full h-full rounded-lg skeleton absolute top-0 left-0"
      ></div>

      <!-- 播放按钮 -->
      <div
          class="absolute inset-0 flex items-center justify-center opacity-0 duration-300 group-hover:opacity-100 pointer-events-none"
      >
        <svg style="pointer-events: auto;"  @click.stop="playSong" xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 fill-white" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>

    <div :class="titleClass">{{ song.title }}</div>
    <div :class="artistClass">{{ song.artist.name }}</div>
  </div>
</template>


<style scoped>

</style>