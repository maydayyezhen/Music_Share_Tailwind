import { defineStore } from 'pinia';
import { ref } from 'vue';
import {useRouter} from "vue-router";
import {User} from "@/models/user.js";
import {apiGetUser, apiGetUserAvatarFile, apiLogin, apiLogout} from "@/api/user-api.js";
import {useUserLikeStore} from "@/stores/userLikeStore.js";

export const useAuthStore = defineStore('auth', () => {
    const isLoggedIn = ref(!!localStorage.getItem(`token`)|| false);
    const router = useRouter();
    const user = ref({ ...User });
    const theme = ref(localStorage.getItem('theme') || 'light')
    const userLikeStore = useUserLikeStore()

    const setTheme = (newTheme) => {
        theme.value = newTheme;
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('theme',  newTheme);
    }

    const login = async (username, password) => {
        const token = await apiLogin(username, password)
        localStorage.setItem(`token`, token);
        const dataResponse = await apiGetUser();
        user.value = dataResponse.data;
        if(user.value.avatarUrl)
        user.value.avatar = await apiGetUserAvatarFile(user.value.avatarUrl);
        isLoggedIn.value = true;
        alert("登录成功！");
        await userLikeStore.getLikes(user.value.id);
    };

    const autoLogin = async () => {
            try {
                const response = await apiGetUser();
                user.value = response.data;
                if(user.value.avatarUrl)
                user.value.avatar = await apiGetUserAvatarFile(user.value.avatarUrl);
                isLoggedIn.value = true;
                await userLikeStore.getLikes(user.value.id);
            }
            catch (e) {
                console.error('自动登录失败', e);
                localStorage.removeItem(`token`);
            }
    }

    const logout = async (isNormalLogout) => {
        if (isNormalLogout) {
            try {
                const response = await apiLogout();
                alert(response.data);
            } catch (e) {
                console.error('登出失败', e);
            }
        }
        localStorage.removeItem(`token`);
        user.value = { ...User };
        isLoggedIn.value = false;
        router.push('/').catch(() => {});
    };

    const fetchUser = async () => {
        try {
            const response = await apiGetUser();
            console.log('API响应:', response);
            user.value = response.data;
            if(user.value.avatarUrl)
            user.value.avatar = await apiGetUserAvatarFile(user.value.avatarUrl);
        } catch (error) {
            console.error('获取用户数据失败:', error);
            throw error;
        }
    }
    return { isLoggedIn, login, logout, user, fetchUser,autoLogin
    , theme, setTheme};
});
