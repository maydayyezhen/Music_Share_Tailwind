<script setup>
import {computed, ref} from "vue";

const props = defineProps({
  title: String,
  items: Array,
  itemsPerPage: { type: Number, default: 8 },
  headerClass: {
    type: String,
    default: 'text-2xl font-bold'
  },
  idPrefix: { type: String, default: 'carousel' },
  renderItem: Function,
});

const sliderNum = ref(1);

const slides = computed(() => {
  const { items, itemsPerPage } = props;
  if (!items?.length) return [];
  return Array.from({ length: Math.ceil(items.length / itemsPerPage) }, (_, index) =>
      items.slice(index * itemsPerPage, (index + 1) * itemsPerPage)
  );
});


function goToSlide(n) {
  const target = document.getElementById(`${props.idPrefix}-slide${n}`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    sliderNum.value = n;
  }
}
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between" :class="headerClass">
      <h2>{{title}}</h2>
      <div class="flex gap-1">
        <a @click="goToSlide(sliderNum === 1 ? slides.length : sliderNum - 1)" class="btn btn-square btn-ghost">❮</a>
        <a @click="goToSlide(sliderNum === slides.length ? 1 : sliderNum + 1)" class="btn btn-square btn-ghost">❯</a>
        <slot name="action" />
      </div>
    </div>
    <div class="carousel">
      <div
          v-for="(group, index) in slides"
          :key="index"
          :id="`${props.idPrefix}-slide${index + 1}`"
          class="carousel-item w-full justify-center mt-1"
      >
        <div class="flex flex-wrap gap-6 justify-center">
          <div v-for="item in group" :key="item.id">
            <slot name="item" :item="item" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>