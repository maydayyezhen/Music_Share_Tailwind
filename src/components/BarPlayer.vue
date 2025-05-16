<script setup>
import {useMusicStore} from "@/stores/musicStore.js";
import {apiGetLyric} from "@/api/song-api.js";
import { onMounted, ref, watch} from "vue";
import { ForwardIcon ,ChevronDownIcon,Bars3Icon,SpeakerWaveIcon,TrashIcon,HeartIcon,BackwardIcon,PlayIcon, PauseIcon ,EllipsisHorizontalIcon} from '@heroicons/vue/24/solid'
import { HeartIcon as HeartIconOutline } from "@heroicons/vue/24/outline";
import {useUserLikeStore} from "@/stores/userLikeStore.js";
import {useRouter} from "vue-router";
import PlayList from "@/components/PlayList.vue";
import {FastAverageColor} from "fast-average-color";

const currentMusic = useMusicStore();

const router = useRouter();
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


function smoothScrollTo(container, target) {
  if (!container || !target) return;

  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  // 计算目标滚动的偏移量（使目标居中）
  const targetScrollTop = container.scrollTop + (targetRect.top - containerRect.top) - container.clientHeight / 2 + target.clientHeight / 2;

  const startScrollTop = container.scrollTop;
  const distance = targetScrollTop - startScrollTop;
  const duration = 500; // 滚动时长，单位ms
  let startTime = null;

  function easeInOutQuad(t) {
    return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // 缓动函数，效果更自然
  }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutQuad(progress);

    container.scrollTop = startScrollTop + distance * easedProgress;

    if (elapsed < duration) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
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
    if (!container || container.offsetHeight === 0) return;
    smoothScrollTo(container, activeEl);
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
const showPlayer = ref(false);
const onClickToggleButton = () => {
  showPlayer.value = !showPlayer.value;
};
function handleClearAndClose() {
  currentMusic.clearPlaylist();
  setTimeout(() => {
    togglePlaylist();
  }, 100);
}

const showPlaylist = ref(false);

function togglePlaylist() {
  showPlaylist.value = !showPlaylist.value;
}


const audioRef = ref(null);

watch(() => currentMusic.currentSong, async () => {
  await loadLRC();
})

// 提取颜色并生成渐变背景
const gradientBackground = ref('linear-gradient(to bottom, #222, #000)')
const hiddenImage = ref(null)

watch(() => currentMusic.currentSong.album.cover, (url) => {
  if (!url) return
  const fac = new FastAverageColor()
  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = url
  img.onload = async () => {
    const result = await fac.getColorAsync(img)
    gradientBackground.value = `linear-gradient(to bottom, ${result.hex}, #111111)`
  }
})


onMounted(async () => {
  currentMusic.setAudio(audioRef.value);
  if (audioRef.value) {
    audioRef.value.addEventListener('ended', currentMusic.nextSong)
  }
})

</script>

<template>

  <div v-show="currentMusic.currentPlaylist.length > 0"
       class="flex gap-3 justify-between fixed bottom-0 left-0 w-full h-24
            bg-base-200/90 backdrop-blur-md shadow-2xl border-t border-base-300
            select-none z-[400]">


  <!--/ 歌曲信息-->
    <div class="flex h-full w-1/4 items-center justify-between px-4">
      <div class="flex gap-4 items-center">
        <div class="relative group flex justify-center items-center">
          <!-- 封面图 -->
          <img
              :src="currentMusic.currentSong.album.cover"
              alt=""
              class="size-16 rounded-xl transition duration-300"
          />

          <!-- 悬浮显示的按钮 -->
          <button
              class="absolute w-full h-full size-16 rounded-xl flex justify-center items-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity duration-200  cursor-pointer"
              @click="onClickToggleButton"
          >
            <ChevronDownIcon
                :class="['transition-transform duration-300', { 'rotate-180': showPlayer }]"
                class="h-6 w-6 text-white"
            />
          </button>
        </div>



        <!-- 歌曲信息 -->
        <div class="flex flex-col min-w-0 gap-0.5">
          <!-- 歌曲名 -->
          <div class="flex gap-2">
            <h2 class="font-bold font-inter cursor-pointer hover:underline truncate" @click="router.push('/song_detail/' + currentMusic.currentSong.id)">
              {{ currentMusic.currentSong.title }}
            </h2>
            <!-- 收藏按钮 -->
            <button @click="useUserLikeStore().toggleLike(currentMusic.currentSong.id,'song')" class="ml-3 cursor-pointer hover:brightness-75">
              <HeartIconOutline v-if="!useUserLikeStore().isLiked(currentMusic.currentSong.id,'song')" class="w-5 h-5"></HeartIconOutline>
              <HeartIcon v-else class="text-error w-5 h-5"></HeartIcon>
            </button>
            <!-- 更多按钮 -->
            <EllipsisHorizontalIcon class="w-5 h-5 cursor-pointer hover:brightness-75"/>
          </div>

          <!-- 艺术家名 -->
          <p class="text-sm font-medium font-inter text-base-content/80 cursor-pointer hover:underline truncate" @click="router.push('/artist_detail/'+currentMusic.currentSong.artist.id)">
            {{ currentMusic.currentSong.artist.name }}
          </p>

          <!-- 专辑信息 -->
          <p class="text-xs font-normal font-jetbrains text-base-content/60 cursor-pointer hover:underline truncate" @click="router.push('/album_detail/'+currentMusic.currentSong.album.id)">
            出自专辑：{{ currentMusic.currentSong.album.title }}
          </p>
        </div>
      </div>
    </div>

    <!--/ 控制按钮与进度条 -->
    <div class="flex flex-col justify-between items-center gap-2 h-full w-1/2 px-4">

      <div class="flex  gap-6 mt-6">
        <!-- 上一首 -->
        <button @click="currentMusic.previousSong" type="button" class="cursor-pointer hover:brightness-75">
          <BackwardIcon class="w-5 h-5 "/>
        </button>

        <!-- 播放 / 暂停 -->
        <button @click="playPause" type="button" class="cursor-pointer hover:brightness-75">
          <PauseIcon v-if="currentMusic.isPlaying" class="w-9 h-9" />
          <PlayIcon v-else class="w-9 h-9" />
        </button>

        <!-- 下一首 -->
        <button @click="currentMusic.nextSong" type="button" class="cursor-pointer hover:brightness-75">
          <ForwardIcon class="w-5 h-5" />
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
              class="absolute w-full inset-0 h-full appearance-none bg-transparent cursor-pointer
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
      <button
          class="p-2"
          tabindex="0"
          @click="togglePlaylist"
      >
        <label class=" cursor-pointer hover:brightness-75">
          <Bars3Icon class="h-6 w-6"/>
        </label>
      </button>

      <div v-if="false" class="dropdown dropdown-top dropdown-center flex">
        <button
            class="p-2"
            tabindex="0"
        >
          <label class=" cursor-pointer hover:brightness-75">
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
      <div class="dropdown dropdown-top dropdown-center flex ">
        <button class="cursor-pointer hover:brightness-75" tabindex="0">
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
          class="transition-transform duration-300 mr-6 cursor-pointer hover:brightness-75"
          @click="onClickToggleButton"
      >
        <ChevronDownIcon
            :class="['transition-transform duration-300', { 'rotate-180': showPlayer }]"
            class="h-6 w-6"
        />
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

  <transition name="slide-up">
    <div
        v-show="showPlayer"
        class="fixed flex justify-center items-center px-80 bottom-[80px] left-0 right-0 top-0 z-100 bg-base-100 shadow-xl overflow-hidden"
    >
      <!-- 渐变背景 -->
      <div class="absolute inset-0 z-0 transition-all duration-500" :style="{ background: gradientBackground }"></div>

      <!-- 暗色遮罩层（盖在渐变背景上，但在内容下） -->
      <div class="absolute inset-0 z-[1] bg-black opacity-50 pointer-events-none"></div>

      <div class="flex justify-between w-full">
        <div class="flex flex-col h-full mt-8 z-10 items-center justify-center">

          <div class="album-wrapper cursor-pointer" @click="goToAlbum(currentMusic.currentSong.album.id)">
            <img
                :src="currentMusic.currentSong.album.cover"
                alt="歌曲封面"
                class="w-100 h-100 object-cover rounded-lg border border-white/13"
            />

          </div>


          <!-- 歌曲标题 & 歌手 -->
          <div class="text-center mt-4">
            <div
                class="text-2xl font-bold cursor-pointer"
                @click="goToSong(currentMusic.currentSong.id)"
            >
              {{ currentMusic.currentSong.title || '未知歌曲' }}
            </div>
            <div
                class="text-lg text-base text-gray-300 cursor-pointer"
                @click="goToArtist(currentMusic.currentSong.artist.id)"
            >
              {{ currentMusic.currentSong.artist.name || '未知歌手' }}
            </div>
          </div>

        </div>

        <div class="flex flex-col items-center justify-center h-full  z-10">
          <!-- 歌词 -->
          <div
              ref="lyricsRef"
              class="overflow-y-auto scrollbar-hide w-full max-w-xl h-[500px] text-center"
              style="
    -webkit-mask-image: linear-gradient(180deg, hsla(0, 0%, 100%, 0) 0%, hsla(0, 0%, 100%, 0.6) 15%, #fff 25%, #fff 75%, hsla(0, 0%, 100%, 0.6) 85%, hsla(0, 0%, 100%, 0) 100%);
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%;
  "
              @scroll="onScroll"
          >
            <div class="mb-20"></div>
            <div
                v-for="(line, index) in lyrics"
                :key="index"
                class="relative mb-3 transition-all duration-500"
            >

              <div
                  :class="[
      'text-lg leading-relaxed text-center w-[400px] mx-auto', // 固定宽度 + 居中
      {
        'font-bold text-cyan-300 active': activeIndexes.includes(index),
      },
    ]"
                  style="cursor: pointer; user-select: none;"
                  :style="{ fontFamily: 'Inter, sans-serif' }"
                  @dblclick="onSheetClick(line.time)"
              >
                {{ line.text }}
              </div>
            </div>

            <div class="mb-100"></div>
          </div>
        </div>
      </div>


    </div>
  </transition>
  <Transition name="slide">
    <div
        v-show="showPlaylist"
        class="fixed top-16 right-0 w-1/4 h-[82%] z-[120]"
        style="pointer-events: none;"
    >
      <div class="w-full h-full box-border p-5" style="background: transparent;">
        <div
            class="relative w-full h-full bg-base-200 rounded-lg shadow-lg"
            style="pointer-events: auto;"
        >
          <!-- 播放列表内容组件 -->
          <play-list class="h-full mb-5" />

          <div
              class="pointer-events-none absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-base-200 to-transparent"
          ></div>

          <!-- 清空按钮 -->
          <button
              class="absolute bottom-4 right-5 z-10 btn text-white hover:bg-base-300"
              @click="handleClearAndClose"
          >
            <TrashIcon class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  </Transition>








</template>

<style scoped>
.slide-enter-from {
  transform: translateX(100%);
}
.slide-enter-to {
  transform: translateX(0);
}
.slide-leave-from {
  transform: translateX(0);
}
.slide-leave-to {
  transform: translateX(100%);
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}


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



/* 可写在全局 style.css 或 scoped style 内 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0%);
}




</style>