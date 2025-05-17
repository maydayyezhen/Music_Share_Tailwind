<script setup>
import {useMusicStore} from "@/stores/musicStore.js";
import {PauseIcon, PlayIcon, XMarkIcon} from "@heroicons/vue/24/solid/index.js";
import {nextTick, onMounted, ref, watch} from "vue";
import router from "@/router/index.js";
import PlayingBarsIcon from "@/components/icons/PlayingBarsIcon.vue";
import {apiGetCover} from "@/api/album-api.js";

const musicStore = useMusicStore();
const togglePlayPause = (index,id) => {
  if (musicStore.currentSong.id === id) {
    if(musicStore.isPlaying)
      musicStore.pause();
    else
      musicStore.play();
  }
  else
  musicStore.setCurrentSong(index);
}
const songRefs = ref([])

// 自动滚动：每次播放歌曲切换时触发
watch(() => musicStore.currentSongIndex, async (newIndex) => {
  await nextTick()
  const el = songRefs.value[newIndex]
  if (el?.scrollIntoView) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
})

async function loadCover(song) {
  const src = song.album.coverUrl;
  if (src) {
    song.album.cover = await apiGetCover(src);
  }
}
const display= ref(false);
onMounted(() => {display.value = true;})
watch(() => musicStore.currentPlaylist, async () => {
  display.value = false;
  await nextTick();
  display.value = true;
});


</script>

<template>
  <div class="p-2 select-none" v-if="display">
    <h6 class="ml-3 mt-2 mb-4 text-lg  uppercase tracking-widest">播放列表</h6>
    <div
        class="flex flex-col gap-2 px-1 pb-20 scrollbar scrollbar-thumb-base-content scrollbar-track-transparent overflow-auto max-h-[calc(100%-3rem)]"
    >
      <div
          v-for="(song, index) in musicStore.currentPlaylist"
          :key="song.id"
          :ref="el => songRefs[index] = el"
      >
        <h6
            v-if="musicStore.currentSongIndex === index"
            class="ml-3 mt-8 mb-2 text-xs uppercase tracking-widest"
        >
          正在播放 • 来自《 <a class="hover:underline cursor-pointer" @click="router.push('/album_detail/'+song.album.id)">{{ song.album.title }}</a>》
        </h6>

        <h6
            v-if="musicStore.currentSongIndex + 1 === index"
            class="ml-3 mt-8 mb-2 text-xs uppercase tracking-widest"
        >
          下一首 • 来自《<a class="hover:underline cursor-pointer" @click="router.push('/album_detail/'+song.album.id)">{{ song.album.title }}</a>》
        </h6>

        <div
            class="group flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-base-300 cursor-pointer transition"
            :class="{
    'opacity-50': index < musicStore.currentSongIndex,
  }"
            @click.self="togglePlayPause(index, song.id)"
        >

        <!-- 左侧封面 -->
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="relative w-12 h-12"  v-lazy-img="() => !song.album.cover && loadCover(song)">
              <img
                  v-if="song.album.cover"
                  :src="song.album.cover"
                  class="h-full w-full rounded-lg object-cover"
                  :class="{ 'brightness-50': musicStore.currentSong.id === song.id }"
              />
              <div v-else class="skeleton w-full h-full"></div>

              <!-- 播放/暂停按钮（仅在 hover 时显示） -->
              <button
                  class="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-opacity opacity-0 cursor-pointer group-hover:opacity-100"
                  @click.stop="togglePlayPause(index, song.id)"
              >
                <component
                    :is="
        musicStore.currentSong?.id === song.id &&
        musicStore.isPlaying
          ? PauseIcon
          : PlayIcon
      "
                    class="w-5 h-5 text-white"
                />
              </button>

              <!-- 正在播放图标（仅在当前播放 && 没有 hover 时显示） -->
              <div
                  v-if="musicStore.currentSong?.id === song.id && musicStore.isPlaying"
                  class="absolute bottom-1 right-1 z-10"
              >
                <PlayingBarsIcon class="w-4 h-4 animate-pulse text-white" />
              </div>
            </div>

            <div class="flex flex-col overflow-hidden">
              <div class="truncate font-medium  text-base-content hover:underline cursor-pointer"
                   @click="router.push('/song_detail/'+song.id)"
                   :class="{'text-primary': index === musicStore.currentSongIndex,}">
                {{ song.title }}
              </div>
              <div class="text-xs text-base-content/50 truncate cursor-pointer hover:underline" @click="router.push('/artist_detail/'+song.artist.id)">
                {{ song.artist.name }}
              </div>
            </div>
          </div>

          <!-- 右侧删除按钮 -->
          <button
              class=" hover:brightness-75 cursor-pointer"
              @click.stop="musicStore.deleteSongFromPlaylist(index)"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>


</template>


<style scoped>

</style>