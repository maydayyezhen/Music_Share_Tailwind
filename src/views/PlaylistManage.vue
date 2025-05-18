<template>
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold">播放列表管理</h1>
            <button @click="console.log('Button clicked'); showCreateModal = true"
                    class="btn btn-primary">
                新建歌单
            </button>
        </div>

        <!-- 搜索和筛选 -->
        <div class="bg-base-200 p-4 rounded-lg mb-6">
            <div class="flex flex-wrap items-center gap-4">
                <div class="form-control flex-1">
                    <input v-model="searchQuery"
                           @input="handleSearch"
                           type="text"
                           placeholder="搜索歌单..."
                           class="input input-bordered w-full" />
                </div>
                <div class="form-control">
                    <select v-model="sortBy" @change="fetchPlaylists" class="select select-bordered">
                        <option value="name">按名称</option>
                        <option value="createdAt">按创建时间</option>
                        <option value="likeCount">按点赞数</option>
                    </select>
                </div>
                <div class="form-control">
                    <select v-model="sortOrder" @change="fetchPlaylists" class="select select-bordered">
                        <option value="asc">升序</option>
                        <option value="desc">降序</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- 播放列表表格 -->
        <div class="overflow-x-auto bg-base-100 rounded-lg shadow">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>封面</th>
                        <th>名称</th>
                        <th>描述</th>
                        <th>歌曲数</th>
                        <th>点赞数</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="playlist in playlists.content" :key="playlist.id">
                        <td>
                            <div class="avatar">
                                <div class="w-16 h-16 rounded">
                                    <img :src="playlist.cover || '/default-playlist-cover.jpg'"
                                         :alt="playlist.name"
                                         @error="handleImageError" />
                                </div>
                            </div>
                        </td>
                        <td class="font-bold">{{ playlist.name }}</td>
                        <td class="max-w-xs truncate">{{ playlist.description || '暂无描述' }}</td>
                        <td>{{ playlist.songCount || 0 }}</td>
                        <td>{{ playlist.likeCount || 0 }}</td>
                        <td>
                            <div class="flex gap-2">
                                <button @click="openEditModal(playlist)"
                                        class="btn btn-sm btn-outline">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button @click="openManageSongsModal(playlist)"
                                        class="btn btn-sm btn-outline">
                                    <i class="fas fa-music"></i>
                                </button>
                                <button @click="likePlaylist(playlist.id)"
                                        class="btn btn-sm btn-outline"
                                        :class="{ 'btn-primary': playlist.liked }">
                                    <i class="fas fa-thumbs-up"></i>
                                </button>
                                <button @click="confirmDeletePlaylist(playlist.id)"
                                        class="btn btn-sm btn-error">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 分页 -->
        <div class="flex justify-center mt-6">
            <div class="btn-group">
                <button v-for="page in pageNumbers"
                        :key="page"
                        @click="goToPage(page)"
                        class="btn"
                        :class="{ 'btn-active': page === currentPage }">
                    {{ page }}
                </button>
            </div>
        </div>

        <!-- 创建歌单模态框 -->
        <div v-if="showCreateModal" class="modal modal-open">
            <div class="modal-box">
                <h3 class="font-bold text-lg">创建新歌单</h3>
                <div class="py-4">
                    <div class="form-control mb-4">
                        <label class="label">
                            <span class="label-text">歌单名称</span>
                        </label>
                        <input v-model="newPlaylist.name"
                               type="text"
                               placeholder="输入歌单名称"
                               class="input input-bordered w-full"
                               required />
                    </div>
                    <div class="form-control mb-4">
                        <label class="label">
                            <span class="label-text">歌单描述</span>
                        </label>
                        <textarea v-model="newPlaylist.description"
                                  class="textarea textarea-bordered h-24"
                                  placeholder="输入歌单描述"></textarea>
                    </div>
                    <div class="form-control mb-4">
                        <label class="label">
                            <span class="label-text">歌单封面</span>
                        </label>
                        <input type="file"
                               @change="handleCoverUpload"
                               accept="image/*"
                               class="file-input file-input-bordered w-full" />
                    </div>
                </div>
                <div class="modal-action">
                    <button @click="createPlaylist" class="btn btn-primary" :disabled="!newPlaylist.name">
                        创建
                    </button>
                    <button @click="showCreateModal = false" class="btn">取消</button>
                </div>
            </div>
        </div>

        <!-- 编辑歌单模态框 -->
        <div v-if="showEditModal && currentEditPlaylist" class="modal modal-open">
            <div class="modal-box">
                <h3 class="font-bold text-lg">编辑歌单</h3>
                <div class="py-4">
                    <div class="form-control mb-4">
                        <label class="label">
                            <span class="label-text">歌单名称</span>
                        </label>
                        <input v-model="currentEditPlaylist.name"
                               type="text"
                               placeholder="输入歌单名称"
                               class="input input-bordered w-full"
                               required />
                    </div>
                    <div class="form-control mb-4">
                        <label class="label">
                            <span class="label-text">歌单描述</span>
                        </label>
                        <textarea v-model="currentEditPlaylist.description"
                                  class="textarea textarea-bordered h-24"
                                  placeholder="输入歌单描述"></textarea>
                    </div>
                    <div class="form-control mb-4">
                        <label class="label">
                            <span class="label-text">歌单封面</span>
                        </label>
                        <div class="flex items-center gap-4">
                            <div class="avatar">
                                <div class="w-20 h-20 rounded">
                                    <img :src="currentEditPlaylist.cover || '/default-playlist-cover.jpg'"
                                         :alt="currentEditPlaylist.name" />
                                </div>
                            </div>
                            <input type="file"
                                   @change="handleEditCoverUpload"
                                   accept="image/*"
                                   class="file-input file-input-bordered" />
                        </div>
                    </div>
                </div>
                <div class="modal-action">
                    <button @click="updatePlaylist" class="btn btn-primary">保存</button>
                    <button @click="showEditModal = false" class="btn">取消</button>
                </div>
            </div>
        </div>

        <!-- 管理歌曲模态框 -->
        <div v-if="showManageSongsModal && currentPlaylist" class="modal modal-open">
            <div class="modal-box max-w-3xl">
                <h3 class="font-bold text-lg">管理歌曲 - {{ currentPlaylist.name }}</h3>
                <div class="py-4">
                    <!-- 添加歌曲 -->
                    <div class="flex gap-4 mb-6">
                        <select v-model="selectedSongToAdd"
                                class="select select-bordered flex-1">
                            <option disabled value="">选择要添加的歌曲</option>
                            <option v-for="song in availableSongs"
                                    :key="song.id"
                                    :value="song.id">
                                {{ song.title }} - {{ song.artist }}
                            </option>
                        </select>
                        <button @click="addSongToPlaylist"
                                class="btn btn-primary"
                                :disabled="!selectedSongToAdd">
                            添加歌曲
                        </button>
                    </div>

                    <!-- 歌曲列表 -->
                    <div class="overflow-x-auto">
                        <table class="table w-full">
                            <thead>
                                <tr>
                                    <th>封面</th>
                                    <th>歌曲名称</th>
                                    <th>艺术家</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="song in currentPlaylist.songDetails" :key="song.id">
                                    <td>
                                        <div class="avatar">
                                            <div class="w-12 h-12 rounded">
                                                <img :src="song.cover || '/default-song-cover.jpg'"
                                                     :alt="song.title" />
                                            </div>
                                        </div>
                                    </td>
                                    <td>{{ song.title }}</td>
                                    <td>{{ song.artist || '未知' }}</td>
                                    <td>
                                        <button @click="removeSongFromPlaylist(song.id)"
                                                class="btn btn-sm btn-error">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="currentPlaylist.songDetails.length === 0">
                                    <td colspan="4" class="text-center py-4">暂无歌曲</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-action">
                    <button @click="showManageSongsModal = false" class="btn">关闭</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue';
    import {
        apiGetPagedPlaylists,
        apiCreatePlaylist,
        apiUpdatePlaylist,
        apiDeletePlaylist,
        apiUploadPlaylistCover,
        apiAddSongToPlaylist,
        apiRemoveSongFromPlaylist,
        apiLikePlaylist,
        apiGetPlaylistCover,
        apiGetPlaylistById,
        
    } from '@/api/playlist-api';
    import {
        apiGetAllSongs
    } from '@/api/song-api';
    import { useAuthStore } from '@/stores/authStore';

    const authStore = useAuthStore();

    // 数据状态
    const playlists = ref({ content: [], page: {} });
    const allSongs = ref([]);
    const currentPage = ref(0);
    const pageSize = 10;
    const searchQuery = ref('');
    const sortBy = ref('');
    const sortOrder = ref('desc');

    // 模态框状态
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const showManageSongsModal = ref(false);
    const currentEditPlaylist = ref(null);
    const currentPlaylist = ref(null);
    const selectedSongToAdd = ref('');

    // 新歌单表单
    const newPlaylist = ref({
        name: '',
        description: '',
        coverImage: null
    });

    // 计算属性
    const pageNumbers = computed(() => {
        if (!playlists.value.page) return [];
        const totalPages = playlists.value.page.totalPages || 1;
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    });

    const availableSongs = computed(() => {
        if (!currentPlaylist.value) return allSongs.value;
        return allSongs.value.filter(song =>
            !currentPlaylist.value.songs.includes(song.id)
        );
    });

    // 生命周期钩子
    onMounted(() => {
        fetchPlaylists();
        fetchAllSongs();
    });

    // 方法
    const fetchPlaylists = async () => {
        try {
            const response = await apiGetPagedPlaylists(
                currentPage.value,
                pageSize,
                searchQuery.value,
                sortBy.value,
                sortOrder.value
            );
            playlists.value = response.data;

            // 处理封面和歌曲详情
            for (const playlist of playlists.value.content) {
                // 处理封面
                if (playlist.coverUrl) {
                    try {
                        playlist.cover = await apiGetPlaylistCover(playlist.coverUrl);
                    } catch (error) {
                        console.error('获取封面失败:', error);

                    }
                }

                // 处理歌曲详情
                if (playlist.songs && Array.isArray(playlist.songs)) {
                    playlist.songDetails = playlist.songs.map(songId => {
                        const song = allSongs.value.find(s => s.id === songId);
                        return song || {
                            id: songId,
                            title: '未知歌曲',
                            artist: '未知艺术家',
                            cover: '/default-song-cover.jpg'
                        };
                    });
                } else {
                    playlist.songDetails = [];
                }
            }
        } catch (error) {
            console.error('获取播放列表失败:', error);
        }
    };

    const fetchAllSongs = async () => {
        try {
            const response = await apiGetAllSongs();
            allSongs.value = response.data.map(song => ({
                ...song,
                cover: song.coverUrl || '/default-song-cover.jpg'
            }));
        } catch (error) {
            console.error('获取所有歌曲失败:', error);
        }
    };

    const handleSearch = () => {
        currentPage.value = 0;
        fetchPlaylists();
    };

    const goToPage = (page) => {
        currentPage.value = page - 1;
        fetchPlaylists();
    };

    const handleCoverUpload = (event) => {
        newPlaylist.value.coverImage = event.target.files[0];
    };

    const handleEditCoverUpload = (event) => {
        if (event.target.files[0]) {
            currentEditPlaylist.value.coverImage = event.target.files[0];
            currentEditPlaylist.value.cover = URL.createObjectURL(event.target.files[0]);
        }
    };

    const handleImageError = (event) => {
        event.target.src = '/default-playlist-cover.jpg';
    };

    const createPlaylist = async () => {
        try {
            const playlistData = {
                name: newPlaylist.value.name,
                description: newPlaylist.value.description,
                creator: {
                    id: authStore.user.id,
                    username: authStore.user.username,
                    nickname: authStore.user.nickname
                }
            };

            const response = await apiCreatePlaylist(playlistData);

            if (newPlaylist.value.coverImage) {
                await apiUploadPlaylistCover(response.data.id, newPlaylist.value.coverImage);
            }

            showCreateModal.value = false;
            resetNewPlaylistForm();
            fetchPlaylists();
        } catch (error) {
            console.error('创建播放列表失败:', error);
        }
    };

    const openEditModal = (playlist) => {
        currentEditPlaylist.value = { ...playlist };
        showEditModal.value = true;
    };

    const updatePlaylist = async () => {
        try {
            const response = await apiUpdatePlaylist({
                id: currentEditPlaylist.value.id,
                name: currentEditPlaylist.value.name,
                description: currentEditPlaylist.value.description
            });

            if (currentEditPlaylist.value.coverImage) {
                await apiUploadPlaylistCover(
                    currentEditPlaylist.value.id,
                    currentEditPlaylist.value.coverImage
                );
            }

            showEditModal.value = false;
            fetchPlaylists();
        } catch (error) {
            console.error('更新播放列表失败:', error);
        }
    };

    const openManageSongsModal = (playlist) => {
        currentPlaylist.value = { ...playlist };
        showManageSongsModal.value = true;
    };

    const addSongToPlaylist = async () => {
        try {
            await apiAddSongToPlaylist(
                currentPlaylist.value.id,
                selectedSongToAdd.value
            );

            // 刷新当前播放列表数据
            const updatedPlaylist = await apiGetPlaylistById(currentPlaylist.value.id);
            currentPlaylist.value = updatedPlaylist.data;

            // 更新歌曲详情
            if (currentPlaylist.value.songs && Array.isArray(currentPlaylist.value.songs)) {
                currentPlaylist.value.songDetails = currentPlaylist.value.songs.map(songId => {
                    const song = allSongs.value.find(s => s.id === songId);
                    return song || {
                        id: songId,
                        title: '未知歌曲',
                        artist: '未知艺术家',
                        cover: '/default-song-cover.jpg'
                    };
                });
            }

            selectedSongToAdd.value = '';
        } catch (error) {
            console.error('添加歌曲失败:', error);
        }
    };

    const removeSongFromPlaylist = async (songId) => {
        try {
            await apiRemoveSongFromPlaylist(currentPlaylist.value.id, songId);

            // 更新本地数据
            currentPlaylist.value.songs = currentPlaylist.value.songs.filter(id => id !== songId);
            currentPlaylist.value.songDetails = currentPlaylist.value.songDetails.filter(
                song => song.id !== songId
            );
        } catch (error) {
            console.error('移除歌曲失败:', error);
        }
    };

    const likePlaylist = async (playlistId) => {
        try {
            await apiLikePlaylist(playlistId);
            fetchPlaylists();
        } catch (error) {
            console.error('点赞失败:', error);
        }
    };

    const confirmDeletePlaylist = (playlistId) => {
        if (confirm('确定要删除这个播放列表吗？此操作不可撤销。')) {
            deletePlaylist(playlistId);
        }
    };

    const deletePlaylist = async (playlistId) => {
        try {
            await apiDeletePlaylist(playlistId);
            fetchPlaylists();
        } catch (error) {
            console.error('删除播放列表失败:', error);
        }
    };

    const resetNewPlaylistForm = () => {
        newPlaylist.value = {
            name: '',
            description: '',
            coverImage: null
        };
    };
</script>

<style scoped>
    /* 自定义样式 */
    .modal-box {
        max-height: calc(100vh - 100px);
        overflow-y: auto;
    }

    .table th, .table td {
        padding: 12px;
        vertical-align: middle;
    }
</style>
