import axios from './axiosInstance';

//GET
//获取所有专辑
export const apiGetAllAlbums = () => {
    return axios.get(`/albums`);
};

export const apiGetAlbums = (page, size, keyword='', sortBy='', sortOrder='') => {
    return axios.get(`/albums/paged?page=${page}&size=${size}&keyword=${keyword}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
}

//根据歌手ID获取专辑
export const apiGetAlbumsByArtistId = async (id) => {
    const response = await axios.get(`/albums/artist/${id}`);
    return response.data;
}

//根据专辑id获取专辑
export const apiGetAlbumById = async (id) => {
    const response = await axios.get(`/albums/${id}`);
    return response.data;
}


//POST
//创建专辑
export const apiCreateAlbum = (albumData) => {
    return axios.post(`/albums`, albumData);
}
//上传专辑封面
export const apiUploadCoverFile = (id,coverFile) => {
    const formData = new FormData();
    formData.append('coverFile', coverFile);
    return axios.post(`/albums/${id}/coverFile`, formData,{
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

//PUT
export const apiUpdateAlbum = (albumData) => {
    return axios.put(`/albums`,albumData);
}
//DELETE
//删除专辑
export const apiDeleteAlbumById = (id) => {
    return axios.delete(`/albums/${id}`);
}

//删除专辑封面
export const apiDeleteCoverFileById = (id) => {
    return axios.delete(`/albums/${id}/coverFile`);
}

//获取封面URL
export const apiGetCover = async (fileUrl) => {
    if(!fileUrl) return null;
    const res = await axios.get(fileUrl, {
        responseType: 'blob',
    })
    return URL.createObjectURL(res.data)
}
