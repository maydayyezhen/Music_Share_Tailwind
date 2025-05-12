<script setup>
import { ref, watch} from "vue";
import {useMusicStore} from "@/stores/musicStore.js";
import router from "@/router/index.js";
import Pagination from "@/components/Pagination.vue";
import {useUserLikeStore} from "@/stores/userLikeStore.js";
import { HeartIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { PlayIcon, PauseIcon } from '@heroicons/vue/24/outline'



const props = defineProps({
      songs: Object,
      page: Object,
      showTrackNum: {
        type: Boolean,
        default: false
      }
    }
)

const currentMusic = useMusicStore();
const userLikeStore = useUserLikeStore();
const emit = defineEmits(["reloadSongs", "page-change"]);
const isSongModalVisible = ref(false)


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
    const index =props.songs.findIndex(song => song.id === currentSong.id)
    currentMusic.setCurrentSong(index);
  }
};

watch(isSongModalVisible, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    emit("reloadSongs");
  }
})

</script>

<template>
  <div>
    <ul class="list bg-base-100 rounded-box shadow-md">
      <li class="list-row hover:bg-base-200"
          v-for="song in songs"
          :key="song.id"
          :class="currentMusic.currentSong?.id === song.id ? 'font-bold text-primary bg-base-200' : ''">
        <div v-if="showTrackNum" class="text-4xl font-thin opacity-30 tabular-nums w-12 text-center">
          {{ song.trackNum != null ? String(song.trackNum).padStart(2, '0') : '00' }}
        </div>

        <div>
          <img v-if="song.album.cover" class="size-10 rounded-box" :src="song.album.cover" alt="专辑封面" @click="router.push(`/album_detail/${song.album.id}`)"/>
          <div v-else class="skeleton size-10 rounded-box"></div>
        </div>
        <div class="list-col-grow">
          <div @click="router.push(`/song_detail/${song.id}`)">{{song.title}}</div>
          <div class="text-xs uppercase font-semibold opacity-60" @click="router.push(`/artist_detail/${song.artist.id}`)">{{song.artist.name}}</div>
        </div>
        <button class="btn btn-square btn-ghost" @click="togglePlayPause(song)">
          <component
              v-if="currentMusic.currentSong.id !== song.id || !currentMusic.isPlaying"
              :is="PlayIcon"
              class="w-6 h-6"
          />
          <component
              v-if="currentMusic.currentSong.id === song.id && currentMusic.isPlaying"
              :is="PauseIcon"
              class="w-6 h-6"
          />
        </button>
        <div class="relative inline-block">
          <button
              class="btn btn-square btn-ghost text-red-500 text-2xl"
              @click="userLikeStore.toggleLike(song.id,'song');song.likeCount -= userLikeStore.isLiked(song.id,'song') ? 1 : -1;"
          >
            <component
                :is="userLikeStore.isLiked(song.id, 'song') ? HeartSolidIcon : HeartIcon"
                class="w-6 h-6"
            />
          </button>
          <span
              class="absolute -top-1 -right-1 bg-base-300 text-[10px] font-medium px-1 py-0.5 rounded-full"
          >
  {{ song.likeCount }}
</span>

        </div>

      </li>
    </ul>

    <!-- 分页组件 -->
    <div class="mt-4 mb-4"> <!-- 增加一些顶部空间 -->
      <pagination
          v-if="page"
          :number="page.number"
          :size="page.size"
          :total-pages="page.totalPages"
          @change="(number, size) => emit('page-change', number, size)"
          :sizeInput="false"
          :numberInput="false"
      >
      </pagination>
    </div>
  </div>
</template>


<style scoped>

</style>