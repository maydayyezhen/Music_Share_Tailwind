import './assets/main.css'
import router from './router'
import { createApp } from 'vue'
import App from './App.vue'
import {createPinia} from "pinia";
import lazyImg from "@/directives/lazy-img.js";

const app = createApp(App)
app.directive('lazy-img', lazyImg)
app.use(createPinia())
app.use(router)
app.mount('#app')



