// src/api/axiosInstance.js
import axios from 'axios';
import {useAuthStore} from "@/stores/authStore.js";

const API_BASE_URL = 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL
});

// 添加请求拦截器，自动附带 token
axiosInstance.interceptors.request.use(
    (config) => {
            const token = localStorage.getItem(`token`);
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    response => response, // 正常响应直接返回
    async error => {
        const authStore = useAuthStore();

        // 如果是 401 错误，且包含登录过期提示
        if (error.response && error.response.status === 401) {
            alert('登录已过期，请重新登录');
            await authStore.logout(false);

        }

        return Promise.reject(error);
    }
);



export default axiosInstance;
