<template>
  <div>
    <!-- 查看/编辑按钮 -->
    <button @click="openModal" class="ml-2 btn btn-link text-primary hover:underline">
      {{ buttonLabel }}
    </button>

    <!-- Modal -->
    <div v-if="isModalVisible" class="modal modal-open">
      <div class="modal-box relative max-w-2xl bg-base-100 text-base-content">
        <!-- 关闭按钮 -->
        <button @click="closeModal" class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">
          ✕
        </button>

        <!-- 弹窗标题 -->
        <h3 class="text-lg font-bold mb-4">{{ modalTitle }}</h3>

        <!-- 编辑模式下文件导入按钮 -->
        <div v-if="edit" class="mb-4">
          <div class="p-3 rounded-lg flex items-center justify-between bg-base-200">
            <span class="text-sm opacity-80">从文件导入内容（支持 .txt/.lrc）</span>
            <button class="btn btn-sm btn-outline btn-info" @click="triggerFileInput">
              导入文件
            </button>
            <input
                ref="fileInput"
                type="file"
                accept=".txt,.lrc"
                class="hidden"
                @change="handleFileChange"
            />
          </div>
        </div>

        <!-- 内容展示或编辑 -->
        <div
            v-if="!edit"
            class="whitespace-pre-wrap font-mono text-sm p-3 rounded border border-base-300 bg-base-200"
            :style="contentStyle"
        >
          {{ content }}
        </div>
        <textarea
            v-else
            v-model="content"
            class="w-full p-3 border rounded-md resize-none font-mono text-sm bg-base-200 border-base-300 focus:outline-none focus:ring focus:ring-primary"
            rows="12"
            :style="contentStyle"
        />

        <!-- 编辑模式下保存按钮 -->
        <div v-if="edit" class="mt-6 text-right">
          <button class="btn btn-sm btn-primary" @click="saveContent">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>




<script setup>
import { ref, defineProps, defineEmits, computed, watch } from 'vue'

// 传入参数
const props = defineProps({
  modelValue: {  // 支持 v-model
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: '详情'
  },
  buttonText: {
    type: String,
    default: '详情'
  },
  edit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue']) // 用来更新父组件的内容

const content = ref(props.modelValue) // 存储内容
const isModalVisible = ref(false) // 控制弹窗是否可见
const fileInput = ref(null)

const modalTitle = computed(() => `${props.edit ? '编辑' : '查看'}${props.title}`)
const buttonLabel = computed(() => `${props.edit ? '编辑' : '查看'}${props.buttonText}`)

const contentStyle = {
  maxWidth: '500px',
  maxHeight: '300px',
  overflow: 'auto'
}

// 打开弹窗
const openModal = () => {
  content.value = props.modelValue // 每次打开时重置内容
  isModalVisible.value = true
}

// 关闭弹窗
const closeModal = () => {
  isModalVisible.value = false
}

// 保存内容
const saveContent = () => {
  emit('update:modelValue', content.value) // 通过 v-model 将更新后的内容传递给父组件
  closeModal()
}

// 可选：同步输入内容到外部 v-model（如果不是保存时再传递）
watch(content, (newVal) => {
  emit('update:modelValue', newVal)
})

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 读取文件内容并更新 content
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    // 判断文件是否为文本文件（包括 .lrc，.txt 等）
    const isTextFile = file.type.startsWith('text/') || file.name.endsWith('.lrc');

    if (isTextFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target.result; // 获取文件内容
        content.value = fileContent; // 更新本地 content 值
        emit('update:modelValue', fileContent); // 更新父组件 v-model 的值
      };
      reader.readAsText(file); // 以文本形式读取文件
    } else {
      console.error('Selected file is not a valid text file');
    }
  }
}


</script>

<style scoped>
.modal-box {
  max-width: 600px;
  width: 100%;
}
</style>



