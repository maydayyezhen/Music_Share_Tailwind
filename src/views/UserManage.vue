<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useAuthStore } from "@/stores/authStore.js";
    import { apiGetAllUsers, apiUpdateRole } from "@/api/user-api.js";

    const authStore = useAuthStore();

    // 数据状态
    const users = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const successMessage = ref(null);
    const showToast = ref(false);
    let toastTimer = null;

    // 显示Toast消息
    const displayToast = (message, isError = false) => {
        if (toastTimer) clearTimeout(toastTimer);

        if (isError) {
            error.value = message;
            successMessage.value = null;
        } else {
            successMessage.value = message;
            error.value = null;
        }

        showToast.value = true;
        toastTimer = setTimeout(() => {
            showToast.value = false;
        }, 2000);
    };

    // 获取所有用户
    const fetchUsers = async () => {
        try {
            loading.value = true;
            const response = await apiGetAllUsers();
            users.value = response.data;
            error.value = null;
        } catch (err) {
            displayToast('获取用户列表失败: ' + (err.response?.data?.message || err.message), true);
            users.value = [];
        } finally {
            loading.value = false;
        }
    };

    // 更新用户角色
    const updateUserRole = async (username, newRole) => {
        try {
            loading.value = true;
            await apiUpdateRole(authStore.user.username, username, newRole);
            displayToast(`用户 ${username} 的角色已成功更新为 ${newRole === 'admin' ? '管理员' : '普通用户'}`);
            await fetchUsers();
        } catch (err) {
            displayToast('更新角色失败: ' + (err.response?.data?.message || err.message), true);
        } finally {
            loading.value = false;
        }
    };

    // 计算属性：过滤掉当前用户
    const filteredUsers = computed(() => {
        return users.value.filter(user => user.username !== authStore.user.username);
    });

    // 组件挂载时获取用户数据
    onMounted(() => {
        fetchUsers();
    });
</script>

<template>
    <div class="container mx-auto p-4 max-w-6xl">
        <div class="card bg-base-100 shadow-xl p-6 rounded-box">
            <div class="flex items-center justify-center mb-6">
                <div class="text-3xl font-bold text-center">
                    <i class="fas fa-user-cog mr-2"></i>
                    用户角色管理
                </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="mb-4">
                <progress class="progress progress-primary w-full"></progress>
            </div>

            <!-- 用户列表表格 -->
            <div v-if="!loading && filteredUsers.length > 0" class="overflow-x-auto">
                <table class="table table-zebra">
                    <thead>
                        <tr>
                            <th>用户名</th>
                            <th>昵称</th>
                            <th>当前角色</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in filteredUsers" :key="user.username">
                            <td>{{ user.username }}</td>
                            <td>{{ user.nickname || 'N/A' }}</td>
                            <td>
                                <span class="badge" :class="user.role === 'admin' ? 'badge-primary' : 'badge-success'">
                                    {{ user.role === 'admin' ? '管理员' : '普通用户' }}
                                </span>
                            </td>
                            <td>
                                <select class="select select-bordered select-sm max-w-xs"
                                        v-model="user.role"
                                        @change="updateUserRole(user.username, user.role)">
                                    <option value="user">普通用户</option>
                                    <option value="admin">管理员</option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 空状态 -->
            <div v-if="!loading && filteredUsers.length === 0" class="alert alert-info shadow-lg my-4">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>没有其他用户可管理</span>
                </div>
            </div>
        </div>

        <!-- 消息提示 -->
        <div class="toast toast-top toast-center" v-if="showToast">
            <div class="alert" :class="error ? 'alert-error' : 'alert-success'">
                <div>
                    <span>{{ error || successMessage }}</span>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
    .card {
        transition: all 0.3s ease;
    }

    .progress {
        height: 0.5rem;
    }

    .table {
        margin-top: 1.25rem;
    }

    .select {
        min-width: 8rem;
    }
</style>
