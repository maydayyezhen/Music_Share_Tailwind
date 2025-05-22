<template>
  <alerts ref="alertsRef" />
  <div class="w-full flex justify-center mt-16">
    <div class="flex flex-col w-full max-w-3xl gap-6 p-6 bg-base-100 rounded-xl border border-base-200">

      <!-- 标题 -->
      <h2 class="text-2xl font-semibold">账户设置</h2>

      <!-- 头像上传区域 -->
      <div class="flex items-center gap-6">
        <img
            :src="userAvatarUrl || createAvatarUrl(user.username)"
            class="w-20 h-20 rounded-full border border-white object-cover"
            alt="用户头像"
        />
        <div class="flex flex-col gap-2">
          <button class="btn btn-outline btn-sm" @click="triggerFileInput">选择头像</button>
          <input
              type="file"
              id="avatar-file-input"
              accept="image/*"
              class="hidden"
              @change="selectAvatar"
          />
          <button v-if="selectedImgFile" class="btn btn-primary btn-sm" @click="uploadAvatar">
            上传头像
          </button>
        </div>
      </div>

      <!-- 昵称修改 -->
      <div
          class="w-full flex flex-col border border-base-200 rounded-xl gap-2 p-4 transition focus-within:border-white"
      >
        <label for="nickname" class="text-sm text-gray-400">昵称</label>
        <input
            id="nickname"
            type="text"
            v-model="formData.nickname"
            class="bg-transparent outline-none text-white w-full"
            placeholder="请输入昵称"
        />
      </div>

      <!-- 折叠密码修改区域 -->
      <div class="flex flex-col gap-2">
        <button class="btn btn-outline btn-accent btn-sm w-fit" @click="showPasswordSection = !showPasswordSection">
          {{ showPasswordSection ? '取消更改密码' : '更改密码' }}
        </button>

        <div v-show="showPasswordSection" class="flex flex-col gap-4 mt-2">
          <div class="border border-base-200 rounded-xl p-4">
            <label class="text-sm text-gray-400">旧密码</label>
            <input
                type="password"
                class="bg-transparent outline-none text-white w-full"
                placeholder="请输入旧密码"
                v-model="formData.oldPassword"
            />
          </div>
          <div class="border border-base-200 rounded-xl p-4">
            <label class="text-sm text-gray-400">新密码</label>
            <input
                type="password"
                class="bg-transparent outline-none text-white w-full"
                placeholder="请输入新密码"
                v-model="formData.newPassword"
            />
          </div>
          <div class="border border-base-200 rounded-xl p-4">
            <label class="text-sm text-gray-400">确认新密码</label>
            <input
                type="password"
                class="bg-transparent outline-none text-white w-full"
                placeholder="请再次输入新密码"
                v-model="formData.confirmPassword"
            />
          </div>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="flex justify-end">
        <button class="btn btn-primary" @click="submitForm">保存更改</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import {useAuthStore} from '@/stores/authStore.js';
import { apiUpdatePassword, apiUpdateUser, apiUploadAvatarFile,} from '@/api/user-api.js';
import {createAvatarUrl} from '@/Tools/tools.js';
import Alerts from "@/components/Alerts.vue";
const alertsRef = ref(null)
function triggerToast(alertType, alertMessage) {
  alertsRef.value?.showToast(alertType, alertMessage)
}
const authStore = useAuthStore();
const user = authStore.user;
const selectedImgFile = ref(null);
const showPasswordSection = ref(false);
const userAvatarUrl = ref('');

const formData = ref({
  nickname: user.nickname || '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const triggerFileInput = () => {
  document.getElementById('avatar-file-input').click();
};

const selectAvatar = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedImgFile.value = file;
    userAvatarUrl.value = URL.createObjectURL(file);
  }
};

const uploadAvatar = async () => {
  if (!selectedImgFile.value) return;
  await apiUploadAvatarFile(user.username, selectedImgFile.value);
  await authStore.fetchUser();
  userAvatarUrl.value = authStore.user.avatar;
  triggerToast('success', '头像上传成功');
};

const submitForm = async () => {
  try {
    if (selectedImgFile.value) {
      await uploadAvatar();
    }

    if (formData.value.nickname !== user.nickname) {
      await apiUpdateUser(user.username, formData.value.nickname);
      user.nickname = formData.value.nickname;
    }

    if (formData.value.newPassword) {
      if (formData.value.newPassword !== formData.value.confirmPassword) {
        triggerToast('error', '新密码和确认密码不一致');
      }
      await apiUpdatePassword(
          user.username,
          formData.value.oldPassword,
          formData.value.newPassword
      );
    }
    triggerToast('success', '保存成功');
  } catch (error) {
    triggerToast('error', '保存失败');
  }
};

onMounted(async () => {
  if (!user?.username) return;
  try {
    await authStore.fetchUser(user.username);
    userAvatarUrl.value = authStore.user.avatar;
  } catch (error) {
    triggerToast('error', '获取用户信息失败');
  }
});
</script>

<style scoped>
input::placeholder {
  color: #999;
}
</style>
