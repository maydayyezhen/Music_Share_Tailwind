
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {useRouter} from "vue-router";
import {User} from "@/models/user.js";
import {apiGetUser, apiLogin, apiLogout} from "@/api/user-api.js";

export const useAuthStore = defineStore('auth', () => {
    const isLoggedIn = ref(!!localStorage.getItem(`token`)|| false);
    const section = ref();
    const router = useRouter();
    const user = ref({ ...User }
    );
    const theme = ref(localStorage.getItem('theme') || 'light')

    const setTheme = (newTheme) => {
        theme.value = newTheme;
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('theme',  newTheme);
    }

    const setSection = (newSection) => {
        section.value = newSection;
        if (section.value === 'my_music') {
            router.push('/my_music').catch(() => {});
        }
        if (section.value === 'music_db') {
            router.push('/music_db').catch(() => {});
        }
        if (section.value === 'user_manage') {
            router.push('/user_manage').catch(() => {});
        }
    }

    const login = async (username, password) => {
        const token = await apiLogin(username, password)
        localStorage.setItem(`token`, token);
        const dataResponse = await apiGetUser();
        const user = dataResponse.data;
        saveUser(user);
        isLoggedIn.value = true;
        alert("登录成功！");
    };

    const autoLogin = async () => {
            try {
                const response = await apiGetUser();
                const user = response.data;
                saveUser(user);
                isLoggedIn.value = true;
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
        isLoggedIn.value = false;
        router.push('/').catch(() => {});
    };

    const fetchUser = async () => {
        try {
            const response = await apiGetUser();
            console.log('API响应:', response);
            user.value = response.data;
            saveUser(user.value);
        } catch (error) {
            console.error('获取用户数据失败:', error);
            throw error;
        }
    }
    const saveUser = (newUser) => {
        user.value = newUser;
    }
    return { isLoggedIn, login, logout, section, setSection, user, fetchUser, saveUser,autoLogin
    , theme, setTheme};
});
