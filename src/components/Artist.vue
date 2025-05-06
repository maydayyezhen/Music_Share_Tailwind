<template>
  <div class="hero bg-base-200 min-h-screen">
    <div class="hero-content flex-col lg:flex-row-reverse gap-8">
      <!-- Left Side: Text Description -->
      <div class="text-center lg:text-left">
        <h1 class="text-5xl font-bold">添加歌手</h1>
        <p class="py-6">
          通过以下表单，您可以轻松添加歌手，上传个人头像并填写个人简介。
        </p>
      </div>

      <!-- Right Side: Form -->
      <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div class="card-body">
          <!-- Avatar Section -->
          <div class="text-center mb-4">
            <!-- Default avatar image (clickable) -->
            <label for="avatar-file-input">
              <img
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  width="100"
                  height="100"
                  class="mx-auto rounded-full cursor-pointer"
                  alt="头像"
              />
            </label>
            <!-- Hidden file input for image selection -->
            <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                class="hidden"
            />
          </div>

          <!-- Song Title -->
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">歌手名</span>
            </label>
            <input type="text" class="input input-bordered " placeholder="输入歌手名" />
          </div>

          <!-- Bio -->
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">简介</span>
            </label>
            <textarea class="textarea textarea-bordered" placeholder="输入简介" ></textarea>
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
// No logic here, just static content and layout
</script>

<style scoped>
/* Optionally, you can add custom styles for form and button spacing */
</style>
