<script setup>
import router from "@/router/index.js";
import {computed, onMounted, ref} from "vue";
const props = defineProps({
      albums: Array,
      default: () => []
    }
)

function playAlbum(id) {
  router.push({
    path: `/album_detail/${id}`,
    query: { autoPlay: 'true' }
  });
}


const itemsPerPage = 8;

const slides = computed(() => {
  if (!props.albums) return [];
  const chunks = [];
  for (let i = 0; i < props.albums.length; i += itemsPerPage) {
    chunks.push(props.albums.slice(i, i + itemsPerPage));
  }
  return chunks;
});

const sliderNum = ref(1);

onMounted(() => {
  updateSliderFromHash();
  window.addEventListener("hashchange", updateSliderFromHash);
});

function updateSliderFromHash() {
  const hash = window.location.hash;
  const match = hash.match(/#slide(\d+)/);
  if (match) {
    sliderNum.value = parseInt(match[1]);
  }
}

function goToSlide(n) {
  const target = document.getElementById(`slide${n}`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    sliderNum.value = n;
  }
}


</script>

<template>
    <div class="flex justify-between mx-11">
      <h2 class="text-2xl font-bold ml-4">热门专辑</h2>
      <div class="flex">
        <a @click="goToSlide(sliderNum === 1 ? props.albums.length : sliderNum - 1)" class="btn btn-square btn-ghost">❮</a>
        <a @click="goToSlide(sliderNum === props.albums.length ? 1 : sliderNum + 1)" class="btn btn-square btn-ghost ">❯</a>
        <button class="btn btn-ghost text-sm inline-flex items-center">查看全部</button>
      </div>
    </div>
    <div class="carousel">
      <div
          v-for="(group, index) in slides"
          :key="index"
          :id="`slide${index+1}`"
          class="carousel-item w-full justify-center mt-3"
      >
        <div class="flex flex-wrap gap-6">
          <div v-for="album in group" :key="album.id" class="w-40 flex flex-wrap">
            <div class="flex-wrap items-center gap-2">
              <div v-if="album.cover" class="relative group transform transition duration-300 hover:-translate-y-1 cursor-pointer">
                <img :src="album.cover" alt="专辑封面" class="w-full h-auto rounded-lg duration-300 group-hover:shadow-lg group-hover:brightness-50" @click="router.push(`/album_detail/${album.id}`)" />
                <button
                    class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 duration-300 group-hover:opacity-100 cursor-pointer"
                    @click.stop="playAlbum(album.id)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 fill-white" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
              <div v-else class="skeleton w-40 h-40 rounded-lg"></div>
              <div class="mt-2 text-sm font-medium text-left">{{ album.title }}</div>
              <div class="text-xs text-gray-500 text-left">{{ album.releaseDate }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>

</style>