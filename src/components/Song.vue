<template>
  <div class="hero bg-base-200 min-h-screen">
    <div class="hero-content flex-col lg:flex-row-reverse gap-8">
      <!-- Left Side: Text Description -->
      <div class="text-center lg:text-left">
        <h1 class="text-5xl font-bold">添加音乐</h1>
        <p class="py-6">
          通过以下表单，您可以轻松添加音乐，上传您的作品并享受创作的乐趣。
        </p>
      </div>

      <!-- Right Side: Form -->
      <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div class="card-body">
          <fieldset class="fieldset">
            <!-- Song Title -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">歌曲名</span>
              </label>
              <input type="text" class="input input-bordered" placeholder="输入歌曲名" />
            </div>

            <!-- Artist Selection -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">选择歌手</span>
              </label>
              <select-box/>
              <div class="mt-2 text-sm">
                <a class="link link-hover text-primary">+ 添加歌手</a>
              </div>
            </div>

            <!-- Album Selection -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">选择专辑</span>
              </label>
              <select-box/>
              <div class="mt-2 text-sm">
                <a class="link link-hover text-primary">+ 添加专辑</a>
              </div>
            </div>

            <!-- Duration -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">时长（mm:ss）</span>
              </label>
              <input type="text" class="input input-bordered" placeholder="00:00" readonly />
            </div>

            <!-- Audio File Upload -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">选择音频文件</span>
              </label>
              <input type="file" class="file-input file-input-bordered" accept="audio/*" />
            </div>

            <!-- Lyrics File Upload -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">选择歌词文件</span>
              </label>
              <input type="file" class="file-input file-input-bordered" accept=".lrc,.txt" />
            </div>

            <!-- AI Translation Button -->
            <div class="form-control mt-4">
              <button class="btn btn-neutral w-full">Lrc AI翻译</button>
            </div>

            <!-- Lyrics Textarea -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">歌词</span>
              </label>
              <textarea class="textarea textarea-bordered w-full" placeholder="请输入歌词"></textarea>
            </div>

            <!-- Submit Button -->
            <div class="form-control mt-6">
              <button class="btn btn-neutral w-full">上传</button>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No logic is needed, this is just a static form for now.
import SelectBox from "@/components/SelectBox.vue";
</script>

<style scoped>
/* Optionally, you can add some custom styles here */
</style>



