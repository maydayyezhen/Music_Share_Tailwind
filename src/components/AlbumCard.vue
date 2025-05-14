<script setup>
import { useRouter } from 'vue-router'
const props = defineProps({
  album: Object,
  imageSize: {
    type: String,
    default: 'w-41 h-41'
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

function goToAlbum() {
  router.push(`/album_detail/${props.album.id}`)
}
function playAlbum() {
  router.push({ path: `/album_detail/${props.album.id}`, query: { autoPlay: 'true' } })
}
</script>


<template>
  <div :class="`flex flex-col`">
    <div v-if="album.cover" class="relative group hover:-translate-y-1 transform transition duration-300 cursor-pointer">
      <img
          :src="album.cover"
          alt="专辑封面"
          :class="`${imageSize} object-cover rounded-lg duration-300 group-hover:shadow-lg group-hover:brightness-50`"
          @click="goToAlbum"
      />
      <button
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 duration-300 group-hover:opacity-100"
          @click.stop="playAlbum"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 fill-white" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
    </div>
    <div v-else :class="`${imageSize} skeleton rounded-lg`"></div>
    <div :class="titleClass"  class="max-w-[10rem] truncate" :title="album.title">{{ album.title }}</div>
    <div v-if="showArtist" :class="artistClass" class="max-w-[10rem] truncate" :title="album.artist.name">{{ album.artist.name }}</div>
    <div v-if="showDate" :class="dateClass" class="max-w-[10rem] truncate" :title="album.releaseDate">{{ album.releaseDate }}</div>
  </div>
</template>

<style scoped>

</style>