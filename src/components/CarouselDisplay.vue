<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  title: String,
  items: Array,
  headerClass: {
    type: String,
    default: 'text-2xl font-bold',
  },
})

const containerRef = ref(null)
const itemWidth = ref(0)
const visibleCount = ref(3)
const currentIndex = ref(0)

const gap = 4 // px, Tailwind gap-1

const breakpoints = [
  { minWidth: 1400, count: 8 },
  { minWidth: 1140, count: 7 },  // 这里对应 w-[86%] 显示7个
  { minWidth: 1000, count: 6 },
  { minWidth: 850,  count: 5 },
  { minWidth: 700,  count: 4 },
  { minWidth: 480,  count: 3 },
  { minWidth: 0,    count: 2 },
]





const updateLayout = () => {
  const container = containerRef.value
  if (!container) return

  const width = container.offsetWidth

  for (const bp of breakpoints) {
    if (width >= bp.minWidth) {
      visibleCount.value = bp.count
      break
    }
  }

  const totalGap = gap * (visibleCount.value - 1)
  itemWidth.value = Math.floor((width - totalGap) / visibleCount.value)

  const children = container.children
  for (let child of children) {
    child.style.width = `${itemWidth.value}px`
  }
}

const scrollTo = (index) => {
  index = Math.max(0, Math.min(index, props.items.length - visibleCount.value))
  currentIndex.value = index

  const scrollLeft = index * (itemWidth.value + gap)
  containerRef.value.scrollTo({
    left: scrollLeft,
    behavior: 'smooth',
  })
}

const resizeObserver = new ResizeObserver(() => {
  updateLayout()
})

onMounted(() => {
  updateLayout()
  resizeObserver.observe(containerRef.value)

  containerRef.value.addEventListener('scroll', () => {
    const scrollLeft = containerRef.value.scrollLeft
    currentIndex.value = Math.round(scrollLeft / (itemWidth.value + gap))
  })
})

onBeforeUnmount(() => {
  if (containerRef.value) resizeObserver.unobserve(containerRef.value)
})
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-center" :class="headerClass">
      <h2>{{ title }}</h2>
      <div class="flex gap-1 items-center">
        <button @click="scrollTo(currentIndex - 1)" class="btn btn-square btn-ghost">❮</button>
        <button @click="scrollTo(currentIndex + 1)" class="btn btn-square btn-ghost">❯</button>
        <slot name="action" />
      </div>
    </div>

    <div
        ref="containerRef"
        class="mt-2 overflow-x-auto grid gap-1 scroll-smooth scroll-pl-0 scrollbar-none"
        style="grid-auto-flow: column; grid-auto-columns: max-content; scroll-snap-type: x mandatory;"
    >
      <div
          v-for="(item, index) in items"
          :key="index"
          class="scroll-snap-start mt-1 shrink-0"
      >
        <slot name="item" :item="item" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-snap-start {
  scroll-snap-align: start;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>



