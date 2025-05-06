<template>
  <div class="hero bg-base-200 min-h-screen">
    <div class="hero-content flex-col lg:flex-row-reverse gap-8">
      <!-- Left Side: Text Description -->
      <div class="text-center lg:text-left">
        <h1 class="text-5xl font-bold">新建专辑</h1>
        <p class="py-6">
          通过以下表单，您可以创建专辑并填写相关信息。
        </p>
      </div>

      <!-- Right Side: Form Card -->
      <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div class="card-body">
          <!-- Cover Upload -->
          <div class="text-center mb-4">
            <!-- Default album cover image (clickable) -->
            <label for="cover-file-input">
              <img
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  width="192"
                  height="192"
                  class="mx-auto rounded cursor-pointer"
                  alt="专辑封面"
              />
            </label>
            <!-- Hidden file input for image selection -->
            <input
                id="cover-file-input"
                type="file"
                accept="image/*"
                class="hidden"
            />
          </div>

          <!-- Album Title -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">专辑名</span>
            </label>
            <input type="text" class="input input-bordered" placeholder="输入专辑名" />
          </div>

          <!-- Artist Select -->
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">选择歌手</span>
            </label>
            <SelectBox />
            <div class="mt-2 text-sm">
              <a class="link link-hover text-primary">+ 添加歌手</a>
            </div>
          </div>

          <!-- Description -->
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">专辑简介</span>
            </label>
            <textarea class="textarea textarea-bordered" placeholder="输入专辑简介"></textarea>
          </div>

          <!-- Release Date -->
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">发行日期</span>
            </label>
            <input type="date" class="input input-bordered" />
          </div>

          <!-- Submit Button -->
          <div class="form-control mt-6">
            <button class="btn btn-neutral w-full">确认</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 不包含任何逻辑
import SelectBox from "@/components/SelectBox.vue";
</script>

<style scoped>
/* 无需额外样式 */
</style>

