<script setup>
import { useRouter } from 'vue-router'
import {apiGetCover} from "@/api/album-api.js";
const props = defineProps({
  album: Object,
  imageSize: {
    type: String,
    default: 'w-40 h-40'
  },
  titleClass: {
    type: String,
    default: 'text-sm font-bold font-[Inter] text-left mt-2',
  },
  dateClass: {
    type: String,
    default: 'text-xs font-[Inter] text-base-content/60 text-left',
  },
  artistClass: {
    type: String,
    default: 'text-xs font-[Inter] text-base-content/60 text-left',
  },
  showArtist: {
    type: Boolean,
    default: true
  },
  showDate: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const album = props.album;

function goToAlbum() {
  router.push(`/album_detail/${props.album.id}`)
}
function playAlbum() {
  router.push({ path: `/album_detail/${props.album.id}`, query: { autoPlay: 'true' } })
}

async function loadCover() {
  album.cover = await apiGetCover(album.coverUrl);
}



</script>


<template>
  <div class="flex flex-col items-center">
    <!-- 封面容器 -->
    <div
        class="relative group hover:-translate-y-1 transform transition duration-300  cursor-pointer w-[160px] h-[160px]"
        v-lazy-img="loadCover"
    >
      <!-- 图片封面 -->
      <img
          v-show="album.cover"
          :src="album.cover"
          alt="专辑封面"
          class="w-full h-full object-cover rounded-lg duration-300 group-hover:shadow-lg group-hover:brightness-50"
          @click="goToAlbum"
      />

      <!-- 骨架图 -->
      <div
          v-show="!album.cover"
          class="w-full h-full rounded-lg skeleton absolute top-0 left-0"
      ></div>

      <!-- 播放按钮 -->
      <div
          class="absolute inset-0 flex items-center justify-center opacity-0 duration-300 group-hover:opacity-100 pointer-events-none"
      >
        <svg style="pointer-events: auto;"  @click.stop="playAlbum" xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 fill-white" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>

    <!-- 标题/艺术家/日期 -->
    <div :class="titleClass" class="max-w-[10rem] truncate mt-2" :title="album.title">
      {{ album.title }}
    </div>
    <div v-if="showArtist" :class="artistClass" class="max-w-[10rem] truncate" :title="album.artist.name">
      {{ album.artist.name }}
    </div>
    <div v-if="showDate" :class="dateClass" class="max-w-[10rem] truncate" :title="album.releaseDate">
      {{ album.releaseDate }}
    </div>
  </div>
</template>


<style scoped>

</style>