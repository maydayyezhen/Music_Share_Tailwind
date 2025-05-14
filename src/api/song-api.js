import axios from './axiosInstance';


//GET
//获取所有歌曲
export const apiGetAllSongs = () => {
    return axios.get(`/songs`);
};

export const apiGetSongs = async (page, size, keyword = '', sortBy = '', sortOrder = '') => {
    const response = await axios.get(`/songs/paged?page=${page}&size=${size}&keyword=${keyword}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
    return response.data;
}

//通过歌手ID获取歌曲
export const apiGetSongsByArtistId = async (id) => {
    const response = await axios.get(`/songs/artist/${id}`);
    return response.data;
}
//通过专辑ID获取歌曲
export const apiGetSongsByAlbumId = (id) => {
    return axios.get(`/songs/album/${id}`);
}
//通过歌曲ID获取歌曲
export const apiGetSongById = async (id) => {
    const response = await axios.get(`/songs/${id}`);
    return response.data;
}

//根据歌曲ID获取专辑
export const apiGetAlbumBySongId = (id) => {
    return axios.get(`/songs/${id}/album`);
}

//POST
//创建歌曲
export const apiCreateSong = (songData) => {
    return axios.post(`/songs`, songData);
};
//上传音频文件
export const apiUploadAudioFile = (id,audioFile) => {
    const formData = new FormData();
    formData.append('audioFile', audioFile);
    return axios.post(`/songs/${id}/audioFile`, formData,{
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

//上传歌词文件
export const apiUploadLrcFile = (id,lrcFile) => {
    const formData = new FormData();
    formData.append('lrcFile', lrcFile);
    return axios.post(`/songs/${id}/lrcFile`, formData,{
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}



//PUT
//更新歌曲
export const apiUpdateSong = (songData) => {
    return axios.put(`/songs`, songData);
}


//DELETE
//删除歌曲
export const apiDeleteSongById = (id) => {
    return axios.delete(`/songs/${id}`);
}
//删除音频文件
export const apiDeleteAudioFileBySongId = (id) => {
    return axios.delete(`/songs/${id}/audioFile`);
}
//删除歌词文件
export const apiDeleteLrcFileBySongId = (id) => {
    return axios.delete(`/songs/${id}/lrcFile`);
}




//文件操作
//获取音频URL
export const apiGetAudio = async (fileUrl) => {
    const res = await axios.get(fileUrl, {
        responseType: 'blob',
    })
    return URL.createObjectURL(res.data)
}


export const apiGetLyric= async (fileUrl) => {
    const response = await axios.get(fileUrl, {
        responseType: 'text'
    });
    return response.data;
}



