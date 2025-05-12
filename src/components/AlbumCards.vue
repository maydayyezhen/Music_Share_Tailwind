<script setup>
import router from "@/router/index.js";
const props = defineProps({
      albums: Object,
    }
)

function playAlbum(album) {

}

</script>

<template>
  <div class="flex flex-wrap gap-6">
    <!-- 专辑卡片 -->
    <div v-for="album in albums" :key="album.id" class="w-40">
      <div v-if="album.cover" class="relative group transform transition duration-300 hover:-translate-y-1 cursor-pointer">
        <img :src="album.cover" alt="专辑封面" class="w-full h-auto rounded-lg duration-300 group-hover:shadow-lg group-hover:brightness-50" @click="router.push(`/album_detail/${album.id}`)" />

        <button
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 duration-300 group-hover:opacity-100 cursor-pointer"
            @click.stop="playAlbum(album)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 fill-white" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
      <div v-else class="skeleton w-full h-40 rounded-lg"></div>

      <div class="mt-2 text-sm font-medium text-left">{{ album.title }}</div>
      <div class="text-xs text-gray-500 text-left">{{ album.releaseDate }}</div>
    </div>
  </div>
</template>

<style scoped>

</style>