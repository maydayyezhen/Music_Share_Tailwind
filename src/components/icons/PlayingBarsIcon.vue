<template>
  <div class="flex space-x-[2px] items-end h-4">
    <div
        v-for="i in 3"
        :key="i"
        :class="[
        'w-[2px] bg-current animate-wave',
        `delay-${i * 200}`
      ]"
    ></div>
  </div>
</template>

<style scoped>
@keyframes wave {
  0%, 100% {
    height: 25%;
  }
  50% {
    height: 100%;
  }
}
.animate-wave {
  animation: wave 1s infinite ease-in-out;
}
.delay-200 {
  animation-delay: 0.2s;
}
.delay-400 {
  animation-delay: 0.4s;
}
.delay-600 {
  animation-delay: 0.6s;
}
</style>
