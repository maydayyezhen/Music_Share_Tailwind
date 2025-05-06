<script setup>
import {computed, ref, watch} from "vue";
import {useMusicStore} from "@/stores/musicStore.js";
import {
  apiDeleteAudioFileBySongId,
  apiDeleteLrcFileBySongId,
  apiDeleteSongById,
  apiUpdateSong
} from "@/api/song-api.js";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/authStore.js";
import {apiGetCoverFileUrl} from "@/api/album-api.js";

const props = defineProps(['songs']);
const editingSong = ref(null);//用于存储被编辑歌曲的数据
const currentMusic = useMusicStore();
const authStore = useAuthStore();
const emit = defineEmits(["reloadSongs"]);
const songs = ref([])
const isSongModalVisible = ref(false)
const selectedSong = ref(null) // 当前要编辑的歌曲
const coverUrls = ref({});


const openAddSongModal = () => {
  selectedSong.value = null
  isSongModalVisible.value = true
}

const urlMap = ref({})

const togglePlayPause = (currentSong) => {
  if(currentMusic.currentSong.id === currentSong.id) {
    if(currentMusic.isPlaying) {
      currentMusic.pause();
    }
    else {
      currentMusic.play();
    }
  }
  else {
    currentMusic.setCurrentPlayList(props.songs);
    currentMusic.setCurrentAlbumUrlList(coverUrls.value);
    const index =props.songs.findIndex(song => song.id === currentSong.id)
    currentMusic.setCurrentSong(index);
  }
};

watch(isSongModalVisible, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    emit("reloadSongs");
  }
})

watch(
    () => props.songs,
    async (newSongs) => {
      if (!newSongs || newSongs.length === 0) return;
      for (const [index, song] of newSongs.entries()) {
        urlMap.value[index] = await apiGetCoverFileUrl(song.album.coverUrl);
      }
      coverUrls.value = urlMap.value;
    },
    { immediate: true } // 初始就触发一次
);
const liked = ref(false)
</script>

<template>
  <ul class="list bg-base-100 rounded-box shadow-md">
    <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Most played songs this week</li>
    <li class="list-row" v-for="(song, index) in props.songs" :key="index">
      <div><img v-if="coverUrls[index]" class="size-10 rounded-box" :src=coverUrls[index] alt=""/></div>
      <div>
        <div>{{song.title}}</div>
        <div class="text-xs uppercase font-semibold opacity-60">{{song.artist.name}}</div>
      </div>
      <button class="btn btn-square btn-ghost" @click="togglePlayPause(song)">
        <!-- 播放图标 -->
        <svg v-if="currentMusic.currentSong.id !== song.id || !currentMusic.isPlaying"
             class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 3L20 12 6 21 6 3z"></path>
        </svg>

        <!-- 暂停图标 -->
        <svg v-if="currentMusic.currentSong.id === song.id && currentMusic.isPlaying"
             class="size-[1.6em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
             fill="currentColor">
          <path d="M8 5h2.5v14H8V5zm5.5 0H16v14h-2.5V5z" />
        </svg>

      </button>
      <button class="btn btn-square btn-ghost" @click="liked = !liked">
        <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 24 24"
             :fill="liked ? 'red' : 'none'"
             stroke="red">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </button>

    </li>
  </ul>
</template>

<style scoped>

</style>