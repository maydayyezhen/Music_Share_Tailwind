<script setup>
import {useUserLikeStore} from "@/stores/userLikeStore.js";
import {onMounted, ref} from "vue";
import AlbumCards from "@/components/AlbumCards.vue";
import {apiGetAudio, apiGetLyric, apiGetSongById} from "@/api/song-api.js";
import {apiGetAlbumById} from "@/api/album-api.js";
import SongList from "@/components/SongList.vue";


const tabs = [
  { key: 'songs', label: '歌曲' },
  { key: 'songLists', label: '歌单' },
  { key: 'albums', label: '专辑' },
  { key: 'videos', label: '视频' },
];
const activeTab = ref('songs');
const changeTab = (key) => {
  activeTab.value = key;
}
const userLikeStore = useUserLikeStore()
const songs = ref([]);
const albums = ref([]);

const getSongs = async () => {
  for(const id of userLikeStore.likedSongIds){
    const song = await apiGetSongById(id);
    song.audio = await apiGetAudio(song.audioUrl);
    song.lyric = await apiGetLyric(song.lyricUrl);
    song.album.cover = await apiGetAudio(song.album.coverUrl);
    songs.value.push(song)
  }
}
const getAlbums = async () =>{
  for(const id of userLikeStore.likedAlbumIds){
    const album = await apiGetAlbumById(id);
    album.cover = await apiGetAudio(album.coverUrl);
    albums.value.push(album)
  }
}
onMounted(
    async () => {
      await getSongs();
      await getAlbums();
    }
)
</script>

<template>
  <h3 class="text-3xl font-semibold mb-6 mt-8 ml-4">我的收藏</h3>
  <div role="tablist" class="tabs tabs-bordered mb-10">
    <a
        v-for="tab in tabs"
        :key="tab.key"
        role="tab"
        class="tab inline-block relative py-2 px-6 mr-6 hover:text-primary font-roboto text-lg"
        :class="{ 'tab-active text-primary': activeTab === tab.key }"
        @click="changeTab(tab.key)"
    >
      {{ tab.label }}{{userLikeStore.getLikedLength(tab.key)}}
      <span
          v-if="activeTab === tab.key"
          class="absolute bottom-0 left-1/4 w-1/2 h-1 bg-primary rounded-box"
      ></span>
    </a>
  </div>
  <div v-if="activeTab === 'songs'">
    <song-list :songs="songs"></song-list>
  </div>
  <div v-else-if="activeTab === 'albums'">
    <album-cards :albums="albums"></album-cards>
  </div>
</template>

<style scoped>

</style>