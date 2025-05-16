<script setup>
import { onBeforeUnmount, onMounted, ref} from "vue";

const props = defineProps({
  title: String,
  items: Array,
  headerClass: {
    type: String,
    default: 'text-2xl font-bold'
  },
});

const containerRef = ref(null);
const itemRefs = ref([]);
const setItemRef = (el, index) => {
  itemRefs.value[index] = el
}
const scrollTo = (index) => {
  console.log(index)
  if(index<0)
    index=0;
  if (index > itemRefs.value.length - 1) {
    index = itemRefs.value.length - 1;
  }
  const container = containerRef.value;
  const item = itemRefs.value[index];
  console.log(item.offsetLeft);
  if (container && item) {
    container.scroll({
      left: item.offsetLeft,
      behavior: 'smooth'
    });
  }
};

const currentIndex = ref(0);
onMounted(() => {
  const container = containerRef.value;
  if (!container) {
    return;
  }

  const onScroll = () => {
    const scrollLeft = container.scrollLeft;
    const widths = itemRefs.value.map(el => el ? el.offsetLeft : 0);

    for (let i = 0; i < widths.length - 1; i++) {
      if (scrollLeft >= widths[i] && scrollLeft < widths[i + 1]) {
        currentIndex.value = i;
        return;
      }
    }
    currentIndex.value = widths.length - 1;
  };

  container.addEventListener('scroll', onScroll);

  onBeforeUnmount(() => {
    container.removeEventListener('scroll', onScroll);
  });
});

</script>

<template>
  <div class="w-full">
    <div class="flex justify-between" :class="headerClass">
      <h2>{{title}}</h2>
      <div class="flex gap-1">
        <a @click="scrollTo(currentIndex-1)" class="btn btn-square btn-ghost">❮</a>
        <a @click="scrollTo(currentIndex+1)" class="btn btn-square btn-ghost">❯</a>
        <slot name="action" />
      </div>
    </div>
    <div ref="containerRef" class=" relative flex gap-6 w-full overflow-auto scrollbar-none snap-x snap-mandatory">
      <div
          v-for="(item, index) in items"
          :key="index"
          :ref="el => setItemRef(el, index)"
          class="shrink-0 snap-start  mt-2"
      >
          <slot name="item" :item="item"/>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>