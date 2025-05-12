<template>
  <div>
    <!-- 触发按钮 -->
    <button @click="openModal" class="btn btn-link text-primary hover:underline">
      {{ buttonLabel }}
    </button>

    <!-- 弹窗 -->
    <div v-if="isModalVisible" class="modal modal-open">
      <div class="modal-box w-11/12 max-w-6xl h-11/12 max-h-200 relative bg-base-100 text-base-content p-6 rounded-xl shadow-lg">
        <!-- 关闭按钮 -->
        <button @click="closeModal" class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">
          ✕
        </button>

        <!-- 弹窗标题 -->
        <h3 class="text-xl font-bold mb-4">{{ modalTitle }}</h3>

        <!-- 编辑模式下的文件导入 -->
        <div v-if="edit" class="mb-4">
          <div class="bg-base-200 p-4 rounded flex justify-between items-center text-sm">
            <span class="opacity-80">从文件导入内容（支持 .txt / .lrc）</span>
            <div>
              <button @click="triggerFileInput" class="btn btn-sm btn-outline btn-info">导入</button>
              <input
                  ref="fileInput"
                  type="file"
                  accept=".txt,.lrc"
                  class="hidden"
                  @change="handleFileChange"
              />
            </div>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="min-h-[300px]">
          <div
              v-if="!edit&&editComponent==='textarea'"
              class="whitespace-pre-wrap bg-base-200 p-4 rounded border border-base-300"
              :style="{maxWidth: '1200px',minHeight: '400px',overflow: 'auto'}"
          >
            <div v-html="content"></div>
          </div>

          <textarea
              v-if="edit && editComponent === 'textarea'"
              v-model="content"
              class="w-full h-[550px] p-3 rounded border border-base-300 bg-base-200 resize-none"
          ></textarea>

          <editor
              v-if="edit&&editComponent==='editor'"
              api-key="hzr7djicrlf61g59lbxp6axd69tks15k2sz4hjfck3kjku3r"
              v-model="content"
              :init="{
              height: 550,
              language: 'zh_CN',
              language_url: '/languages/zh_CN.js',
              skin: 'snow',
              toolbar_mode: 'wrap',
              plugins: 'code lineheight',
              toolbar: 'undo redo | fontfamily fontsize | bold italic underline forecolor backcolor| alignleft aligncenter alignright alignjustify lineheight | indent outdent  | code',
              branding: false,
              line_height_formats: '1 1.2 1.4 1.6 2 2.4 3',
              font_family_formats: `
                微软雅黑=Microsoft YaHei, sans-serif;
                宋体=SimSun, serif;
                仿宋=FangSong, serif;
                黑体=SimHei, sans-serif;
                楷体=KaiTi, serif;
                华文细黑=STHeiti, sans-serif;
                华文楷体=STKaiti, serif;
                细明体=PMingLiU, serif;
                新宋体=NSimSun, serif;
                思源黑体=Source Han Sans, sans-serif;
                思源宋体=Source Han Serif, serif;
                方正兰亭黑=FZLanTingHei, sans-serif;
                方正宋体=FZSong, serif;
                 Arial=Arial, Helvetica, sans-serif;
                Times New Roman=Times New Roman, Times, serif;
                Courier New=Courier New, Courier, monospace;
                Georgia=Georgia, serif;
                Verdana=Verdana, Geneva, sans-serif;
                Tahoma=Tahoma, Geneva, sans-serif;
                Trebuchet MS=Trebuchet MS, Helvetica, sans-serif;
                Roboto=Roboto, sans-serif;
                Open Sans=Open Sans, sans-serif;
                Lato=Lato, sans-serif;
                Montserrat=Montserrat, sans-serif;
                Raleway=Raleway, sans-serif;
                Playfair Display=Playfair Display, serif;
              `
              }"
          />
        </div>

        <!-- 确认按钮 -->
        <div v-if="edit" class="mt-6 text-right">
          <button class="btn btn-primary btn-sm" @click="saveContent">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>





<script setup>
import { ref, defineProps, defineEmits, computed, watch } from 'vue'
import Editor from '@tinymce/tinymce-vue'

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
  },
  editComponent:{
    type: String,
    default: 'textarea'
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
</style>



