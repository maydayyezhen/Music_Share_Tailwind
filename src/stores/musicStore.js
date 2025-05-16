import { defineStore } from 'pinia';
import {nextTick, ref} from 'vue';
import {Song} from "@/models/song.js";

export const useMusicStore = defineStore('music', () => {
    const currentSongIndex = ref(0);
    const currentPlaylist = ref([]);
    const currentSong = ref({...Song});
    const audio = ref(null);
    const isPlaying = ref(false);

    const setCurrentPlayList = (playlist) => {

        currentPlaylist.value = [...playlist];

    }
    const setCurrentSong = (index) => {
        currentSongIndex.value = index;
        currentSong.value = currentPlaylist.value[index];
        play();
    }

    const setAudio = (audioElement) => {
        audio.value = audioElement;
    }

    const play = () => {
        if (audio.value) {
            nextTick(() => {
                audio.value.play();
                isPlaying.value = true;
            });
        }
    }
    const pause = () => {
        if (audio.value) {
            audio.value.pause();
          isPlaying.value = false;
        }
    }

    const clearPlaylist = () => {
        debugger
        pause();
        currentPlaylist.value = [];
        currentSong.value = {...Song};
    }
    const deleteSongFromPlaylist = (index) => {
        currentPlaylist.value.splice(index, 1);
        if (currentSongIndex.value >= currentPlaylist.value.length) {
            currentSongIndex.value = currentPlaylist.value.length - 1;
        }
        if (currentPlaylist.value.length === 0) {
            currentSong.value = {...Song};
        }
        else {
            currentSong.value = currentPlaylist.value[currentSongIndex.value];
        }
    }

    const nextSong = () => {
        if (currentSongIndex.value < currentPlaylist.value.length - 1) {
            currentSongIndex.value++;
            currentSong.value = currentPlaylist.value[currentSongIndex.value];
        }
        else
        {
            currentSongIndex.value = 0;
            currentSong.value = currentPlaylist.value[0];
        }
        play();
    }
    const previousSong = () => {
        if (currentSongIndex.value > 0) {
            currentSongIndex.value--;
            currentSong.value = currentPlaylist.value[currentSongIndex.value];
        }
        else
        {
            currentSongIndex.value = currentPlaylist.value.length - 1;
            currentSong.value = currentPlaylist.value[currentSongIndex.value];
        }
        play();
    }
    return {
        currentSong,
        setCurrentSong,
        currentPlaylist,
      setCurrentPlayList,
      currentSongIndex,
      nextSong,
      previousSong,
      deleteSongFromPlaylist,
      setAudio,
      audio,
      play,
      pause,
      isPlaying,
      clearPlaylist
    }
});