<template>
  <div class="p-2 max-w-sm mx-auto space-y-2">
    <!-- 音频上传 -->
    <div>
      <button
          @click="triggerFileInput"
          class="btn btn-outline w-full text-xs p-2"
      >
        {{ audioFile ? audioFile.name : '选择音频文件' }} <!-- 按钮显示文件名或者默认文本 -->
      </button>
      <!-- 隐藏的文件输入框 -->
      <input
          type="file"
          ref="fileInput"
          accept="audio/*"
          class="absolute opacity-0"
          @change="handleFileChange"
      />
    </div>

    <!-- 显示音频时长 -->
    <div v-if="audioDuration !== null" class="mt-2 text-xs text-gray-700 flex items-center gap-1">
      <p>时长: {{ audioDuration }} 秒</p> <!-- 改短显示文字 -->
      <span v-if="audioFile" class="text-green-500">&#10003;</span> <!-- 勾号表示文件已上传 -->
      <span v-else class="text-red-500">&#10007;</span> <!-- 叉号表示未上传 -->
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

// 接收并发送 v-model 绑定的值
const emit = defineEmits(['update:modelValue']);

const audioDuration = ref(null);
const audioFile = ref(null);

// 触发文件选择框
const triggerFileInput = () => {
  fileInput.value.click();  // 触发隐藏的文件输入框
};

// 处理文件选择变化
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('audio/')) {
    audioFile.value = file; // 保存音频文件
    getAudioDuration(file);  // 获取音频时长
  } else {
    alert('请选择有效的音频文件');
    audioFile.value = null; // 如果文件不合法，清空
  }
};

// 获取音频文件的时长
const getAudioDuration = (file) => {
  const audio = new Audio(URL.createObjectURL(file));
  audio.onloadedmetadata = () => {
    audioDuration.value = audio.duration.toFixed(2); // 设置时长并保留两位小数
    emit('update:modelValue', audioFile.value); // 将文件对象传递给父组件
  };
  audio.onerror = () => {
    alert('无法获取音频时长');
    audioFile.value = null; // 如果获取时长失败，清空文件
  };
};

const fileInput = ref(null);  // 文件输入框引用
</script>

<style scoped>
input[type="file"] {
  display: none; /* 隐藏原始文件输入框 */
}
.text-xs {
  font-size: 0.75rem; /* 小字号 */
}
</style>
