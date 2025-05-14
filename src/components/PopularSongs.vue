<script setup>
import {onMounted, ref} from 'vue'
import {apiGetAudio, apiGetLyric, apiGetSongs} from "@/api/song-api.js";
import {apiGetCover} from "@/api/album-api.js";


const songs = ref([]);

const getPopularSongs = async () => {
  debugger;
  songs.value = await apiGetSongs(0, 5, '', 'likeCount', 'desc');
  songs.value=songs.value.content;
  for(let i = 0; i < songs.value.length; i++){
    songs.value[i].album.cover =await apiGetCover(songs.value[i].album.coverUrl);
    songs.value[i].audio= await apiGetAudio(songs.value[i].audioUrl);
    songs.value[i].lyric = await apiGetLyric(songs.value[i].lyricUrl);
  }
};

onMounted(() => {
  getPopularSongs();
})

</script>

<template>
  <div class="carousel-container">
    <div class="carousel-wrapper">
      <div class="carousel-item">
        <div class="element" data-is-visible="true">
          <div class="_cellContainer_19b23ad">
            <a href="/album/434171390" class="album-link">
              <div class="cover">
                <img src="https://resources.tidal.com/images/8fee7f96/2aa4/453b/859f/9034195e1efc/320x320.jpg" alt="Pink Elephant" />
              </div>
            </a>
            <a href="/album/434171390" class="album-title">Pink Elephant</a>
            <span class="artist-name">
            <a href="/artist/17364">Arcade Fire</a>
          </span>
            <div class="release-date">2025</div>
          </div>
        </div>
      </div>
      <!-- Repeat this .carousel-item for more albums -->
      <div class="carousel-item"> <!-- Example of a second item -->
        <div class="element" data-is-visible="true">
          <div class="_cellContainer_19b23ad">
            <a href="/album/434171390" class="album-link">
              <div class="cover">
                <img src="https://resources.tidal.com/images/8fee7f96/2aa4/453b/859f/9034195e1efc/320x320.jpg" alt="Pink Elephant" />
              </div>
            </a>
            <a href="/album/434171390" class="album-title">Pink Elephant</a>
            <span class="artist-name">
            <a href="/artist/17364">Arcade Fire</a>
          </span>
            <div class="release-date">2025</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Carousel controls -->
    <button class="prev-btn">‹</button>
    <button class="next-btn">›</button>
  </div>





</template>


<style>
.carousel-container {
  position: relative;
  width: 80%;  /* 调整轮播容器的宽度 */
  margin: 0 auto;  /* 居中显示 */
  overflow: hidden;
}

.carousel-wrapper {
  display: flex;
  transition: transform 0.3s ease;
}

.carousel-item {
  min-width: 80%;  /* 每个轮播项占容器的80%宽度 */
  box-sizing: border-box;
  padding: 0 16px;
}

.element {
  width: 100%;
  margin: 0 auto;
}

.cover img {
  width: 200px;  /* 缩小图片大小 */
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.album-title {
  display: block;
  font-size: 1rem;  /* 缩小标题字体 */
  font-weight: 500;
  color: #333;
  text-decoration: none;
}

.album-title:hover {
  color: #33ffee;
}

.artist-name {
  font-size: 0.9rem;  /* 缩小艺术家名称字体 */
  color: #666;
}

.release-date {
  font-size: 0.8rem;  /* 缩小发行日期字体 */
  color: #999;
}

.prev-btn,
.next-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 1.5rem;  /* 缩小按钮字体 */
  border: none;
  padding: 8px;  /* 减小按钮内边距 */
  cursor: pointer;
  z-index: 1;
}

.prev-btn {
  left: 10px;
}

.next-btn {
  right: 10px;
}

.prev-btn:hover,
.next-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

</style>