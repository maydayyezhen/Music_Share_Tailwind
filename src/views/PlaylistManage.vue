<template>
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
        </div>

        <!-- 播放列表表格 -->
        <MyTable :modelValue="playlists.content"
                 :columns="columns"
                 :pagination="playlists.page"
                 :sortBy="sortBy"
                 :sortOrder="sortOrder"
                 @update="handleUpdatePlaylist"
                 @add="handleAddPlaylist"
                 @delete="handleDeletePlaylist"
                 @query-change="handleQueryChange"
                 @page-change="handlePageChange"
                 :columnActions="columnActions" />

        <!-- 管理歌曲模态框 -->
        <div v-if="showManageSongsModal && currentPlaylist" class="modal modal-open">
            <div class="modal-box max-w-3xl">
                <h3 class="font-bold text-lg">管理歌曲 - {{ currentPlaylist.name }}</h3>
                <div class="py-4">
                    <!-- 添加歌曲 -->
                    <div class="flex gap-4 mb-6">
                        <select v-model="selectedSongToAdd" class="select select-bordered flex-1">
                            <option disabled value="">选择要添加的歌曲</option>
                            <option v-for="song in availableSongs" :key="song.id" :value="song.id">
                                {{ song.title }}-{{ song.artist.name }}
                            </option>
                        </select>
                        <button @click="addSongToPlaylist" class="btn btn-primary" >
                            添加歌曲
                        </button>
                    </div>

                    <!-- 歌曲列表 -->
                    <div class="overflow-x-auto">
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
                                        <button @click="removeSongFromPlaylist(song.id)" class="btn btn-sm btn-error">
                                            <i class="fas fa-trash"></i> 移除
                                        </button>
                                    </td>
                                    <td>
                                        <!-- 使用 MiniAudioPlayer 组件 -->
                                        <MiniAudioPlayer :src="song.audioUrl" @ended="handleAudioEnded" @pause="handlePause" @play="isPlaying = true" />
                                        <span v-if="!song.audioUrl" class="text-gray-400 text-sm ml-2">无音频</span>
                                    </td>
                                </tr>
                                <tr>
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
    import { ref, computed, onMounted, nextTick } from 'vue';
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
        apiGetSongsByPlaylistId
    } from '@/api/playlist-api';
    import { apiGetAllSongs } from '@/api/song-api';
    import { useAuthStore } from '@/stores/authStore';
    import MyTable from '@/components/MyTable.vue';
    import MiniAudioPlayer from '@/components/MiniAudioPlayer.vue';
    import { Play } from 'lucide-vue-next';

    const authStore = useAuthStore();

    // 数据状态
    const alertsRef = ref(null)
    const playlists = ref({ content: [], page: {} });
    const allSongs = ref([]);
    const currentPage = ref(0);
    const pageSize = 10;
    const searchQuery = ref('');
    const sortBy = ref('');
    const sortOrder = ref('desc');
    const currentPlaylist = ref(null);
    const selectedSongToAdd = ref('');

    // 模态框状态
    const showManageSongsModal = ref(false);

    // 播放相关状态
    const currentPlayingSong = ref(null);
    const isPlaying = ref(false);

    // 新歌单表单
    const newPlaylist = ref({
        name: '',
        description: '',
        coverImage: null
    });

    // 表格列定义
    const columns = [
        {
            key: 'cover',
            label: '封面',
            displayComponent: 'img',
            editComponent: 'MyImageUpload',
            imageClass: 'w-16 h-16 rounded object-cover'
        },
        {
            key: 'name',
            label: '名称',
            bold: true,
            sortable: true
        },
        {
            key: 'description',
            label: '描述',
            sortable: true
        },
    ];

    // 表格操作按钮
    const columnActions = [
        {
            name: 'manageSongs',
            label: '管理歌曲',
            class: "btn btn-ghost btn-xs",
            handler: (playlist) => {
                openManageSongsModal(playlist);
            }
        },
        {
            name: 'play',
            label: '播放',
            class: "btn btn-ghost btn-xs",
            handler: (playlist) => {
                if (playlist.songDetails?.length > 0) {
                    // 这里可以考虑直接使用 MiniAudioPlayer 播放第一首歌
                    currentPlayingSong.value = playlist.songDetails[0];
                }
            }
        }
    ];

    function triggerToast(alertType, alertMessage) {
        alertsRef.value?.showToast(alertType, alertMessage)
    }


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
                audioUrl: song.audioUrl,
                cover: song.coverUrl || '/default-song-cover.jpg'
            }));
        } catch (error) {
            console.error('获取所有歌曲失败:', error);
        }
    };


    const openManageSongsModal = async (playlist) => {
        try {
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
        }
    };

    const removeSongFromPlaylist = async (songId) => {
        try {
            await apiRemoveSongFromPlaylist(currentPlaylist.value.id, songId);

            const songsResponse = await apiGetSongsByPlaylistId(currentPlaylist.value.id);
            currentPlaylist.value.songDetails = songsResponse.data.map(song => ({
                ...song,
                cover: song.coverUrl || '/default-song-cover.jpg'
            }));
            currentPlaylist.value.songs = currentPlaylist.value.songDetails.map(song => song.id);
        } catch (error) {
            console.error('移除歌曲失败:', error);
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


    // MyTable 事件处理方法
    const handleUpdatePlaylist = async ({ updatedRow, files }) => {
        try {
            const response = await apiUpdatePlaylist({
                id: updatedRow.id,
                name: updatedRow.name,
                description: updatedRow.description,
                creator: updatedRow.creator // 保留创建者信息
            });

            if (files.cover) {
                await apiUploadPlaylistCover(updatedRow.id, files.cover);
            }

            await fetchPlaylists(); // 重新加载数据
        } catch (error) {
            console.error('更新播放列表失败:', error);
        }
    };

    async function uploadFiles(files, id) {
        for (const [key, file] of Object.entries(files)) {
            try {
                if (key === 'cover') {
                    const response = await apiUploadPlaylistCover(id, file);
                    if (response.status !== 200) {
                        triggerToast('error', '上传封面图片出错');
                    }
                }
            } catch (error) {
                console.error(error);
                triggerToast('error', `上传${key}文件出错`)
            }
        }
    }

    const handleAddPlaylist = async ({ newRow, files, onSuccess }) => {
        try {
            const playlistData = {
                ...newRow,
                creator: {
                    id: authStore.user.id,
                    username: authStore.user.username,
                    nickname: authStore.user.nickname
                }
            };

            const response = await apiCreatePlaylist(playlistData);
            const id = response.data.id;
            if (response.status !== 200) {
                triggerToast('error', '新增失败')
                return;
            }

            // 上传图片
            if (Object.keys(files).length > 0) {
                await uploadFiles(files, id);
            }
            // 获取更新后的数据
            const newresponse = await apiGetPlaylistById(id);
            // 更新图片
            newPlaylist.coverUrl = await apiGetPlaylistCover(newresponse.data.coverUrl);
            playlists.value.content.push(newPlaylist);
            await fetchPlaylists();
            triggerToast('success', '更新成功')
            onSuccess();
        } catch (error) {
            console.error(error);
            triggerToast('error', '更新过程中出现错误')
        }
    };

    const handleDeletePlaylist = async (id) => {
        try {
            await apiDeletePlaylist(id);
            fetchPlaylists();
        } catch (error) {
            console.error('删除播放列表失败:', error);
        }
    };

    const handleQueryChange = (page, size, keyword, sortByField, sortOrderDirection) => {
        currentPage.value = page;
        sortBy.value = sortByField;
        sortOrder.value = sortOrderDirection;
        searchQuery.value = keyword;
        fetchPlaylists();
    };

    const handlePageChange = (page) => {
        currentPage.value = page - 1;
        fetchPlaylists();
    };

    // 播放控制方法
    const handlePlay = (song) => {
        if (!song.audioUrl) {
            console.warn('歌曲没有音频文件');
            return;
        }
        currentPlayingSong.value = song;
    };

    const handlePause = () => {
        isPlaying.value = false;
    };

    const handleAudioEnded = () => {
        isPlaying.value = false;
        currentPlayingSong.value = null;
    };
</script>

<style scoped>
    .modal-box {
        max-height: calc(100vh - 100px);
        overflow-y: auto;
    }

    .table th,
    .table td {
        padding: 12px;
        vertical-align: middle;
    }
</style>
