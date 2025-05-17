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
import UserManage from "@/views/UserManage.vue";
import ProfileCenter from "@/views/ProfileCenter.vue";
import Account from "@/views/Account.vue";


const routes = [
    { path: '/', component: Login },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/music_db',component: MusicDB},
    { path: '/music_manage', component: ArtistManage },
    { path: '/album_manage', component: AlbumManage },
    { path: '/song_manage', component: SongManage },
    { path: '/user_manage', component: UserManage},
    { path: "/song_detail/:id", component: SongDetail},
    { path: '/album_detail/:id', component: AlbumDetail },
    { path: '/artist_detail/:id', component: ArtistDetail },
    { path: '/profile_center',component: ProfileCenter},
    { path: '/account', component: Account },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;
