<template>
  <div class="relative">
    <!-- 骨架屏占位 -->
    <div v-if="!src" class="skeleton w-full h-full rounded-xl"></div>

    <!-- 图片 -->
    <img
        v-if="src"
        :src="src"
        alt="专辑封面"
        class="cursor-zoom-in w-full h-full rounded-xl object-cover"
        @click="showPreview = true"
    />

    <!-- Dialog 模态框 -->
    <dialog id="image_preview_modal" class="modal" :open="showPreview">
      <div class="modal-box p-0 max-w-3xl bg-transparent shadow-none">
        <!-- 点击大图也可以关闭模态框 -->
        <img
            :src="src"
            alt="大图预览"
            class="w-full h-auto rounded-xl object-contain cursor-zoom-out"
            @click="showPreview = false"
        />
      </div>
      <!-- 点击背景关闭 -->
      <form method="dialog" class="modal-backdrop" @click="showPreview = false">
        <button />
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  src: String,
  imgClass: String,
})

const showPreview = ref(false)
</script>

<style scoped>
</style>

