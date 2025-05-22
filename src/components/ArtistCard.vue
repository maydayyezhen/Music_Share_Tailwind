<script setup>
import { useRouter } from 'vue-router'
import {apiGetCover} from "@/api/album-api.js";
import {apiGetArtistAvatar} from "@/api/artist-api.js";
const props = defineProps({
  artist: Object,
  imageSize: {
    type: String,
    default: 'w-40 h-40'
  },
  titleClass: {
    type: String,
    default: 'text-sm font-bold font-[Inter] text-left mt-2'
  }
})

const artist = props.artist;
const router = useRouter()

function goToArtist() {
  router.push(`/artist_detail/${props.artist.id}`)
}

async function loadAvatar() {
  artist.avatar = await apiGetArtistAvatar(artist.avatarUrl)
}

</script>


<template>
  <div :class="`flex flex-col`">
    <div class="relative group hover:-translate-y-1 transform transition duration-300  cursor-pointer" v-lazy-img="loadAvatar">
      <img
          v-if="artist.avatar"
          :src="artist.avatar"
          alt="歌手头像"
          :class="`${imageSize} object-cover rounded-full duration-300 group-hover:shadow-lg group-hover:brightness-50`"
          @click="goToArtist"
      />
      <div v-else :class="`${imageSize} skeleton rounded-full`"></div>
    </div>
    <div :class="titleClass"  class="max-w-[10rem] truncate" :title="artist.name">{{ artist.name }}</div>
  </div>
</template>

<style scoped>

</style>