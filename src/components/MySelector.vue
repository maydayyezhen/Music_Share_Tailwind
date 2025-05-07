<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  modelValue: { type: Object, default: null },
  getLabel: { type: Function, default: () => () => '' },
  getImage: { type: Function, default: () => () => '' },
  imageClass: { type: String, default: 'w-8 h-8 object-cover rounded' }
})


const emit = defineEmits(['update:modelValue'])

const inputText = ref('')
const selectedItem = ref(props.modelValue)
const dropdownRef = ref(null)  // 引用下拉组件

// 点击外部关闭下拉
const closeDropdown = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownRef.value.classList.remove('dropdown-open') // 关闭下拉
  }
}

const toggleDropdown = () => {
  if (dropdownRef.value) {
    dropdownRef.value.classList.toggle('dropdown-open')  // 控制下拉列表的展开与隐藏
  }
}

watch(
    () => props.modelValue,
    (val) => {
      selectedItem.value = val
      inputText.value = val ? props.getLabel(val) : ''
    },
    { immediate: true }
)

const selectItem = (item) => {
  selectedItem.value = item
  inputText.value = props.getLabel(item)
  emit('update:modelValue', item)
}

const filteredItems = computed(() => {
  const keyword = inputText.value.toLowerCase()
  const selectedLabel = selectedItem.value ? props.getLabel(selectedItem.value) : ''
  if (keyword !== selectedLabel.toLowerCase()) {
    return props.items.filter(item =>
        props.getLabel(item).toLowerCase().includes(keyword)
    )
  }
  return props.items
})

onMounted(() => {
  // 监听点击事件
  document.addEventListener('click', closeDropdown)
})

onBeforeUnmount(() => {
  // 清理监听器
  document.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <div class="dropdown dropdown-end w-full" ref="dropdownRef">
    <div class="input flex items-center gap-3 hover:bg-base-200 w-full p-2 rounded-md">
      <!-- 如果选中了项目，展示图片 -->
      <img
          v-if="selectedItem"
          :src="getImage(selectedItem)"
          :class="imageClass"
          alt="item"
      />

      <!-- 输入框 -->
      <input
          v-model="inputText"
          class="flex-1 bg-transparent border-none outline-none text-sm"
          placeholder="请选择"
      />

      <!-- 下拉箭头 -->
      <svg
          class="w-4 h-4 fill-current opacity-60 cursor-pointer"
          viewBox="0 0 2048 2048"
          @click="toggleDropdown"
      >
        <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
      </svg>
    </div>

    <ul class="dropdown-content mt-3 z-[1]  p-2 shadow bg-base-100 rounded-box w-64 max-h-80 overflow-y-auto">
      <li v-for="item in filteredItems" :key="getLabel(item)">
        <button
            class="flex items-center gap-3 p-2 rounded-box hover:bg-base-200 w-full text-left"
            @click="selectItem(item)"
        >
          <img
              :src="getImage(item)"
              :class="imageClass"
              alt="item image"
          />
          <span
              class="truncate max-w-[10rem] overflow-hidden whitespace-nowrap text-ellipsis"
              :title="getLabel(item)"
          >
            {{ getLabel(item) }}
          </span>
          <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3 shrink-0 ml-auto"
              viewBox="0 0 24 24"
              fill="currentColor"
              :class="{
              visible: selectedItem && getLabel(item) === getLabel(selectedItem),
              invisible: !selectedItem || getLabel(item) !== getLabel(selectedItem)
            }"
          >
            <path
                d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"
            ></path>
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>


