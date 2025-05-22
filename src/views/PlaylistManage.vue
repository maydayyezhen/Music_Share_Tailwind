<template>
    <div class="container mx-auto px-4 py-8">
        <audio ref="audioRef"
               :src="currentPlayingSong?.audioUrl"
               @ended="handleAudioEnded"
               @pause="isPlaying = false"
               @play="isPlaying = true"
               class="hidden" />
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
                                    编辑信息
                                </button>
                                <button @click="openManageSongsModal(playlist)"
                                        class="btn btn-sm btn-outline">
                                    <i class="fas fa-music"></i>
                                    管理歌曲
                                </button>
                                <button @click="likePlaylist(playlist.id)"
                                        class="btn btn-sm btn-outline"
                                        :class="{ 'btn-primary': playlist.liked }">
                                    <i class="fas fa-thumbs-up"></i>
                                    点赞
                                </button>
                                <button @click="confirmDeletePlaylist(playlist.id)"
                                        class="btn btn-sm btn-error">
                                    <i class="fas fa-trash"></i>
                                    删除
                                </button>
                                <button @click="playPlaylist(playlist)"
                                        class="btn btn-sm btn-circle btn-ghost"
                                        :class="{ 'btn-primary': currentPlaylistPlaying?.id === playlist.id && isPlaying }">
                                    <svg v-if="!(currentPlaylistPlaying?.id === playlist.id && isPlaying)"
                                         class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M6 3L20 12 6 21V3z"></path>
                                    </svg>
                                    <svg v-else
                                         class="size-[1.6em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                         fill="currentColor">
                                        <path d="M8 5h2.5v14H8V5zm5.5 0H16v14h-2.5V5z" />
                                    </svg>
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
                                {{ song.title }}-{{ song.artist.name }}
                            </option>
                        </select>
                        <button @click="addSongToPlaylist"
                                class="btn btn-primary"
                                :disabled="!selectedSongToAdd">
                            添加歌曲
                        </button>
                    </div>

                    <!-- 加载状态 -->
                    <div v-if="loadingSongs" class="text-center py-4">
                        <span class="loading loading-spinner loading-lg"></span>
                        <p>正在加载歌曲...</p>
                    </div>

                    <!-- 歌曲列表 -->
                    <div v-else class="overflow-x-auto">
                        <table class="table w-full">
                            <thead>
                                <tr>
                                    <th>歌曲名称</th>
                                    <th>歌手</th>
                                    <th>操作</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="song in currentPlaylist.songDetails" :key="song.id">
                                    <td>{{ song.title || '未知歌曲' }}</td>
                                    <td>{{ song.artist.name || '未知歌手' }}</td>
                                    <td>
                                        <button @click="removeSongFromPlaylist(song.id)"
                                                class="btn btn-sm btn-error">
                                            <i class="fas fa-trash"></i> 移除
                                        </button>
                                    </td>
                                    <td>
                                        <MiniAudioPlayer></MiniAudioPlayer>
                                    </td>
                                </tr>
                            
                                <tr v-if="currentPlaylist.songDetails.length === 0">
                                    <td colspan="4" class="text-center py-4">
                                        <i class="fas fa-music text-4xl opacity-20 mb-2"></i>
                                        <p class="text-lg opacity-70">暂无歌曲，请添加歌曲到歌单</p>
                                    </td>
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
    import { ref, computed, onMounted ,nextTick } from 'vue';
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
        apiGetSongsByPlaylistId,

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

    // 播放相关状态
    const audioRef = ref(null);
    const currentPlayingSong = ref(null);
    const isPlaying = ref(false);
    const currentPlaylistPlaying = ref(null);

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

    const loadingSongs = ref(false);


    const openManageSongsModal = async (playlist) => {
        try {
            loadingSongs.value = true;
            showManageSongsModal.value = true;


            const playlistResponse = await apiGetPlaylistById(playlist.id);
            currentPlaylist.value = playlistResponse.data;


            const songsResponse = await apiGetSongsByPlaylistId(playlist.id);


            currentPlaylist.value.songDetails = songsResponse.data.map(song => ({
                ...song,
                cover: song.coverUrl || '/default-song-cover.jpg'
            }));

            currentPlaylist.value.songs = currentPlaylist.value.songDetails.map(song => song.id);

        } catch (error) {
            console.error('打开管理歌曲模态框失败:', error);
            currentPlaylist.value = {
                ...playlist,
                songs: [],
                songDetails: []
            };
        } finally {
            loadingSongs.value = false;
        }
    };


    const availableSongs = computed(() => {
        if (!currentPlaylist.value || !allSongs.value.length) return allSongs.value;


        const playlistSongIds = new Set(
            Array.isArray(currentPlaylist.value.songs)
                ? currentPlaylist.value.songs
                : []
        );


        return allSongs.value.filter(song => !playlistSongIds.has(song.id));
    });


    const addSongToPlaylist = async () => {
        try {
            if (!selectedSongToAdd.value || !currentPlaylist.value) return;

            loadingSongs.value = true;
            await apiAddSongToPlaylist(
                currentPlaylist.value.id,
                selectedSongToAdd.value
            );


            const songsResponse = await apiGetSongsByPlaylistId(currentPlaylist.value.id);
            currentPlaylist.value.songDetails = songsResponse.data.map(song => ({
                ...song,
                cover: song.coverUrl || '/default-song-cover.jpg'
            }));
            currentPlaylist.value.songs = currentPlaylist.value.songDetails.map(song => song.id);

            selectedSongToAdd.value = '';
        } catch (error) {
            console.error('添加歌曲失败:', error);
        } finally {
            loadingSongs.value = false;
        }
    };


    const removeSongFromPlaylist = async (songId) => {
        try {
            loadingSongs.value = true;
            await apiRemoveSongFromPlaylist(currentPlaylist.value.id, songId);


            const songsResponse = await apiGetSongsByPlaylistId(currentPlaylist.value.id);
            currentPlaylist.value.songDetails = songsResponse.data.map(song => ({
                ...song,
                cover: song.coverUrl || '/default-song-cover.jpg'
            }));
            currentPlaylist.value.songs = currentPlaylist.value.songDetails.map(song => song.id);

        } catch (error) {
            console.error('移除歌曲失败:', error);
        } finally {
            loadingSongs.value = false;
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
    // 播放控制方法
    const togglePlayback = (song = null) => {
        if (song) {
            // 播放单个歌曲
            if (currentPlayingSong.value?.id === song.id && audioRef.value) {
                if (isPlaying.value) {
                    audioRef.value.pause();
                } else {
                    audioRef.value.play();
                }
            } else {
                currentPlayingSong.value = song;
                isPlaying.value = true;
                // 使用nextTick确保audio元素已更新
                nextTick(() => {
                    audioRef.value.play();
                });
            }
        }
    };

    const playPlaylist = (playlist) => {
        if (!playlist.songDetails || playlist.songDetails.length === 0) return;

        currentPlaylistPlaying.value = playlist;

        // 如果当前播放的是这个歌单的第一首歌且正在播放，则暂停
        if (currentPlayingSong.value?.id === playlist.songDetails[0].id && isPlaying.value) {
            audioRef.value.pause();
            return;
        }

        // 否则从第一首开始播放
        currentPlayingSong.value = playlist.songDetails[0];
        isPlaying.value = true;
        nextTick(() => {
            audioRef.value.play();
        });
    };

    // 监听音频结束事件
    const handleAudioEnded = () => {
        if (currentPlaylistPlaying.value) {
            const currentIndex = currentPlaylistPlaying.value.songDetails.findIndex(
                song => song.id === currentPlayingSong.value.id
            );

            if (currentIndex < currentPlaylistPlaying.value.songDetails.length - 1) {
                // 播放下一首
                currentPlayingSong.value = currentPlaylistPlaying.value.songDetails[currentIndex + 1];
                nextTick(() => {
                    audioRef.value.play();
                });
            } else {
                // 歌单播放结束
                isPlaying.value = false;
                currentPlaylistPlaying.value = null;
            }
        } else {
            isPlaying.value = false;
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

    .modal-box {
        max-height: calc(100vh - 100px);
        overflow-y: auto;
    }

    .table th, .table td {
        padding: 12px;
        vertical-align: middle;
    }
</style>
