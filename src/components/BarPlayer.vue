<script setup>
import {useMusicStore} from "@/stores/musicStore.js";
import {apiGetAudioFileUrl, apiGetLyric} from "@/api/song-api.js";
import {onMounted, ref, watch} from "vue";
import router from "@/router/index.js";
const currentMusic = useMusicStore();
const audioRef = ref(null);
const lyricsRef = ref(null)
const lyrics = ref([]);
const activeIndexes = ref([]);
const showSheet = ref(false);
const dialog = ref(false)
const isManuallyScrolled = ref(false);
const sliderTime = ref(0)


let scrollTimeout = null; // 定义滚动定时器
const onScroll = () => {
  if(audioRef.value.paused) return;
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
  audioRef.value.currentTime= time;
  if(audioRef.value.paused)
    audioRef.value.play();
}

const showSheetChange = () => {
  showSheet.value = !showSheet.value;
}

const onTimeUpdate = () => {
  if(!audioRef.value.paused)
    sliderTime.value = audioRef.value.currentTime;

  activeIndexes.value = []
  let currentIndex;
  for (let i = 0; i < lyrics.value.length; i++) {
    if (sliderTime.value >= lyrics.value[i].time) {
      currentIndex= i;
    }
  }
  activeIndexes.value = [currentIndex];

  if (currentIndex > 0 && lyrics.value[currentIndex].time === lyrics.value[currentIndex - 1].time) {
    activeIndexes.value.unshift(currentIndex - 1);
  }

  const container = lyricsRef.value?.$el || lyricsRef.value
  const activeEl = container?.querySelector?.('.active')
  if (activeEl&&!isManuallyScrolled.value) {
    activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const parseLRC = (lrcText) => {
  return lrcText
      .split('\n')
      .map(line => {
        const match = line.match(/\[(\d+):(\d+\.\d+)](.+)/)
        if (match) {
          const time = parseInt(match[1]) * 60 + parseFloat(match[2])
          return { time, text: match[3] }
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

const nextSong = () => {
  if (currentMusic.currentPlaylist.length === 1) {
    audioRef.value.currentTime = 0
    audioRef.value.play()
  }
  else if(currentMusic.currentPlaylist.length > 1)
    currentMusic.nextSong();
}

const previousSong = () => {
  if (currentMusic.currentPlaylist.length === 1) {
    audioRef.value.currentTime = 0
    audioRef.value.play()
  }
  else if(currentMusic.currentPlaylist.length > 1)
    currentMusic.previousSong();

}

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const goToArtist = (artistId) => {
  if (artistId)
  {
    router.push(`/artist/${artistId}`);
    dialog.value=false;
  }
}

const goToAlbum = (albumId) => {
  if (albumId)
  {
    router.push(`/album/${albumId}`);
    dialog.value=false;
  }
}

const goToSong = (songId) => {
  if (songId)
  {
    router.push(`/song/${songId}`);
    dialog.value=false;
  }
}

const volumeTooltipText= ref('')
const updateVolumeTooltipText = () => {
  volumeTooltipText.value = audioRef.value.volume === 0 ? '静音' : `${Math.round(audioRef.value.volume * 100)}%`
}

onMounted(async () => {
  currentMusic.setAudio(audioRef.value);
  loadLRC()
  if (currentMusic.currentSong.id)
    audioRef.value.src = await apiGetAudioFileUrl(currentMusic.currentSong.audioUrl);
  if (audioRef.value) {
    audioRef.value.addEventListener('ended', nextSong)
  }
})

watch(() => currentMusic.currentSong.audioUrl, async (newAudioUrl) => {
  if (newAudioUrl) {
    loadLRC()
    audioRef.value.src = await apiGetAudioFileUrl(newAudioUrl)
    currentMusic.play();
  } else {
    currentMusic.pause();
    audioRef.value.src = ''
    lyrics.value = [];
  }
})

</script>

<template>

  <div class="card fixed bottom-0 left-0 w-full z-50 backdrop-blur bg-base-100/80 shadow-xl border-t border-base-content/10">
    <audio
        ref="audioRef"
        @timeupdate="onTimeUpdate"
        @play="currentMusic.isPlaying=true"
        @pause="currentMusic.isPlaying=false"
        style="width: 100%; max-width: 300px;"
    ></audio>
  <div class="bg-base-100 rounded-tl-xl sm:rounded-t-xl p-4 pb-6 sm:p-8 lg:p-4 lg:pb-6 xl:p-8 space-y-6 sm:space-y-8 lg:space-y-6 xl:space-y-8">
      <div class="flex items-center space-x-3.5 sm:space-x-5 lg:space-x-3.5 xl:space-x-5">
        <img :src="currentMusic.currentSongCoverUrl" alt="" width="160" height="160" class="size-20 rounded-box" />
        <div class="min-w-0 flex-auto space-y-1">

          <p class="text-primary/60 text-sm font-semibold uppercase">
            <abbr title="Episode">Track.</abbr> 05
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
              class=" progress absolute top-0 left-0 h-full bg-primary"
              :style="{ width: (sliderTime / (currentMusic.currentSong.duration || 1)) * 100 + '%' }"
          ></div>

          <!-- 滑动条 -->
          <input
              type="range"
              min="0"
              :max="currentMusic.currentSong.duration || 0"
              step="0.1"
              v-model="sliderTime"
              @input="currentMusic.pause();audioRef.currentTime = sliderTime;"
              @change="currentMusic.play()"
              class="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer
           [&::-webkit-slider-thumb]:appearance-none
           hover:[&::-webkit-slider-thumb]:h-3
           hover:[&::-webkit-slider-thumb]:w-3
           [&::-webkit-slider-thumb]:bg-primary
           [&::-webkit-slider-thumb]:rounded-full
           [&::-webkit-slider-thumb]:shadow"
          >
        </div>
        <div class="text-base-content/40 flex justify-between text-sm font-medium tabular-nums">
          <div>{{formatTime(sliderTime)}}</div>
          <div>{{formatTime(currentMusic.currentSong.duration)}}</div>
        </div>
      </div>

    </div>
    <div class="bg-base-200 lg:rounded-b-xl py-4 px-1 sm:px-3 lg:px-1 xl:px-3 grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-5 xl:grid-cols-7 items-center border-base">
      <button type="button" class="mx-auto">
        <svg width="24" height="24" fill="none">
          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
      <button type="button" class="btn btn-ghost hidden sm:block lg:hidden xl:block mx-auto" @click="previousSong">
        <svg width="17" height="18">
          <path d="M0 0h2v18H0V0zM4 9l13-9v18L4 9z" fill="currentColor" />
        </svg>
      </button>
      <button type="button" class="mx-auto">
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.0108C4 15.9062 4.89543 15.0108 6 15.0108H11.7985C11.7985 15.0108 17 6 24 6Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"></path><path d="M32 15L32 15C32.6232 15.5565 33.1881 16.1797 33.6841 16.8588C35.1387 18.8504 36 21.3223 36 24C36 26.6545 35.1535 29.1067 33.7218 31.0893C33.2168 31.7885 32.6391 32.4293 32 33" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path></svg>
      </button>
      <button
          type="button"
          class="mx-auto p-2 rounded-full transition hover:scale-105 active:scale-95 hover:cursor-pointer"
          @click="playPause"
      >
        <svg v-if=" currentMusic.isPlaying " width="50" height="50" fill="none">
          <circle class="text-base-content/30" cx="25" cy="25" r="24" stroke="currentColor" stroke-width="1.5" />
          <path d="M18 16h4v18h-4V16zM28 16h4v18h-4z" fill="currentColor" />
        </svg>
        <svg v-if=" !currentMusic.isPlaying " width="50" height="50" fill="none" viewBox="0 0 50 50">
          <circle class="text-base-content/30" cx="25" cy="25" r="24" stroke="currentColor" stroke-width="1.5" />
          <path d="M13 9L0 0V18L13 9Z" fill="currentColor" transform="translate(20, 16)" />
        </svg>
      </button>

      <button type="button" class="mx-auto">
        <svg width="34" height="39" fill="none">
          <path d="M12.878 26.12c1.781 0 3.09-1.066 3.085-2.515.004-1.104-.665-1.896-1.824-2.075v-.068c.912-.235 1.505-.95 1.5-1.93.005-1.283-1.048-2.379-2.727-2.379-1.602 0-2.89.968-2.932 2.387h1.274c.03-.801.784-1.287 1.64-1.287.892 0 1.475.541 1.471 1.346.004.844-.673 1.398-1.64 1.398h-.738v1.074h.737c1.21 0 1.91.614 1.91 1.491 0 .848-.738 1.424-1.765 1.424-.946 0-1.683-.486-1.734-1.262H9.797c.055 1.424 1.317 2.395 3.08 2.395zm7.734.025c2.016 0 3.196-1.645 3.196-4.504 0-2.838-1.197-4.488-3.196-4.488-2.003 0-3.196 1.645-3.2 4.488 0 2.855 1.18 4.5 3.2 4.504zm0-1.138c-1.18 0-1.892-1.185-1.892-3.366.004-2.174.716-3.371 1.892-3.371 1.172 0 1.888 1.197 1.888 3.37 0 2.182-.712 3.367-1.888 3.367z" fill="currentColor" />
          <path d="M33 22c0 8.837-7.163 16-16 16S1 30.837 1 22 8.163 6 17 6" stroke="currentColor" stroke-width="1.5" />
          <path d="M17 0l8 6-8 6V0z" fill="currentColor" />
        </svg>
      </button>
      <button type="button" class=" btn btn-ghost hidden sm:block lg:hidden xl:block mx-auto transition hover:cursor-pointer " @click="nextSong">
        <svg  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-7 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"></path></svg>
      </button>

      <button type="button" class="mx-auto border border-base-content/30 rounded-md text-sm font-medium py-0.5 px-2 text-base-content/70 dark:border-gray-600 dark:text-gray-400">
        1.0x
      </button>
    </div>
  </div>
</template>

<style scoped>

</style>