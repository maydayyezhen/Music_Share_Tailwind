<script setup>
import {onMounted, ref, watch} from 'vue'
import{Artist} from "@/models/artist.js";
import {apiGetArtistAvatarFileUrl, apiGetArtistById} from "@/api/artist-api.js";
import {useRoute} from "vue-router";
import {apiGetAlbumsByArtistId} from "@/api/album-api.js";
import {apiGetSongsByArtistId} from "@/api/song-api.js";
import SongList from "@/components/SongList.vue";
import {useUserLikeStore} from "@/stores/userLikeStore.js";
import { CheckIcon, PlusIcon, EllipsisHorizontalIcon } from '@heroicons/vue/24/solid'
import {
  StarIcon,
  MusicalNoteIcon,
  RectangleStackIcon,
  PlayCircleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'
import CarouselDisplay from "@/components/CarouselDisplay.vue";
import AlbumCard from "@/components/AlbumCard.vue";
const route = useRoute()
const artist = ref({...Artist})

const getArtistById = async (artistId) => {
  isPageReady.value = false;
  // 第一步：并发获取 artist 基本信息、专辑、歌曲
  const [artistResponse, albums, songs] = await Promise.all([
    apiGetArtistById(artistId),
    apiGetAlbumsByArtistId(artistId),
    apiGetSongsByArtistId(artistId)
  ]);

  // 绑定 artist 对象
  artist.value = artistResponse;
  artist.value.songs = songs;
  popularSongs.value = [...artist.value.songs]
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 5);
  artist.value.albums = albums;

  // 第二步：并发获取 avatar、专辑封面、歌曲音频
  const avatarPromise = apiGetArtistAvatarFileUrl(artist.value.avatarUrl);

  const albumCoverPromises = artist.value.albums.map(album =>
      apiGetArtistAvatarFileUrl(album.coverUrl)
  );

  const songAudioPromises = artist.value.songs.map(song =>
      apiGetArtistAvatarFileUrl(song.audioUrl)
  );

  const [avatar, albumCovers, songAudios] = await Promise.all([
    avatarPromise,
    Promise.all(albumCoverPromises),
    Promise.all(songAudioPromises)
  ]);

  // 设置 artist 头像
  artist.value.avatar = avatar;

  // 设置每张专辑的封面
  artist.value.albums.forEach((album, index) => {
    album.cover = albumCovers[index];
  });

  // 设置每首歌曲的音频地址
  artist.value.songs.forEach((song, index) => {
    song.audio = songAudios[index];
  });

  // 第三步：为每首歌补上专辑封面引用（避免冗余加载）
  for (let song of artist.value.songs) {
    const matchedAlbum = artist.value.albums.find(album => album.id === song.album.id);
    if (matchedAlbum) {
      song.album.cover = matchedAlbum.cover;
    }
  }
  isPageReady.value = true;
};


const popularSongs = ref()

const isPageReady = ref(false)
onMounted(() => {
  getArtistById(route.params.id)
})
watch(() => route.params.id, () => {
  getArtistById(route.params.id)
});

const tabs = [
  { key: 'featured', label: '精选', icon: StarIcon },
  { key: 'songs', label: '歌曲', icon: MusicalNoteIcon },
  { key: 'albums', label: '专辑', icon: RectangleStackIcon },
  { key: 'videos', label: '视频', icon: PlayCircleIcon },
  { key: 'detail', label: '详情', icon: InformationCircleIcon },
];
const activeTab = ref('featured');
const changeTab = (key) => {
  activeTab.value = key;
}


</script>

<template>
  <div v-if="isPageReady">
    <div class="relative w-full h-[30rem] overflow-hidden">
      <div class="absolute inset-0 flex gap-4 bg-secondary">
        <!-- 三图横向并排：左模糊 + 中清晰 + 右模糊 -->
        <div class="absolute inset-0 flex w-full h-full">
          <!-- 左模糊 -->
          <div
              class="w-1/3 h-full bg-cover bg-center brightness-50"
              :style="{
    backgroundImage: `url(${artist.avatar})`,
    filter: 'blur(1.1px) brightness(50%)',
    transform: 'scale(1.1)'
  }"
          />


          <!-- 中间清晰 -->
          <div
              class="w-1/3 h-full bg-cover bg-center z-10"
              :style="{ backgroundImage: `url(${artist.avatar})` }"
          ></div>

          <!-- 右模糊 -->
          <div
              class="w-1/3 h-full bg-cover bg-center brightness-50"
              :style="{
    backgroundImage: `url(${artist.avatar})`,
    filter: 'blur(1.1px) brightness(50%)',
    transform: 'scale(1.1)'
  }"
          />

        </div>

        <!-- 遮罩 -->
        <div class="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>

        <!-- 内容 -->
        <div class="relative z-15 flex flex-col justify-end w-full mx-36 h-full py-12 text-white">
          <div class="flex flex-col gap-3">
            <h1 class="text-[2.75rem] font-bold mb-6" :title="artist.name">{{ artist.name }}</h1>
            <!-- 按钮组 -->
            <div class="flex items-center gap-4">
              <!-- 关注按钮 -->
              <button
                  class="w-35 h-11 px-5 py-2 bg-white text-black text-sm font-bold rounded-2xl hover:bg-gray-200 transition"
                  @click="useUserLikeStore().toggleLike(artist.id, 'artist')"
              >
        <span v-if="!useUserLikeStore().isLiked(artist.id, 'artist')" class="flex items-center justify-center">
          <PlusIcon class="inline-block w-8 h-6 mr-1" /> 关注
        </span>
                <span v-else class="font-bold flex items-center justify-center">
          <CheckIcon class="inline-block w-8 h-6 mr-1" /> 已关注
        </span>
              </button>

              <!-- 更多按钮 -->
              <button
                  class="w-35 h-11 rounded-2xl flex items-center text-sm font-bold justify-center transition bg-[#2a2a2a] hover:bg-[#1f1f1f]"
              >
        <span class="font-bold flex items-center justify-center">
          <EllipsisHorizontalIcon class="w-8 h-6 text-white mr-1" /> 更多
        </span>
              </button>

              <!-- Tab 图标按钮区域 -->
              <div class="flex gap-6 ml-auto">
                <div v-for="tab in tabs" :key="tab.key" class="flex flex-col items-center">
                  <!-- 按钮 -->
                  <button
                      @click="changeTab(tab.key)"
                      class="w-10 h-10 rounded-full transition flex items-center justify-center cursor-pointer"
                      :class="{
          'bg-white text-black': activeTab === tab.key,
          'bg-white/20 text-white': activeTab !== tab.key
        }"
                      :title="tab.label"
                  >
                    <component :is="tab.icon" class="w-5 h-5" />
                  </button>
                  <!-- 小字提示 -->
                  <span class="text-xs mt-1">{{ tab.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    <div v-if="activeTab === 'songs'" class="mt-10">
      <song-list :songs="artist.songs" class="px-25"></song-list>
    </div>
    <div v-else-if="activeTab === 'featured'" class="flex flex-col gap-8 mt-10">
      <div class="w-full px-25">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold font-sans ml-4">热门歌曲</h2>
          <button  class="text-sm font-bold font-sans hover:underline cursor-pointer mr-6" @click="changeTab('songs')">查看全部</button>
        </div>
        <song-list :songs="popularSongs"></song-list>
      </div>
      <div class="px-25">
        <CarouselDisplay
            title='专辑'
            :items="artist.albums"
            :items-per-page="8"
            header-class="text-xl font-bold mb-4 ml-4"
            id-prefix="album"
        >
          <template #item="{ item }">
            <AlbumCard
                :album="item"
                :show-date="false"
            />
          </template>
          <template #action>
            <button class="text-sm hover:underline cursor-pointer mr-6" @click="changeTab('albums')">查看全部</button>
          </template>
        </CarouselDisplay>
      </div>
    </div>
    <div v-else-if="activeTab === 'albums'" class="flex justify-center px-4 mt-10">
      <div class="grid grid-cols-8 gap-6">
        <div v-for="album in artist.albums" :key="album.id" class="w-40">
          <AlbumCard :album="album" :show-artist="false" />
        </div>
      </div>
    </div>
    <div v-else-if="activeTab === 'video'">
    </div>
    <div v-else-if="activeTab === 'detail'" class="relative overflow-hidden">
      <!-- 背景层：极度模糊 + 压暗晕影 -->
      <div
          class="absolute inset-0 z-[-2] bg-cover bg-center"
          :style="{
      backgroundImage: `url(${artist.avatar})`,
      filter: 'blur(80px) brightness(30%)',
      transform: 'scale(1.2)',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backgroundBlendMode: 'overlay'
    }"
      ></div>

      <!-- 主要内容区域 -->
      <div class="text-base-content bg-base-200 max-w-4xl mx-auto p-6 backdrop-blur-md backdrop-filter rounded-lg shadow-lg relative z-10 mt-10">
        <div class="leading-relaxed text-lg mb-6 whitespace-pre-line font-serif">
          <div v-html="artist.bio"></div>
        </div>
        <hr class="border-t-2 border-gray-300 mb-6" />
        <div class="text-sm text-gray-600">
          <p>如有错误欢迎联系修改。</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class=" w-full h-full inset-0 flex justify-center items-center">
    <span class="loading loading-spinner loading-lg w-10 h-10"></span>
  </div>











</template>

<style scoped>

</style>