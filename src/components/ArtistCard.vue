<script setup>
import { useRouter } from 'vue-router'
const props = defineProps({
  artist: Object,
  imageSize: {
    type: String,
    default: 'w-40 h-40'
  },
  titleClass: {
    type: String,
    default: 'text-sm font-medium text-left mt-2'
  }
})

const router = useRouter()

function goToArtist() {
  router.push(`/artist_detail/${props.artist.id}`)
}

</script>


<template>
  <div :class="`flex flex-col`">
    <div v-if="artist.avatar" class="relative group hover:-translate-y-1 transform transition duration-300  cursor-pointer">
      <img
          :src="artist.avatar"
          alt="歌手头像"
          :class="`${imageSize} object-cover rounded-full duration-300 group-hover:shadow-lg group-hover:brightness-50`"
          @click="goToArtist"
      />
    </div>
    <div v-else :class="`${imageSize} skeleton rounded-lg`"></div>
    <div :class="titleClass"  class="max-w-[10rem] truncate" :title="artist.name">{{ artist.name }}</div>
  </div>
</template>

<style scoped>

</style>