import axios from './axiosInstance';

const userLikeApi = {
    async getUserLikeByUserId(userId) {
    const response = await axios.get('/userLikes/user/' + userId);
    return response.data;
  },

    async createUserLike(userId, targetType,targetId ) {
    const userLike = { userId, targetType,targetId  };
    const response = await axios.post('/userLikes', userLike);
    return response.data;
   },

    async deleteUserLike(userId, targetType, targetId) {
        const response = await axios.delete('/userLikes', {
            params: { userId, targetType, targetId}
        });
        return response.data;
    }
}

export default userLikeApi;