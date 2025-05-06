<script setup>

</script>

<template>
  <!-- DaisyUI 音乐播放器模态框（去除逻辑，假数据填充） -->
  <div class="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-md overflow-y-auto">
    <div class="relative mx-auto my-6 max-w-3xl bg-[#1e1e1e] text-white rounded-lg shadow-lg min-h-screen flex flex-col">

      <!-- 模糊背景 -->
      <div class="absolute inset-0 z-0 opacity-30">
        <img src="https://picsum.photos/800/800?random=1" class="w-full h-full object-cover blur-xl" />
      </div>

      <!-- 关闭按钮 -->
      <button class="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost z-10">
        ✕
      </button>

      <!-- 内容区 -->
      <div class="flex-1 relative z-10 px-6 pt-8 pb-6 flex flex-col items-center">

        <!-- 歌曲封面 -->
        <img src="https://picsum.photos/200/200?random=2" alt="封面" class="rounded-lg shadow-lg w-48 h-48 object-cover">

        <!-- 歌名 + 歌手 -->
        <div class="mt-4 text-center">
          <h2 class="text-xl font-bold cursor-pointer hover:underline">Lost Stars</h2>
          <p class="text-gray-400 mt-1 text-sm cursor-pointer hover:underline">Adam Levine</p>
        </div>

        <!-- 歌词滚动区域 -->
        <div class="mt-6 w-full max-w-xl h-64 overflow-y-auto p-4 bg-transparent scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <p class="text-center py-1">Please don't see just a boy caught up in dreams and fantasies</p>
          <p class="text-center py-1 text-cyan-300 font-bold">Please see me reaching out for someone I can't see</p>
          <p class="text-center py-1">Take my hand, let's see where we wake up tomorrow</p>
          <p class="text-center py-1">Best laid plans, sometimes are just a one night stand</p>
          <p class="text-center py-1">I'd be damned, Cupid's demanding back his arrow</p>
          <p class="text-center py-1">So let's get drunk on our tears</p>
          <p class="text-center py-1">God, tell us the reason youth is wasted on the young</p>
        </div>

        <!-- 播放进度条 -->
        <div class="mt-4 w-full max-w-md flex items-center gap-4">
          <span class="text-sm">00:23</span>
          <input type="range" class="range range-accent flex-1" min="0" max="100" value="23" />
          <span class="text-sm">03:48</span>
        </div>

        <!-- 播放控制按钮 -->
        <div class="mt-6 flex items-center justify-center flex-wrap gap-4">
          <button class="btn btn-sm btn-ghost text-white"><i class="mdi mdi-playlist-music text-xl"></i></button>
          <button class="btn btn-sm btn-ghost text-white"><i class="mdi mdi-repeat text-xl"></i></button>
          <button class="btn btn-sm btn-ghost text-white"><i class="mdi mdi-skip-previous text-xl"></i></button>
          <button class="btn btn-circle btn-outline border-cyan-400 text-cyan-400 text-xl">
            <i class="mdi mdi-play"></i>
          </button>
          <button class="btn btn-sm btn-ghost text-white"><i class="mdi mdi-skip-next text-xl"></i></button>
          <button class="btn btn-sm btn-ghost text-white"><i class="mdi mdi-volume-high text-xl"></i></button>
          <button class="btn btn-sm btn-ghost text-white"><i class="mdi mdi-dots-vertical text-xl"></i></button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>

</style>