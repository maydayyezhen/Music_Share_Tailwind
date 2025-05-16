<script setup>
import {ref, watch} from "vue";
import {apiGetArtistAvatarFile} from "@/api/artist-api.js";
import {useAuthStore} from "@/stores/authStore.js";
import { createAvatar } from '@dicebear/core';
import {thumbs} from '@dicebear/collection';
import router from "@/router/index.js";
import {useSidebarStore} from "@/stores/sidebarStore.js";

const userAvatarUrl = ref('');
const authStore = useAuthStore();
watch(
    () => authStore.user,
    async (newUser) => {
      if (newUser.avatarUrl) {
        userAvatarUrl.value = await apiGetArtistAvatarFile(newUser.avatarUrl);
      } else {
        userAvatarUrl.value = createAvatarUrl();
      }
    },
    { immediate: true }
);

//生成唯一的占位头像
function createAvatarUrl() {
  const avatar = createAvatar(thumbs, {
    seed: authStore.user.username,
  });
  const svgString = avatar.toString();

  const uint8Array = new TextEncoder().encode(svgString);
  const base64 = btoa(String.fromCharCode(...uint8Array));

  return `data:image/svg+xml;base64,${base64}`;
}


const themes = [
  { name: "light", label: "亮色" },
  { name: "dark", label: "暗色" },
  { name: "cupcake", label: "甜美" },
  { name: "bumblebee", label: "大黄蜂" },
  { name: "emerald", label: "翡翠" },
  { name: "corporate", label: "商务" },
  { name: "synthwave", label: "合成波" },
  { name: "retro", label: "复古" },
  { name: "cyberpunk", label: "赛博朋克" },
  { name: "valentine", label: "情人节" },
  { name: "halloween", label: "万圣节" },
  { name: "garden", label: "花园" },
  { name: "forest", label: "森林" },
  { name: "aqua", label: "水蓝" },
  { name: "lofi", label: "低保真" },
  { name: "pastel", label: "柔和" },
  { name: "fantasy", label: "奇幻" },
  { name: "wireframe", label: "线框" },
  { name: "black", label: "黑色" },
  { name: "luxury", label: "奢华" },
  { name: "dracula", label: "德古拉" },
  { name: "cmyk", label: "四色" },
  { name: "autumn", label: "秋天" },
  { name: "business", label: "商务" },
  { name: "acid", label: "酸性" },
  { name: "lemonade", label: "柠檬" },
  { name: "night", label: "夜晚" },
  { name: "coffee", label: "咖啡" },
  { name: "winter", label: "冬季" },
  { name: "dim", label: "柔暗" },
  { name: "nord", label: "北欧" },
  { name: "sunset", label: "日落" },
  { name: "caramellatte", label: "焦糖拿铁" },
  { name: "abyss", label: "深渊" },
  { name: "silk", label: "丝绸" }
];





</script>

<template>
  <div class="navbar bg-transparent select-none">
    <!-- 左上角按钮 -->
    <div class="navbar-start">
      <!-- Drawer Toggle 按钮 -->
      <label for="sidebar-drawer" class=" flex text-2xl items-center gap-3 tracking-wider cursor-pointer fixed top-4 left-4 z-[99999]" style="font-family: 'Lobster', cursive;" @click="useSidebarStore().toggleSidebar()">
        <svg class="w-7 h-7" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 1H4V9H3C1.34315 9 0 10.3431 0 12C0 13.6569 1.34315 15 3 15C4.65685 15 6 13.6569 6 12V5H13V9H12C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V1Z" />
        </svg>
        MusicShare
      </label>
    </div>



    <div class="navbar-end space-x-2">
      <button class="btn btn-ghost btn-circle">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg>
      </button>
      <button class="btn btn-ghost btn-circle">
        <div class="indicator">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> </svg>
          <span class="badge badge-xs badge-primary indicator-item"></span>
        </div>
      </button>

      <div class="dropdown dropdown-end z-9999">
        <div
            tabindex="0"
            role="button"
            class="btn group btn-sm gap-1.5 px-1.5 btn-ghost"
            aria-label="Change Theme"
        >
          <div
              class="bg-base-100 group-hover:border-base-content/20 border-base-content/10 grid grid-cols-2 gap-0.5 rounded-md border p-1 transition-colors"
          >
            <div class="bg-base-content size-1 rounded-full"></div>
            <div class="bg-primary size-1 rounded-full"></div>
            <div class="bg-secondary size-1 rounded-full"></div>
            <div class="bg-accent size-1 rounded-full"></div>
          </div>
          <svg
              width="12px"
              height="12px"
              class="mt-px hidden sm:inline-block fill-current opacity-60"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2048 2048"
          >
            <path
                d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"
            ></path>
          </svg>
        </div>

        <ul
            tabindex="0"
            class="dropdown-content overflow-y-auto  max-h-120 bg-base-100 rounded-box mt-3 w-52 p-2 shadow"
        >
          <li v-for="theme in themes" :key="theme">
            <label class="flex items-center gap-3 px-2 py-2 cursor-pointer rounded-md hover:bg-base-200 transition w-full">
              <input
                  type="radio"
                  name="theme-buttons"
                  class="theme-controller hidden"
                  :value="theme.name"
                  :aria-label="theme.name"
                  :checked="authStore.theme === theme.name"
                  @change="authStore.setTheme(theme.name)"
              />

              <div
                  :data-theme="theme.name"
                  class="bg-base-100 grid grid-cols-2 gap-0.5 p-1 rounded-md shadow-sm"
              >
                <div class="bg-base-content size-1 rounded-full"></div>
                <div class="bg-primary size-1 rounded-full"></div>
                <div class="bg-secondary size-1 rounded-full"></div>
                <div class="bg-accent size-1 rounded-full"></div>
              </div>

              <div class="w-32 truncate capitalize text-sm font-semibold tracking-wide">{{ theme.label }}</div>



              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="h-3 w-3 shrink-0"
                  :class="{ 'visible': authStore.theme === theme.name, 'invisible': authStore.theme !== theme.name }"
              >
                <path
                    d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"
                ></path>
              </svg>
            </label>
          </li>
        </ul>
      </div>


      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar mr-4">
          <div class="w-10 rounded-full">
            <img v-if="authStore.isLoggedIn"
                alt="用户头像"
                :src="userAvatarUrl||createAvatarUrl"/>
            <img v-else src="https://api.dicebear.com/9.x/initials/svg?seed=-----%E7%99%BB%E5%BD%95" alt="登录"/>
          </div>
        </div>
        <ul
            tabindex="0"
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow">
          <li>
            <a class="justify-between">
              Profile
              <span class="badge">New</span>
            </a>
          </li>
          <li><a>Settings</a></li>
          <li v-if="authStore.isLoggedIn"><a @click="authStore.logout">Logout</a></li>
          <li v-if="!authStore.isLoggedIn"><a href="/login">Login</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>