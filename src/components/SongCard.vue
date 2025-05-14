<script setup>
import { useRouter } from 'vue-router'
const props = defineProps({
  song: Object,
  imageSize: {
    type: String,
    default: 'w-40 h-40'
  },
  titleClass: {
    type: String,
    default: 'text-sm font-medium text-left mt-2'
  },
  dateClass: {
    type: String,
    default: 'text-xs text-gray-500 text-left'
  }
})

const router = useRouter()

function goToAlbum() {
  router.push(`/song_detail/${props.song.id}`)
}
function playSong() {
}
</script>


<template>
  <div :class="`flex flex-col`">
    <div v-if="song.album.cover" class="relative group hover:-translate-y-1 transform transition duration-300 cursor-pointer">
      <img
          :src="song.album.cover"
          alt="专辑封面"
          :class="`${imageSize} rounded-lg duration-300 group-hover:shadow-lg group-hover:brightness-50`"
          @click="goToAlbum"
      />
      <button
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 duration-300 group-hover:opacity-100"
          @click.stop="playSong"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 fill-white" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
    </div>
    <div v-else :class="`${imageSize} skeleton rounded-lg`"></div>
    <div :class="titleClass">{{ song.title }}</div>
    <div :class="dateClass">{{ song.artist.name }}</div>
  </div>
</template>

<style scoped>

</style>