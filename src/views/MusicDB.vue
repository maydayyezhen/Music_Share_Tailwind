<script setup>
import SongList from "@/components/SongList.vue";
import {onMounted, ref, watch} from "vue";
import {apiGetAudio, apiGetLyric, apiGetSongs,} from "@/api/song-api.js";
import {Song} from "@/models/song.js";
import {apiGetAlbums, apiGetCover} from "@/api/album-api.js";
import CarouselDisplay from "@/components/CarouselDisplay.vue";
import AlbumCard from "@/components/AlbumCard.vue";
import SongCard from "@/components/SongCard.vue";
import {apiGetArtistAvatarFileUrl, apiGetArtists} from "@/api/artist-api.js";
import ArtistCard from "@/components/ArtistCard.vue";
const popularSongs = ref([{...Song}]);
const newSongs = ref([{...Song}]);

const getSongs = async (page, size, keyword = '', sortBy = '', sortOrder = '') => {
  const response = await apiGetSongs(page, size, keyword, sortBy, sortOrder);
  const songs = response.content;
  for(let i = 0; i < songs.length; i++){
    songs[i].album.cover =await apiGetCover(songs[i].album.coverUrl);
    songs[i].audio= await apiGetAudio(songs[i].audioUrl);
    songs[i].lyric = await apiGetLyric(songs[i].lyricUrl);
  }
  return songs;
}
const albums = ref([]);

const getPopularAlbums = async () => {
  albums.value = await apiGetAlbums(0, 16, '', 'likeCount', 'desc');
  albums.value=albums.value.content;
  for(let i = 0; i < albums.value.length; i++){
    albums.value[i].cover =await apiGetCover(albums.value[i].coverUrl);
  }
};

const artists = ref([]);
const getArtists = async () => {
  artists.value = await apiGetArtists(0, 16, '', 'likeCount', 'desc');
  artists.value=artists.value.content;
  for(let i = 0; i < artists.value.length; i++){
    artists.value[i].avatar =await apiGetArtistAvatarFileUrl(artists.value[i].avatarUrl);
  }
}

onMounted(async () => {
  const [_, popular, recent] = await Promise.all([
    getPopularAlbums(), // 假设这个没有返回值或者你不用它
    getSongs(0, 16, '', 'likeCount', 'desc'),
    getSongs(0, 4, '', 'album.releaseDate', 'desc'),
    getArtists()
  ]);

  popularSongs.value = popular;
  newSongs.value = recent;
});
</script>

<template>
  <div class="flex justify-center mt-16">
    <div class="flex flex-col justify-center w-[90%] gap-10">
      <div class="w-full">
        <CarouselDisplay
            title='热门歌曲'
            :items="popularSongs"
            :items-per-page="8"
            header-class="mx-9.5"
            id-prefix="popularSong"
        >
          <template #item="{ item }">
            <SongCard
                :song="item"
            />
          </template>
          <template #action>
            <button class="text-sm hover:underline cursor-pointer">查看全部</button>
          </template>
        </CarouselDisplay>
      </div>
      <div class="w-full">
        <CarouselDisplay
            title='热门歌手'
            :items="artists"
            :items-per-page="8"
            header-class="mx-9.5"
            id-prefix="artist"
        >
          <template #item="{ item }">
            <ArtistCard
                :artist="item"
            />
          </template>
          <template #action>
            <button class="text-sm hover:underline cursor-pointer">查看全部</button>
          </template>
        </CarouselDisplay>
      </div>
      <div class="w-full">
        <div class="mx-11">
          <div class="flex justify-between mt-5">
            <h2 class="text-2xl font-bold">最新歌曲</h2>
            <button class="text-sm hover:underline cursor-pointer">查看全部</button>
          </div>
          <SongList class="mb-8" :songs="newSongs" @reload-songs="getSongs" @page-change="getSongs" />
        </div>
      </div>

      <div class="w-full">
        <CarouselDisplay
            title='热门专辑'
            :items="albums"
            :items-per-page="8"
            header-class="mx-9.5"
            id-prefix="album"
        >
          <template #item="{ item }">
            <AlbumCard
                :album="item"
                :show-date="false"
            />
          </template>
          <template #action>
            <button class="text-sm hover:underline cursor-pointer">查看全部</button>
          </template>
        </CarouselDisplay>
      </div>

  </div>
  </div>

</template>
<style scoped>

</style>