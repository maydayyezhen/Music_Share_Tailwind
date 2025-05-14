<script setup>
import {onMounted, ref} from 'vue'
import {apiGetAlbums, apiGetCover} from "@/api/album-api.js";
import AlbumSlider from "@/components/AlbumSlider.vue";

const albums = ref([]);

const getPopularAlbums = async () => {
  debugger;
  albums.value = await apiGetAlbums(0, 12, '', 'likeCount', 'desc');
  albums.value=albums.value.content;
  for(let i = 0; i < albums.value.length; i++){
    albums.value[i].cover =await apiGetCover(albums.value[i].coverUrl);
  }
};

onMounted(() => {
  getPopularAlbums();
})

</script>

<template>
  <album-slider :albums="albums"></album-slider>
</template>

<style scoped>

</style>