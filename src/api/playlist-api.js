import axios from './axiosInstance';

// GET
// 获取所有播放列表
export const apiGetAllPlaylists = () => {
    return axios.get(`/playlists`);
};

// 获取分页播放列表
export const apiGetPagedPlaylists = (page, size, keyword = '', sortBy = 'id', sortOrder = 'asc') => {
    return axios.get(`/playlists/paged?page=${page}&size=${size}&keyword=${keyword}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
};

// 通过ID获取播放列表
export const apiGetPlaylistById = (id) => {
    return axios.get(`/playlists/${id}`);
};

// 通过用户ID获取播放列表
export const apiGetPlaylistsByUserId = (userId) => {
    return axios.get(`/playlists/user/${userId}`);
};

// 获取播放列表中的歌曲
export const apiGetSongsByPlaylistId = (id) => {
    return axios.get(`/playlists/${id}/songs`);
};

// POST
// 创建播放列表
export const apiCreatePlaylist = (playlistData) => {
    return axios.post(`/playlists`, playlistData);
};

// 上传播放列表封面
export const apiUploadPlaylistCover = (id, coverImage) => {
    const formData = new FormData();
    formData.append('coverImage', coverImage);
    return axios.post(`/playlists/${id}/cover`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// 添加歌曲到播放列表
export const apiAddSongToPlaylist = (playlistId, songId) => {
    return axios.post(`/playlists/${playlistId}/songs/${songId}`);
};

// PUT
// 更新播放列表
export const apiUpdatePlaylist = (playlistData) => {
    return axios.put(`/playlists`, playlistData);
};

// 点赞播放列表
export const apiLikePlaylist = (id) => {
    return axios.post(`/playlists/${id}/like`);
};

// DELETE
// 删除播放列表
export const apiDeletePlaylist = (id) => {
    return axios.delete(`/playlists/${id}`);
};

// 从播放列表移除歌曲
export const apiRemoveSongFromPlaylist = (playlistId, songId) => {
    return axios.delete(`/playlists/${playlistId}/songs/${songId}`);
};

// 文件操作
// 获取播放列表封面URL
export const apiGetPlaylistCover = async (fileUrl) => {
    const res = await axios.get(fileUrl, {
        responseType: 'blob',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });
    return URL.createObjectURL(res.data);
};

//删除封面
export const apiDeleteAvatarFileById = (id) => {
    return axios.delete(`/playlists/${id}/avatarFile`);
}
