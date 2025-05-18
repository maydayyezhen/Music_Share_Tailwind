import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import MusicDB from "@/views/MusicDB.vue";
import ArtistManage from "@/views/ArtistManage.vue";
import AlbumManage from "@/views/AlbumManage.vue";
import SongManage from "@/views/SongManage.vue";
import SongDetail from "@/views/SongDetail.vue";
import AlbumDetail from "@/views/AlbumDetail.vue";
import ArtistDetail from "@/views/ArtistDetail.vue";
import UserLikes from "@/views/UserLikes.vue";
import UserManage from "@/views/UserManage.vue";
import PlaylistManage from "@/views/PlaylistManage.vue";

const routes = [
    { path: '/', component: Login },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/music_db',component: MusicDB},
    { path: '/music_manage', component: ArtistManage },
    { path: '/album_manage', component: AlbumManage },
    { path: '/song_manage', component: SongManage },
    { path: "/song_detail/:id", component: SongDetail},
    { path: '/album_detail/:id', component: AlbumDetail },
    { path: '/artist_detail/:id', component: ArtistDetail },
    { path: '/user_likes', component: UserLikes },
    { path: '/user_manage', component: UserManage },
    { path: '/playlist_manage', component: PlaylistManage },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;

