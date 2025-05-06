<script setup>
import { ref } from 'vue'
import {apiRegister} from "@/api/user-api.js";
const username = ref('')
const password = ref('')
const confirmPassword = ref('')

import Alerts from "@/components/Alerts.vue";
import router from "@/router/index.js";

const alertsRef = ref(null)
function triggerToast(alertType, alertMessage) {
  alertsRef.value?.showToast(alertType, alertMessage)
}

const formRef = ref(null)
async function handleSubmit() {
  const form = formRef.value;
  if (form.checkValidity()) {
    // 然后再检查自定义逻辑，例如密码一致性
    if (password.value !== confirmPassword.value) {
      triggerToast('error', '密码不一致')
      return
    }
    try {
      const message = await apiRegister(username.value, password.value)
      triggerToast('success', `${message} 3秒后跳转至登陆页面`)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      if (error.response && error.response.data) {
        triggerToast('error', error.response.data)
      } else {
        triggerToast('error', '注册失败！未知错误')
      }
    }
  } else {
    form.reportValidity()
  }
}

</script>



<template>
  <alerts ref="alertsRef" />
  <div class="hero bg-base-200 min-h-screen" style="background-image: url('https://images.unsplash.com/photo-1471478331149-c72f17e33c73?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')">
    <div class="hero-content flex-col lg:flex-row">
      <div class="text-center lg:text-left">
        <h1 class="text-5xl font-bold">加入我们，开始音乐旅程！</h1>
        <p class="py-6">
          创建账户，发现更多你喜爱的音乐，尽情畅享音乐世界。
        </p>
      </div>


      <!-- 右边表单卡片 -->
      <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div class="card-body">
          <form ref="formRef" @submit.prevent="handleSubmit">
          <fieldset class="fieldset">
            <label class="input validator">
              <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    stroke-width="2.5"
                    fill="none"
                    stroke="currentColor"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </g>
              </svg>
              <input
                  type="input"
                  v-model="username"
                  required
                  placeholder="用户名"
                  pattern="[A-Za-z][A-Za-z0-9\-]*"
                  minlength="3"
                  maxlength="30"
                  title="仅可包含字母、数字或短横线（-）"
              />
            </label>
            <p class="validator-hint hidden">
              必须为 3 到 30 个字符
              <br />仅可包含字母、数字或短横线（-）

            </p>
            <label class="input validator">
              <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    stroke-width="2.5"
                    fill="none"
                    stroke="currentColor"
                >
                  <path
                      d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                  ></path>
                  <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                </g>
              </svg>
              <input
                  ref="passwordInput"
                  type="password"
                  v-model="password"
                  required
                  placeholder="密码"
                  minlength="8"
                  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                  title="必须超过 8 个字符，并包含至少一个数字、至少一个小写字母以及至少一个大写字母"
              />
            </label>
            <p class="validator-hint hidden">
              必须超过 8 个字符，并包含以下内容：
              <br />至少一个数字 <br />至少一个小写字母 <br />至少一个大写字母
            </p>
            <label class="input" :class="{
                          'border-green-500': password === confirmPassword && confirmPassword,
                          'border-red-500': password !== confirmPassword && confirmPassword
                    }">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-[1em] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 11V7a4 4 0 018 0v4m0 0h8v10H4V11h8z" />
              </svg>


              <input
                  type="password"
                  v-model="confirmPassword"
                  placeholder="确认密码"
                  title="两次密码必须一致"
              />
            </label>
            <p v-if="password !== confirmPassword && confirmPassword.length > 0" class="text-red-500">
              密码不一致，请重新确认。
            </p>
            <div><a class="link link-hover" @click="router.push('/login')">已有账号？</a></div>
            <button type="submit" class="btn btn-neutral mt-4">注册</button>
          </fieldset>
        </form>
        </div>
      </div>
    </div>
  </div>
</template>