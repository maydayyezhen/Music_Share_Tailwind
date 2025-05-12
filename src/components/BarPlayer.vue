<script setup>
import {useMusicStore} from "@/stores/musicStore.js";
import {apiGetLyric} from "@/api/song-api.js";
import {onMounted, ref, watch} from "vue";
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
       class="card fixed bottom-0 left-0 w-full z-50 backdrop-blur bg-base-100/80 shadow-xl border-t border-base-content/10">
    <audio
        ref="audioRef"
        :src="currentMusic.currentSong.audio"
        style="width: 100%; max-width: 300px;"
        @pause="currentMusic.isPlaying=false"
        @play="currentMusic.isPlaying=true"
        @timeupdate="onTimeUpdate"
    ></audio>
    <div
        class="bg-base-100 rounded-tl-xl sm:rounded-t-xl p-4 pb-6 sm:p-8 lg:p-4 lg:pb-6 xl:p-8 space-y-6 sm:space-y-8 lg:space-y-6 xl:space-y-8">
      <div class="flex items-center space-x-3.5 sm:space-x-5 lg:space-x-3.5 xl:space-x-5">
        <img :src="currentMusic.currentSong.album.cover" alt="" class="size-20 rounded-box" height="160" width="160"/>
        <div class="min-w-0 flex-auto space-y-1">

          <p class="text-primary/60 text-sm font-semibold uppercase">
            <abbr title="Episode">Track.</abbr>
            {{ currentMusic.currentSong.trackNum != null ? String(currentMusic.currentSong.trackNum).padStart(2, '0') : '00' }}
          </p>

          <!-- 歌曲名 -->
          <h2 class="text-lg sm:text-xl font-bold text-base-content truncate overflow-hidden whitespace-nowrap">
            {{ currentMusic.currentSong.title }}
          </h2>

          <!-- 歌手名 -->
          <p class="text-sm sm:text-base text-base-content/70 font-medium truncate overflow-hidden whitespace-nowrap">
            {{ currentMusic.currentSong.artist.name }}
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <div class="relative w-full h-1.5 rounded-full bg-base-content/20">
          <!-- 已播放的颜色条 -->
          <div
              :style="{ width: (sliderTime / (currentMusic.currentSong.duration || 1)) * 100 + '%' }"
              class=" progress absolute top-0 left-0 h-full bg-primary"
          ></div>

          <!-- 滑动条 -->
          <input
              v-model="sliderTime"
              :max="currentMusic.currentSong.duration || 0"
              class="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer
           [&::-webkit-slider-thumb]:appearance-none
           hover:[&::-webkit-slider-thumb]:h-3
           hover:[&::-webkit-slider-thumb]:w-3
           [&::-webkit-slider-thumb]:bg-primary
           [&::-webkit-slider-thumb]:rounded-full
           [&::-webkit-slider-thumb]:shadow"
              min="0"
              step="0.1"
              type="range"
              @change="currentMusic.play()"
              @input="currentMusic.pause();audioRef.currentTime = sliderTime;"
          >
        </div>
        <div class="text-base-content/40 flex justify-between text-sm font-medium tabular-nums">
          <div>{{ formatTime(sliderTime) }}</div>
          <div>{{ formatTime(currentMusic.currentSong.duration) }}</div>
        </div>
      </div>

    </div>
    <div
        class="bg-base-200 lg:rounded-b-xl py-4 px-1 sm:px-3 lg:px-1 xl:px-3 grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-5 xl:grid-cols-7 items-center border-base">


      <div class="dropdown dropdown-top dropdown-center flex">
        <button class="btn btn-ghost hidden sm:block lg:hidden xl:block mx-auto" tabindex="0">
          <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 6h18v2H3V6zm0 5h12v2H3v-2zm0 5h18v2H3v-2z"/>
          </svg>
        </button>
        <ul
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-2 mt-3 w-60 p-3 shadow text-base"
            tabindex="0"
        >
          <li
              v-for="thisSong in currentMusic.currentPlaylist"
              :key="thisSong.id"
              @click="currentMusic.setCurrentSong(currentMusic.currentPlaylist.findIndex(song => song.id === thisSong.id))"
          >
            <a class="flex items-center gap-3 py-2">
              <svg
                  v-if="thisSong.id === currentMusic.currentSong?.id"
                  class="w-5 h-5 text-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
              >
                <rect class="bar bar1" height="16" rx="1" width="3" x="3" y="4"/>
                <rect class="bar bar2" height="20" rx="1" width="3" x="10" y="2"/>
                <rect class="bar bar3" height="12" rx="1" width="3" x="17" y="6"/>
              </svg>

              <span
                  :title="`${thisSong.title} - ${thisSong.artist.name}`"
                  class="truncate max-w-[11rem] text-base font-medium"
              >
        {{ thisSong.title }} - {{ thisSong.artist.name }}
      </span>
            </a>
          </li>
        </ul>
      </div>


      <button class="mx-auto" type="button">
        <svg fill="none" height="28" viewBox="0 0 48 48" width="28" xmlns="http://www.w3.org/2000/svg">
          <path
              d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.0108C4 15.9062 4.89543 15.0108 6 15.0108H11.7985C11.7985 15.0108 17 6 24 6Z"
              fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"></path>
          <path
              d="M32 15L32 15C32.6232 15.5565 33.1881 16.1797 33.6841 16.8588C35.1387 18.8504 36 21.3223 36 24C36 26.6545 35.1535 29.1067 33.7218 31.0893C33.2168 31.7885 32.6391 32.4293 32 33"
              stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"></path>
        </svg>
      </button>
      <button class="btn btn-ghost hidden sm:block lg:hidden xl:block mx-auto" type="button" @click="currentMusic.previousSong">
        <svg height="18" width="17">
          <path d="M0 0h2v18H0V0zM4 9l13-9v18L4 9z" fill="currentColor"/>
        </svg>
      </button>
      <button
          class="mx-auto p-2 rounded-full transition hover:scale-105 active:scale-95 hover:cursor-pointer"
          type="button"
          @click="playPause"
      >
        <svg v-if=" currentMusic.isPlaying " fill="none" height="50" width="50">
          <circle class="text-base-content/30" cx="25" cy="25" r="24" stroke="currentColor" stroke-width="1.5"/>
          <path d="M18 16h4v18h-4V16zM28 16h4v18h-4z" fill="currentColor"/>
        </svg>
        <svg v-if=" !currentMusic.isPlaying " fill="none" height="50" viewBox="0 0 50 50" width="50">
          <circle class="text-base-content/30" cx="25" cy="25" r="24" stroke="currentColor" stroke-width="1.5"/>
          <path d="M13 9L0 0V18L13 9Z" fill="currentColor" transform="translate(20, 16)"/>
        </svg>
      </button>


      <button class=" btn btn-ghost hidden sm:block lg:hidden xl:block mx-auto transition hover:cursor-pointer "
              type="button"
              @click="currentMusic.nextSong">
        <svg fill="none" height="18" viewBox="0 0 17 18" width="17">
          <path d="M17 0H15V18H17V0Z" fill="currentColor"/>
          <path d="M13 9L0 0V18L13 9Z" fill="currentColor"/>
        </svg>
      </button>
      <div class="dropdown dropdown-top dropdown-center flex">
        <button class="btn btn-ghost hidden sm:block lg:hidden xl:block mx-auto" tabindex="0">
          <svg fill="none" height="28" viewBox="0 0 48 48" width="28" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.0108C4 15.9062 4.89543 15.0108 6 15.0108H11.7985C11.7985 15.0108 17 6 24 6Z"
                fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"></path>
            <path
                d="M32 15L32 15C32.6232 15.5565 33.1881 16.1797 33.6841 16.8588C35.1387 18.8504 36 21.3223 36 24C36 26.6545 35.1535 29.1067 33.7218 31.0893C33.2168 31.7885 32.6391 32.4293 32 33"
                stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"></path>
          </svg>
        </button>
        <div class="dropdown-content relative w-10 h-40 p-1 bg-base-100  rounded-box shadow">
          <!-- 背景轨道 -->
          <div class="absolute inset-x-1/2 top-2 bottom-0 w-1 -translate-x-1/2 bg-base-300 rounded-full"></div>

          <!-- 动态进度条，靠下对齐 -->
          <div
              :style="{ height: ((sliderVolume || 0) * 100) + '%' }"
              class="absolute bottom-0 left-1/2 w-1.5 -translate-x-1/2 bg-primary rounded-full"
          ></div>

          <!-- 滑块 -->
          <input
              v-model="sliderVolume"
              class="absolute w-40 h-10 -rotate-90 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 appearance-none bg-transparent cursor-pointer
      [&::-webkit-slider-thumb]:appearance-none
      hover:[&::-webkit-slider-thumb]:h-3
      hover:[&::-webkit-slider-thumb]:w-3
      [&::-webkit-slider-thumb]:bg-primary
      [&::-webkit-slider-thumb]:rounded-full
      [&::-webkit-slider-thumb]:shadow"
              max="1"
              min="0"
              step="0.01"
              type="range"
              @input="audioRef.volume = sliderVolume;"
          />

          <!-- 音量文本 -->
          <div class="absolute top-[-20px] left-1/2 -translate-x-1/2 text-xs">
            {{ ((audioRef?.volume || 0) * 100).toFixed(0) + '%' }}
          </div>
        </div>
      </div>

      <button class="btn btn-ghost hidden sm:block lg:hidden xl:block mx-auto " onclick="musicModal.showModal()">
        <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
          <path d="M4 4H10V6H6V10H4V4Z" fill="currentColor"/>
          <path d="M20 4V10H18V6H14V4H20Z" fill="currentColor"/>
          <path d="M4 14H6V18H10V20H4V14Z" fill="currentColor"/>
          <path d="M20 14V20H14V18H18V14H20Z" fill="currentColor"/>
        </svg>
      </button>

    </div>
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