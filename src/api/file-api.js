const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiGetFileUrl = (fileUrl) => {
    if(fileUrl==="")
        return '';
    return `${API_BASE_URL}/${fileUrl}`;
}