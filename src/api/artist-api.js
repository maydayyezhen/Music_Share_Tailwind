import axios from './axiosInstance';


//GET
//获取所有歌手
export const apiGetAllArtists = () => {
    return axios.get(`/artists`);
}
export const apiGetArtistById = (id) => {
    return axios.get(`/artists/${id}`);
}
export const apiGetArtists = (page, size, keyword='', sortBy='', sortOrder='') => {
    return axios.get(`/artists/paged?page=${page}&size=${size}&keyword=${keyword}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
}


//POST
//创建歌手
export const apiCreateArtist = (artistData) => {
    return axios.post(`/artists`, artistData);
}
//上传歌手头像
export const apiUploadAvatarFile = (id, avatarFile) => {
    const formData = new FormData();
    formData.append('avatarFile', avatarFile);
    return axios.post(`/artists/${id}/avatarFile`, formData,{
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

//DELETE
//删除歌手
export const apiDeleteArtistById = (id) => {
    return axios.delete(`/artists/${id}`);
}
//删除歌手头像
export const apiDeleteAvatarFileById = (id) => {
    return axios.delete(`/artists/${id}/avatarFile`);
}

export const apiUpdateArtist = (artistData) =>{
    return axios.put(`/artists`,artistData)
}

//获取歌手头像URL
export  const apiGetArtistAvatarFileUrl = async (fileUrl) => {
    const res = await axios.get(fileUrl, {
        responseType: 'blob',
    })
    return URL.createObjectURL(res.data)
}