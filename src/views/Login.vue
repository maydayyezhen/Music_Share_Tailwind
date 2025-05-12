<script setup>
import { ref } from 'vue';
import {useAuthStore} from "@/stores/authStore.js";
import Alerts from "@/components/Alerts.vue";
import router from "@/router/index.js";
const username = ref('');
const password = ref('');
const authStore = useAuthStore();



const alertsRef = ref(null)
function triggerToast(alertType, alertMessage) {
  alertsRef.value?.showToast(alertType, alertMessage)
}

const formRef = ref(null)
async function handleSubmit() {
  const form = formRef.value;
  if (form.checkValidity()){
    try{
      const message = await authStore.login(username.value, password.value);
      triggerToast('success', `${message} 3秒后跳转至主页`)
      setTimeout(() => {
        router.push('/music_db')
      }, 3000)
    }
    catch (error){
      if (error.response && error.response.data) {
        triggerToast('error', error.response.data.token)
      } else {
        triggerToast('error', '登录失败！未知错误')
      }
    }
  }
  else form.reportValidity()
}
</script>

<template>
  <alerts ref="alertsRef" />
  <div class="hero min-h-screen bg-base-200 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');">

  <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="text-center lg:text-left">
        <h1 class="text-5xl font-bold">立即登录，开始畅享音乐！</h1>
        <p class="py-6">
          登录你的账户，继续探索无尽音乐，享受每一刻的旋律。
        </p>
      </div>

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
                    type="text"
                    v-model="username"
                    required
                    placeholder="Username"
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
                    type="password"
                    v-model="password"
                    required
                    placeholder="Password"
                    minlength="8"
                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                    title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                />
              </label>
              <p class="validator-hint hidden">
                必须超过 8 个字符，并包含以下内容：
                <br />至少一个数字 <br />至少一个小写字母 <br />至少一个大写字母
              </p>
              <div><a class="link link-hover" @click="router.push('/register')">还没有账号？</a></div>
              <button type="submit" class="btn btn-neutral mt-4">登录</button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>