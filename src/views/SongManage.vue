<script setup>
import MyTable from "@/components/MyTable.vue";
import {onMounted, ref} from "vue";
import {apiGetAlbums, apiGetAllAlbums, apiGetCover,} from "@/api/album-api.js";
import {apiGetAllArtists, apiGetArtistAvatarFileUrl} from "@/api/artist-api.js";
import Alerts from "@/components/Alerts.vue";
import {
  apiCreateSong,
  apiDeleteSongById,
  apiGetAllSongs,
  apiGetAudio,
  apiGetSongById, apiGetSongs,
  apiUpdateSong,
  apiUploadAudioFile,
  apiUploadLrcFile
} from "@/api/song-api.js";

const alertsRef = ref(null)
function triggerToast(alertType, alertMessage) {
  alertsRef.value?.showToast(alertType, alertMessage)
}
const artists = ref([])
const getAllArtists = async () => {
  const response = await apiGetAllArtists()
  artists.value = response.data;
  await Promise.all(artists.value.map(async (artist) => {
    artist.avatar = await apiGetArtistAvatarFileUrl(artist.avatarUrl);
  }))
}
const albums = ref([])
const getAllAlbums = async () => {
  const response = await apiGetAllAlbums()
  albums.value = response.data
  await Promise.all(albums.value.map(async (album) => {
    album.cover = await apiGetCover(album.coverUrl);
  }));
}

const songs = ref([])
const sortBy = ref('id')        // 默认按哪个字段排序
const sortOrder = ref('asc')      // 默认排序方向
const getSongs = async (page=0, size=5,keyword='',sortByField='id',sortOrderDirection='asc') => {
  sortBy.value = sortByField
  sortOrder.value = sortOrderDirection
  const response = await apiGetSongs(page, size, keyword,sortByField,sortOrderDirection);
  songs.value = response.data;
  await Promise.all(songs.value.content.map(async (song) => {
    song.album.cover = await apiGetCover(song.album.coverUrl);
    song.artist.avatar = await apiGetArtistAvatarFileUrl(song.artist.avatarUrl);
    song.audio = await apiGetAudio(song.audioUrl);
  }));
}


function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(URL.createObjectURL(file)); // 创建音频对象
    audio.onloadedmetadata = () => {
      resolve(audio.duration); // 获取时长
    };
    audio.onerror = (error) => {
      reject(error); // 错误处理
    };
  });
}

// 更新数据时调用
async function handleUpdateDataAndUploadFiles({ updatedRow, files }) {
  debugger
  try {
    const audioFile = files['audio']; // 假设文件对象中的 audio 对应上传的音频文件
    if (audioFile) {
      updatedRow.duration = await getAudioDuration(audioFile); // 设置音频时长
    }
    const response = await apiUpdateSong(updatedRow);
    const lrcBlob = new Blob([updatedRow.lyrics], { type: 'text/plain' });
    files['lrc'] = new File(
        [lrcBlob],
        `${updatedRow.title}-${updatedRow.artist.name}.lrc`,
        {type: 'text/plain'}
    );
    if (response.status!==200) {
      triggerToast('error', '更新失败')
      return;
    }

    if (Object.keys(files).length > 0) {
      await uploadFiles(files, updatedRow.id);
    }

    // 获取更新后的数据
    const updatedSong = (await apiGetSongById(updatedRow.id)).data;
    updatedSong.album.cover = await apiGetCover(updatedSong.album.coverUrl);
    updatedSong.artist.avatar = await apiGetArtistAvatarFileUrl(updatedSong.artist.avatarUrl);
    updatedSong.audio = await apiGetAudio(updatedSong.audioUrl);
    const index = songs.value.content.findIndex(song => song.id === updatedSong.id);
    if (index !== -1) {
      songs.value.content[index] = updatedSong;
    }

    triggerToast('success', '更新成功')
  } catch (error) {
    console.error(error);
    triggerToast('error', '更新过程中出现错误')
  }
}

async function handleAddDataAndUploadFiles({ newRow, files, onSuccess}) {
  try {
    newRow.audioUrl='';
    // 获取音频时长并赋值
    const audioFile = files['audio']; // 假设文件对象中的 audio 对应上传的音频文件
    if (audioFile) {
      newRow.duration = await getAudioDuration(audioFile); // 设置音频时长
    }
    const response = await apiCreateSong(newRow);
    const lrcBlob = new Blob([newRow.lyrics], { type: 'text/plain' });
    files['lrc'] = new File(
        [lrcBlob],
        `${newRow.title}-${newRow.artist.name}.lrc`,
        {type: 'text/plain'}
    );
    const id = response.data.id;
    if (response.status!==200) {
      triggerToast('error', '新增失败')
      return;
    }

    // 上传图片
    if (Object.keys(files).length > 0) {
      await uploadFiles(files, id);
    }

    // 获取更新后的数据
    const newSong = (await apiGetSongById(id)).data;
    newSong.album.cover = await apiGetCover(newSong.album.coverUrl);
    newSong.artist.avatar = await apiGetArtistAvatarFileUrl(newSong.artist.avatarUrl);
    newSong.audio = await apiGetAudio(newSong.audioUrl);
    songs.value.content.push(newSong);
    triggerToast('success', '更新成功')
    onSuccess();
  } catch (error) {
    console.error(error);
    triggerToast('error', '更新过程中出现错误')
  }
}


async function uploadFiles(files, id) {
  for (const [key, file] of Object.entries(files)) {
    try {
      if (key === 'audio') {
        const response = await apiUploadAudioFile(id, file);
        if (response.status!==200) {
          triggerToast('error', '上传音频文件出错');
        }
      }
      else if (key === 'lrc') {
        const response = await apiUploadLrcFile(id, file);
        if (response.status!==200) {
          triggerToast('error', '上传歌词文件出错');
        }
      }
    } catch (error) {
      console.error(error);
      triggerToast('error', `上传${key}文件出错`)
    }
  }
}

async function handleDeleteData(id) {
  try {
    const response = await apiDeleteSongById(id);
    if (response.status!==200) {
      triggerToast('error', '删除失败')
      return;
    }
    const index = songs.value.findIndex(song => song.id === id);
    if (index !== -1) {
      songs.value.splice(index, 1);
    }
    triggerToast('success', '删除成功')
  } catch (error) {
    console.error(error);
    triggerToast('error', '删除过程中出现错误')
  }
}

onMounted(getSongs)
onMounted(getAllAlbums);
onMounted(getAllArtists);
</script>

<template>
  <alerts ref="alertsRef" />
  <my-table
      :modelValue="songs.content"
      :columns="[
  { key: 'id', label: 'ID', readOnly: true ,sortable: true},

  { key: 'title', label: '歌曲名',bold: true, sortable: true },

   {
    key: 'artist',
    label: '音乐人',
    displayComponent: [
      { key: 'avatar', component: 'img'},
      { key: 'name' }
    ],
    editComponent: 'MySelector',
    props: {
      items: artists,
      getLabel: (item) => item.name,
      getImage: (item) => item.avatar,
      imageClass: 'object-cover rounded-full size-10'
    },
    sortable: true
  },

  {
    key: 'album',
    label: '专辑',
    displayComponent: [
      { key: 'cover', component: 'img' },
      { key: 'title' }
    ],
    editComponent: 'MySelector',
    props: {
      items: albums,
      getLabel: (item) => item.title,
      getImage: (item) => item.cover,
      imageClass: 'size-10 object-cover rounded-box'
    },
    sortable: true
  },
  {key: 'trackNum',label: 'Track #'},
  { key: 'duration', label: '时长',readOnly: true,sortable: true},
  { key: 'audio', label: '音频',  displayComponent: 'MiniAudioPlayer',editComponent: 'AudioUpload' },
  { key: 'audioUrl', hidden: true},
  { key: 'lyricUrl', hidden: true},
  { key: 'lyrics', label: '歌词', displayComponent: 'textarea', editComponent: 'textarea',buttonText: '歌词', title: '歌词'}]"
      :pagination="songs.page"
      :sort-by="sortBy"
      :sort-order="sortOrder"
      @update="handleUpdateDataAndUploadFiles"
      @add="handleAddDataAndUploadFiles"
      @delete="handleDeleteData"
      @query-change="getSongs"
  />
</template>

<style scoped>

</style>