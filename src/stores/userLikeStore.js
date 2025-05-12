import {defineStore} from 'pinia';
import {ref} from "vue";
import userLikeApi from "@/api/userLike-api.js";

export const useUserLikeStore = defineStore('userLike', () => {
    const likes = ref([]);
    const userId =ref()
    const likedSongIds = ref([]);
    const likedAlbumIds = ref([]);
    const likedArtistsIds = ref([]);
    const likedCommentsIds = ref([]);
    const likedPlaylistsIds = ref([]);
    const likedVideosIds = ref([]);
    const likedUserIds = ref([]);

    const getLikes = async (id) => {
        userId.value = id;
        likes.value = await userLikeApi.getUserLikeByUserId(id);
        likedSongIds.value = likes.value.filter(like => like.targetType === 'song').map(like => like.targetId);
        likedAlbumIds.value = likes.value.filter(like => like.targetType === 'album').map(like => like.targetId);
        likedArtistsIds.value = likes.value.filter(like => like.targetType === 'artist').map(like => like.targetId);
        likedCommentsIds.value = likes.value.filter(like => like.targetType === 'comment').map(like => like.targetId);
        likedPlaylistsIds.value = likes.value.filter(like => like.targetType === 'playlist').map(like => like.targetId);
        likedVideosIds.value = likes.value.filter(like => like.targetType === 'video').map(like => like.targetId);
        likedUserIds.value = likes.value.filter(like => like.targetType === 'user').map(like => like.targetId);
    };

    const createUserLike = async (userId, targetType,targetId ) => {
        await userLikeApi.createUserLike(userId, targetType,targetId );
    };

    const deleteUserLike = async (userId, targetType,targetId ) => {
        await userLikeApi.deleteUserLike(userId, targetType,targetId );
    };

    const isLiked = (targetId, targetType) => {
        switch (targetType) {
            case 'song':
                return likedSongIds.value.includes(targetId);
            case 'album':
                return likedAlbumIds.value.includes(targetId);
            case 'artist':
                return likedArtistsIds.value.includes(targetId);
            case 'comment':
                return likedCommentsIds.value.includes(targetId);
            case 'playlist':
                return likedPlaylistsIds.value.includes(targetId);
            case 'video':
                return likedVideosIds.value.includes(targetId);
            case 'user':
                return likedUserIds.value.includes(targetId);
            default:
                return false;
        }
    };

    const toggleLike = async (targetId, targetType) => {
        const alreadyLiked = isLiked(targetId, targetType);

        if (alreadyLiked) {
            await deleteUserLike(userId.value, targetType,targetId );
            updateLocalLikes(targetId, targetType, false);
        } else {
            await createUserLike(userId.value, targetType,targetId);
            updateLocalLikes(targetId, targetType, true);
        }
    };

    const updateLocalLikes = (targetId, targetType, isLiked) => {
        const targetListMap = {
            song: likedSongIds,
            album: likedAlbumIds,
            artist: likedArtistsIds,
            comment: likedCommentsIds,
            playlist: likedPlaylistsIds,
            video: likedVideosIds,
            user: likedUserIds
        };

        const targetList = targetListMap[targetType];
        if (isLiked) {
            if (!targetList.value.includes(targetId)) {
                targetList.value.push(targetId);
            }
        } else {
            const index = targetList.value.indexOf(targetId);
            if (index > -1) {
                targetList.value.splice(index, 1);
            }
        }
    };

    function getLikedLength(key) {
        const keyMap = {
            songs: likedSongIds,
            albums: likedAlbumIds,
            artists: likedArtistsIds,
            comments: likedCommentsIds,
            playlists: likedPlaylistsIds,
            videos: likedVideosIds,
            users: likedUserIds,
        };

        return keyMap[key] ? keyMap[key].value.length : 0;
    }

    return { likes, likedSongIds, likedAlbumIds, likedArtistsIds, likedCommentsIds, likedPlaylistsIds, likedVideosIds, likedUserIds, getLikes, createUserLike, deleteUserLike, isLiked, toggleLike ,getLikedLength};
});


