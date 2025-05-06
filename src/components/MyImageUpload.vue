<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: Object, // { url: string, file: File }
  imageClass: {
    type: String,
    default: 'w-20 h-20 object-cover rounded' // 默认样式
  }
});

const emit = defineEmits(['update:modelValue']);
const inputRef = ref(null);

function handleChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    emit('update:modelValue', {
      url: reader.result, // 用于预览
      file: file          // 用于上传
    });
  };
  reader.readAsDataURL(file);
}

function triggerFileInput() {
  inputRef.value.click();
}
</script>

<template>
  <!-- 有图片时 -->
  <div
      v-if="modelValue?.url"
      class="relative inline-block group"
      @click="triggerFileInput"
      style="cursor: pointer;"
  >
    <img
        :src="modelValue.url"
        :class="[imageClass, 'transition duration-200']"
        alt="image"
    />
    <div
        class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity"
        :class="[imageClass, 'transition duration-200']"
    >
      <span class="text-white text-sm">点击上传</span>
    </div>
  </div>

  <!-- 没图片时：显示灰色占位上传区域 -->
  <div
      v-else
      @click="triggerFileInput"
      class="flex items-center justify-center bg-gray-200 text-gray-500 text-sm"
      :class="imageClass"
      style="cursor: pointer;"
  >
    点击上传图片
  </div>

  <input
      ref="inputRef"
      type="file"
      accept="image/*"
      @change="handleChange"
      class="hidden"
  />
</template>


<style scoped>
</style>




