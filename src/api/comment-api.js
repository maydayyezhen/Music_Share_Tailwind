import axiosInstance from './axiosInstance';

/**
 * 评论相关API
 */
const CommentAPI = {
  /**
   * 添加评论
   * @param {Object} commentData - 评论数据
   * @param {string} commentData.contentType - 评论对象类型 (song, album, artist, playlist)
   * @param {number} commentData.contentId - 评论对象ID
   * @param {string} commentData.content - 评论内容
   * @returns {Promise} - 返回Promise对象
   */
  addComment(commentData) {
    return axiosInstance.post('/api/comments', commentData);
  },

  /**
   * 获取内容的评论列表
   * @param {string} contentType - 内容类型 (song, album, artist, playlist)
   * @param {number} contentId - 内容ID
   * @returns {Promise} - 返回Promise对象
   */
  getComments(contentType, contentId) {
    return axiosInstance.get(`/api/comments/${contentType}/${contentId}`);
  },

  /**
   * 获取当前用户的评论
   * @returns {Promise} - 返回Promise对象
   */
  getMyComments() {
    return axiosInstance.get('/api/comments/my-comments');
  },

  /**
   * 删除评论
   * @param {number} commentId - 评论ID
   * @returns {Promise} - 返回Promise对象
   */
  deleteComment(commentId) {
    return axiosInstance.delete(`/api/comments/${commentId}`);
  },

  /**
   * 管理员删除内容的所有评论
   * @param {string} contentType - 内容类型 (song, album, artist, playlist)
   * @param {number} contentId - 内容ID
   * @returns {Promise} - 返回Promise对象
   */
  deleteContentComments(contentType, contentId) {
    return axiosInstance.delete(`/api/comments/admin/${contentType}/${contentId}`);
  },
  
  /**
   * 点赞评论
   * @param {number} commentId - 评论ID
   * @returns {Promise} - 返回Promise对象
   */
  likeComment(commentId) {
    return axiosInstance.post(`/api/comments/${commentId}/like`);
  },
  
  /**
   * 取消点赞评论
   * @param {number} commentId - 评论ID
   * @returns {Promise} - 返回Promise对象
   */
  unlikeComment(commentId) {
    return axiosInstance.delete(`/api/comments/${commentId}/like`);
  }
};

export default CommentAPI; 