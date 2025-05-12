<script setup>
import {value} from "lodash/seq.js";

const props = defineProps({
  number: Number,
  size: Number,
  totalPages: Number,

  sizeInput:{
  type: Boolean,
    default: true
  },

  numberInput:{
  type: Boolean,
    default: true
  }
}
)
const emit = defineEmits(['change'])
</script>

<template>
  <div class="flex items-center justify-between">
  <!-- 分页按钮组 -->
  <div class="join">
    <!-- 上一页 -->
    <button
        class="join-item btn"
        :disabled="number === 0"
        @click="emit('change', number-1, size)"
    >
      «
    </button>

    <!-- 第1页 -->
    <button
        class="join-item btn"
        :class="number === 0 ? 'bg-primary text-primary-content' : ''"
        @click="emit('change', 0, size)"
    >
      1
    </button>

    <!-- 左省略号 -->
    <button
        v-if="number > 2 && totalPages > 4"
        class="join-item btn btn-disabled"
    >
      ...
    </button>

    <!-- 中间页码 -->
    <button
        v-for="offset in [-1, 0, 1].filter(o => {
              const pageIndex = number + o;
              return pageIndex > 0 && pageIndex < totalPages - 1;
            })"
        :key="offset"
        class="join-item btn"
        :class="offset === 0 ? 'bg-primary text-primary-content' : ''"
        @click="emit('change', number + offset, size)"
    >
      {{ number + offset + 1 }}
    </button>

    <!-- 右省略号 -->
    <button
        v-if="number < totalPages - 3"
        class="join-item btn btn-disabled"
    >
      ...
    </button>

    <!-- 最后一页 -->
    <button
        v-if="totalPages > 1"
        class="join-item btn"
        :class="number === totalPages - 1 ? 'bg-primary text-primary-content' : ''"
        @click="emit('change', totalPages-1, size)"
    >
      {{ totalPages }}
    </button>

    <!-- 下一页 -->
    <button
        class="join-item btn"
        :disabled="number >= totalPages - 1"
        @click="emit('change', number+1, size)"
    >
      »
    </button>
  </div>

  <!-- 每页条数 -->
  <div v-if="sizeInput" class="flex items-center gap-2">
    <span>每页</span>
    <input
        type="number"
        :value="size"
        @input="emit('change', 0, $event.target.valueAsNumber)"
        class="input input-bordered input-sm w-16"
        min="1"
        max="100"
    />
    <span>条</span>
  </div>

  <!-- 跳转页 -->
  <div v-if="numberInput" class="flex items-center gap-2">
    <span>跳转到第</span>
    <input
        type="number"
        v-model.number="pageInput"
        class="input input-bordered input-sm w-16"
        :min="1"
        :max="totalPages"
    />
    <span>页</span>
    <button
        class="btn btn-sm"
        @click="emit('change', Math.max(0, Math.min(pageInput - 1, totalPages - 1)), size)"
    >
      跳转
    </button>
  </div>
    </div>
</template>

<style scoped>

</style>