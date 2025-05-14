<script setup>
import {useMusicStore} from "@/stores/musicStore.js";
import {apiGetLyric} from "@/api/song-api.js";
import {onMounted, ref, watch} from "vue";
import { ForwardIcon ,ChevronDownIcon,Bars3Icon,SpeakerWaveIcon,HeartIcon,BackwardIcon,PlayIcon, PauseIcon ,EllipsisHorizontalIcon} from '@heroicons/vue/24/solid'
import { HeartIcon as HeartIconOutline } from "@heroicons/vue/24/outline";
import {useUserLikeStore} from "@/stores/userLikeStore.js";

const currentMusic = useMusicStore();

const lyricsRef = ref(null)
const lyrics = ref([]);
const activeIndexes = ref([]);
const isManuallyScrolled = ref(false);
const sliderTime = ref(0)
const sliderVolume = ref()


let scrollTimeout = null; // 定义滚动定时器
const onScroll = () => {
  if (audioRef.value.paused) return;
  isManuallyScrolled.value = true;

  // 如果之前有滚动定时器，先清除
  clearTimeout(scrollTimeout);

  // 设置一个新的定时器，200ms 后认为用户停止滚动
  scrollTimeout = setTimeout(() => {
    isManuallyScrolled.value = false; // 停止滚动
    console.log('用户停止滚动');
  }, 1000); // 200ms 内没有新地滚动则认为滚动停止
}

const onSheetClick = (time) => {
  audioRef.value.currentTime = time;
  if (audioRef.value.paused)
    audioRef.value.play();
}


const onTimeUpdate = () => {
  if (!audioRef.value.paused) {
    sliderTime.value = audioRef.value.currentTime;
    sliderVolume.value = audioRef.value.volume;
  }

  activeIndexes.value = [];
  let currentIndex;
  for (let i = 0; i < lyrics.value.length; i++) {
    if (sliderTime.value >= lyrics.value[i].time) {
      currentIndex = i;
    }
  }
  activeIndexes.value = [currentIndex];

  if (
      currentIndex > 0 &&
      lyrics.value[currentIndex].time === lyrics.value[currentIndex - 1].time
  ) {
    activeIndexes.value.unshift(currentIndex - 1);
  }

  // 滚动高亮歌词至居中
  const container = lyricsRef.value;
  const activeEl = container?.querySelector('.active');
  if (activeEl && !isManuallyScrolled.value) {
    activeEl.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
};


const parseLRC = (lrcText) => {
  return lrcText
      .split('\n')
      .map(line => {
        const match = line.match(/\[(\d+):(\d+\.\d+)](.+)/)
        if (match) {
          const time = parseInt(match[1]) * 60 + parseFloat(match[2])
          return {time, text: match[3]}
        }
        return null
      })
      .filter(Boolean)
}

const loadLRC = async () => {
  if (!currentMusic.currentSong.id) return;
  const text = await apiGetLyric(currentMusic.currentSong.lyricUrl)
  lyrics.value = parseLRC(text)
}

const playPause = () => {
  if (audioRef.value.paused) {
    currentMusic.play();
  } else {
    currentMusic.pause();
  }
}

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const audioRef = ref(null);

watch(() => currentMusic.currentSong, async () => {
  await loadLRC();
})

onMounted(async () => {
  currentMusic.setAudio(audioRef.value);
  if (audioRef.value) {
    audioRef.value.addEventListener('ended', currentMusic.nextSong)
  }
})

</script>

<template>

  <div v-show="currentMusic.currentSong.id"
       class="flex gap-3 justify-between fixed bottom-0 left-0 w-full h-25 select-none bg-base-200">

    <!--/ 歌曲信息-->
    <div class="flex h-full w-1/4 items-center justify-between px-4">
      <div class="flex gap-4 items-center">
        <!-- 封面图 -->
        <img :src="currentMusic.currentSong.album.cover" alt="" class="size-16 rounded-xl"/>

        <!-- 歌曲信息 -->
        <div class="flex flex-col min-w-0 gap-0.5">
          <!-- 标题：大、清晰、有设计感 -->
          <div class="flex gap-2">
            <h2 class="text-base font-bold font-inter text-base-content truncate">
              {{ currentMusic.currentSong.title }}
            </h2>
            <button @click="useUserLikeStore().toggleLike(currentMusic.currentSong.id,'song')" class="ml-3 ">
              <HeartIconOutline v-if="!useUserLikeStore().isLiked(currentMusic.currentSong.id,'song')" class="w-5 h-5"></HeartIconOutline>
              <HeartIcon v-else class="text-error w-5 h-5"></HeartIcon>
            </button>
            <!-- 更多按钮 -->
            <EllipsisHorizontalIcon class="w-5 h-5"/>
          </div>

          <!-- 艺术家名：小一号，稍微淡一点，但仍然清晰 -->
          <p class="text-sm font-medium font-inter text-base-content/80 truncate">
            {{ currentMusic.currentSong.artist.name }}
          </p>

          <!-- 专辑信息：再小一号，用另一种字体（如 serif 或 rounded）作区分 -->
          <p class="text-xs font-normal font-jetbrains text-base-content/60 truncate">
            出自专辑：{{ currentMusic.currentSong.album.title }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex flex-col justify-between items-center gap-2 h-full w-1/2 px-4">

      <div class="flex  gap-6 mt-6">
        <!-- 上一首 -->
        <button @click="currentMusic.previousSong" type="button">
          <BackwardIcon class="w-5 h-5 text-base-content hover:text-primary" />
        </button>

        <!-- 播放 / 暂停 -->
        <button @click="playPause" type="button">
          <PauseIcon v-if="currentMusic.isPlaying" class="w-9 h-9" />
          <PlayIcon v-else class="w-9 h-9" />
        </button>

        <!-- 下一首 -->
        <button @click="currentMusic.nextSong" type="button">
          <ForwardIcon class="w-5 h-5 text-base-content hover:text-primary" />
        </button>
      </div>

      <!-- 进度条和时间 -->
      <div class="flex items-center w-7/10 mb-2 gap-3 text-xs text-base-content/60">
        <span class="w-10 text-right font-mono text-sm text-base-content/80">{{ formatTime(sliderTime) }}</span>

        <div class="relative flex-1 h-1 rounded-full bg-base-content/20">
          <!-- 播放进度 -->
          <div
              :style="{ width: (sliderTime / (currentMusic.currentSong.duration || 1)) * 100 + '%' }"
              class="absolute w-full top-0 left-0 h-full bg-base-content rounded-full"
          ></div>

          <!-- 滑块 -->
          <input
              v-model="sliderTime"
              :max="currentMusic.currentSong.duration || 0"
              class="absolute w-full inset-0 w-full h-full appearance-none bg-transparent cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          hover:[&::-webkit-slider-thumb]:h-3
          hover:[&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:bg-base-content
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:shadow"
              min="0"
              step="0.1"
              type="range"
              @change="currentMusic.play()"
              @input="currentMusic.pause();audioRef.currentTime = sliderTime;"
          />
        </div>

        <span class="w-10 text-left font-mono text-sm text-base-content/80">{{ formatTime(currentMusic.currentSong.duration) }}</span>

      </div>
    </div>

    <!--/ 其他按钮 -->
    <div class="flex h-full w-1/4 justify-end items-center gap-4">
      <!-- 歌单和歌曲列表 -->
      <div class="dropdown dropdown-top dropdown-center flex">
        <button
            class="p-2"
            tabindex="0"
        >
          <label class=" cursor-pointer">
            <Bars3Icon class="h-6 w-6"/>
          </label>
        </button>


        <ul class="menu menu-sm dropdown-content bg-base-100 rounded-box z-2 mt-2 w-52 p-2 shadow text-base"
            tabindex="0">
          <li v-for="thisSong in currentMusic.currentPlaylist" :key="thisSong.id"
              @click="currentMusic.setCurrentSong(currentMusic.currentPlaylist.findIndex(song => song.id === thisSong.id))">
            <a class="flex items-center gap-2 py-1">
              <i v-if="thisSong.id === currentMusic.currentSong?.id" class="mdi mdi-music text-primary text-sm"></i>
              <span :title="`${thisSong.title} - ${thisSong.artist.name}`"
                    class="truncate max-w-[10rem] text-base font-medium">
              {{ thisSong.title }} - {{ thisSong.artist.name }}
            </span>
            </a>
          </li>
        </ul>
      </div>
      <!-- 音量控制 -->
      <div class="dropdown dropdown-top dropdown-center flex">
        <button class="" tabindex="0">
          <SpeakerWaveIcon class="w-6 h-6"/>
        </button>
        <div class="dropdown-content relative w-8 h-32 p-1 bg-base-100 rounded-box shadow">
          <div class="absolute inset-x-1/2 top-2 bottom-0 w-1 -translate-x-1/2 bg-base-300 rounded-full"></div>
          <div :style="{ height: ((sliderVolume || 0) * 100) + '%' }"
               class="absolute bottom-0 left-1/2 w-1.5 -translate-x-1/2 bg-primary rounded-full"></div>
          <input v-model="sliderVolume" class="absolute w-32 h-8 -rotate-90 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 appearance-none bg-transparent cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none
        hover:[&::-webkit-slider-thumb]:h-3
        hover:[&::-webkit-slider-thumb]:w-3
        [&::-webkit-slider-thumb]:bg-primary
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:shadow"
                 max="1" min="0" step="0.01" type="range" @input="audioRef.volume = sliderVolume" />
          <div class="absolute top-[-20px] left-1/2 -translate-x-1/2 text-xs">{{ ((audioRef?.volume || 0) * 100).toFixed(0) + '%' }}</div>
        </div>
      </div>
      <button
          id="toggleButton"
          class="transition-transform duration-300 mr-6"
          onclick="this.classList.toggle('rotate-180');musicModal.show();"
      >
        <label>
          <ChevronDownIcon
              :class="['transition-transform', 'duration-300', { 'rotate-180': rotated }]"
              class="h-6 w-6"
          />
        </label>

      </button>
    </div>
    <audio
        ref="audioRef"
        :src="currentMusic.currentSong.audio"
        style="width: 100%; max-width: 300px;"
        @pause="currentMusic.isPlaying=false"
        @play="currentMusic.isPlaying=true"
        @timeupdate="onTimeUpdate"
    ></audio>
  </div>

  <dialog id="musicModal" class="modal  modal-start modal-bottom  w-full h-screen ">
    <div
        class="modal-box w-full w-full  p-0 rounded-none bg-black text-white"
    >
        <!-- 模糊背景图 -->
        <img
            :src="currentMusic.currentSong.album.cover"
            alt="背景图"
            class="absolute top-0 left-0 w-full h-full blur-[30px] opacity-40 object-cover z-[1] select-none"
        />

        <!-- 关闭按钮 -->
        <form method="dialog">
          <button
              class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 z-13 text-white bg-black/30">
            <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
              <path d="M14 14H20V16H16V20H14V14Z" fill="currentColor"/>
              <path d="M10 4V10H4V8H8V4H10Z" fill="currentColor"/>
              <path d="M4 14H10V20H8V16H4V14Z" fill="currentColor"/>
              <path d="M14 4H16V8H20V10H14V4Z" fill="currentColor"/>
            </svg>

          </button>
        </form>

        <!-- 歌曲信息 + 封面 -->
        <div class="flex flex-col items-center justify-center h-full relative z-10">

          <!-- 封面 -->
          <img
              :src="currentMusic.currentSong.album.cover"
              alt="歌曲封面"
              class="rounded-lg shadow-lg w-48 h-48 object-cover cursor-pointer"
              @click="goToAlbum(currentMusic.currentSong.album.id)"
          />

          <!-- 歌曲标题 & 歌手 -->
          <div class="text-center mt-4">
            <div
                class="text-xl font-bold cursor-pointer"
                @click="goToSong(currentMusic.currentSong.id)"
            >
              {{ currentMusic.currentSong.title || '未知歌曲' }}
            </div>
            <div
                class="text-base text-gray-300 cursor-pointer"
                @click="goToArtist(currentMusic.currentSong.artist.id)"
            >
              {{ currentMusic.currentSong.artist.name || '未知歌手' }}
            </div>
          </div>

          <!-- 歌词 -->
          <div
              ref="lyricsRef"
              class="mt-4 overflow-y-auto scrollbar-hide w-full max-w-xl h-[464px] px-4 text-center"
              @scroll="onScroll"
          >
            <div
                v-for="(line, index) in lyrics"
                :key="index"
                :class="[
                'py-1 transition-all:duration-2s',
                { 'font-bold text-cyan-300 active': activeIndexes.includes(index) }
              ]"
                style="cursor: pointer; user-select: none;"
                @dblclick="onSheetClick(line.time)"
            >
              {{ line.text }}
            </div>
          </div>

          <!-- 进度条 -->
          <div class="flex items-center justify-center gap-4 mt-6">
            <span class="text-sm">{{ formatTime(sliderTime) || '00:00' }}</span>
            <input
                v-if="currentMusic.currentSong.id"
                v-model="sliderTime"
                :max="audioRef.duration"
                class="range range-xs range-accent w-72"
                min="0"
                type="range"
                @change="currentMusic.play()"
                @input="currentMusic.pause(); audioRef.currentTime = sliderTime"
            />
            <span v-if="currentMusic.currentSong.id" class="text-sm">{{ formatTime(audioRef.duration) || '00:00' }}</span>
          </div>

          <!-- 控制按钮 -->
          <div class="flex items-center justify-center gap-4 mt-4 flex-wrap">
            <button class="btn btn-sm btn-ghost text-white" @click="toggleRepeat">
              <i class="mdi mdi-repeat text-xl"></i>
            </button>
            <button class="btn btn-sm btn-ghost text-white" @click="currentMusic.previousSong">
              <i class="mdi mdi-skip-previous text-xl"></i>
            </button>
            <button class="btn btn-sm btn-ghost text-white" @click="playPause">
              <i :class="currentMusic.isPlaying ? 'mdi mdi-pause' : 'mdi mdi-play'" class="text-xl"></i>
            </button>
            <button class="btn btn-sm btn-ghost text-white" @click="currentMusic.nextSong">
              <i class="mdi mdi-skip-next text-xl"></i>
            </button>
            <!-- 播放列表按钮 -->
            <div class="dropdown dropdown-top">
              <label class="btn btn-sm btn-ghost text-white" tabindex="0">
                <i class="mdi mdi-playlist-music text-xl"></i>
              </label>
              <ul class="dropdown-content menu p-2 shadow bg-black/60 backdrop-blur-md rounded-box w-64 text-white max-h-80 overflow-y-auto"
                  tabindex="0">
                <li v-for="thisSong in currentMusic.currentPlaylist" :key="thisSong.id">
                  <div class="flex justify-between items-center">
                <span
                    :class="{ 'font-bold text-cyan-300': thisSong.id === currentMusic.currentSong.id }"
                    @click="currentMusic.setCurrentSong(currentMusic.currentPlaylist.findIndex(song => song.id === thisSong.id))"
                >
                  {{ thisSong.title }} - {{ thisSong.artist.name }}
                </span>
                    <button
                        @click="currentMusic.deleteSongFromPlaylist(currentMusic.currentPlaylist.findIndex(song => song.id === thisSong.id))">
                      <i class="mdi mdi-close text-sm"></i>
                    </button>
                  </div>
                </li>
              </ul>
            </div>

            <!-- 音量控制 -->
            <div class="dropdown dropdown-top">
              <label class="btn btn-sm btn-ghost text-white" tabindex="0">
                <i class="mdi mdi-volume-high text-xl"></i>
              </label>
              <div class="dropdown-content bg-black/60 backdrop-blur-md rounded-lg p-2 flex justify-center items-center h-36 w-12"
                   tabindex="0">
                <input
                    v-if="currentMusic.currentSong.id"
                    v-model="audioRef.volume"
                    class="range range-accent range-vertical h-full"
                    max="1"
                    min="0"
                    step="0.01"
                    type="range"
                />
              </div>
            </div>

            <!-- 更多按钮 -->
            <button class="btn btn-sm btn-ghost text-white">
              <i class="mdi mdi-dots-vertical text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </dialog>



</template>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.8);
  }
}

.bar {
  transform-origin: bottom center;
  animation: bounce 1s infinite ease-in-out;
}

.bar1 {
  animation-delay: 0s;
}

.bar2 {
  animation-delay: 0.2s;
}

.bar3 {
  animation-delay: 0.4s;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}


</style>