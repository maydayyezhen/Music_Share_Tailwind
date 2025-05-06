<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  src: String
})

const isPlaying = ref(false)
const audioRef = ref(null)
const currentTime = ref(0)
const duration = ref(0)
const seeking = ref(false)

function togglePlayback() {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

watch(audioRef, () => {
  const audio = audioRef.value
  if (!audio) return

  audio.addEventListener('play', () => (isPlaying.value = true))
  audio.addEventListener('pause', () => (isPlaying.value = false))
  audio.addEventListener('timeupdate', () => {
    if (!seeking.value) {
      currentTime.value = audio.currentTime
    }
    duration.value = audio.duration || 0
  })
})

function onSeek(event) {
  const value = parseFloat(event.target.value)
  currentTime.value = value
  audioRef.value.currentTime = value
  seeking.value = false
}
</script>

<template>
  <div class="inline-flex items-center gap-2 w-full max-w-xs">
    <!-- 播放按钮 -->
    <button @click="togglePlayback" class="btn btn-sm btn-circle btn-ghost">
      <svg v-if="!isPlaying"
           class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 3L20 12 6 21V3z"></path>
      </svg>
      <svg v-else
           class="size-[1.6em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
           fill="currentColor">
        <path d="M8 5h2.5v14H8V5zm5.5 0H16v14h-2.5V5z" />
      </svg>
    </button>

    <!-- 时间 -->
    <span class="text-xs w-12 text-right tabular-nums">
      {{ formatTime(currentTime) }}/{{ formatTime(duration) }}
    </span>

    <!-- 可滑动进度条 -->
    <input
        type="range"
        min="0"
        :max="duration"
        step="0.1"
        v-model="currentTime"
        @input="seeking = true"
        @change="onSeek"
        class="range range-xs flex-1 accent-primary h-1 custom-range"
    />

    <!-- 隐藏的 audio -->
    <audio ref="audioRef" :src="src" class="hidden" />
  </div>
</template>

<style scoped>
.custom-range {
  /* 滑块（thumb）样式 */
  -webkit-appearance: none;
  appearance: none;
  height: 1px;
  background-color: var(--color-base-300);
  border-radius: 9999px;
  transition: background-color 0.3s ease;

  /* 滑块外观 */
  &::-webkit-slider-runnable-track {
    background: transparent;
    border: none;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;  /* 保持固定宽度 */
    height: 20px; /* 增大滑块高度 */
    background: var(--color-primary);
    border-radius: 50%;  /* 确保圆形外观 */
    border: 2px solid var(--color-base-100);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease, box-shadow 0.3s ease;
  }

  &::-moz-range-thumb {
    width: 20px;  /* 保持固定宽度 */
    height: 20px; /* 增大滑块高度 */
    background: var(--color-primary);
    border-radius: 50%;  /* 确保圆形外观 */
    border: 2px solid var(--color-base-100);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease, box-shadow 0.3s ease;
  }

  /* 滑块聚焦时 */
  &:focus {
    outline: none;
  }

  /* 滑块悬停时 */
  &::-webkit-slider-thumb:hover,
  &::-moz-range-thumb:hover {
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
    transform: scale(1.2);
  }

  /* 滑块按下时 */
  &::-webkit-slider-thumb:active,
  &::-moz-range-thumb:active {
    transform: scale(1.3);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  }
}
</style>



