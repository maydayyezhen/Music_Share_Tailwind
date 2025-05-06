import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import MusicDB from "@/views/MusicDB.vue";
import ArtistManage from "@/views/ArtistManage.vue";
import AlbumManage from "@/views/AlbumManage.vue";
import SongManage from "@/views/SongManage.vue";


const routes = [
    { path: '/', component: Login },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/music_db',component: MusicDB},
    { path: '/music_manage', component: ArtistManage },
    { path: '/album_manage', component: AlbumManage },
    { path: '/song_manage', component: SongManage },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;
