<script setup>
import MyTable from "@/components/MyTable.vue";
import {onMounted, ref} from "vue";
import {
  apiDeleteAlbumById,
  apiGetAlbumByAlbumId,
  apiGetAllAlbums,
  apiGetCoverFileUrl,
  apiUpdateAlbum,
  apiUploadCoverFile
} from "@/api/album-api.js";
import {apiGetAllArtists, apiGetArtistAvatarFileUrl} from "@/api/artist-api.js";
import Alerts from "@/components/Alerts.vue";
const alertsRef = ref(null)
function triggerToast(alertType, alertMessage) {
  alertsRef.value?.showToast(alertType, alertMessage)
}
const artists = ref([])
const getAllArtists = async () => {
  const response = await apiGetAllArtists()
  artists.value = response.data;
  // 并行加载头像
  await Promise.all(artists.value.map(async (artist) => {
    artist.avatar = await apiGetArtistAvatarFileUrl(artist.avatarUrl);
  }))
}


const albums = ref([])

const getAllAlbums = async () => {
  const response = await apiGetAllAlbums()
  albums.value = response.data
  // 并行加载封面和头像
  await Promise.all(albums.value.map(async (album) => {
    album.cover = await apiGetCoverFileUrl(album.coverUrl);
    album.artist.avatar = await apiGetArtistAvatarFileUrl(album.artist.avatarUrl);
  }));
}

// 更新数据时调用
async function handleUpdateDataAndUploadFiles({ updatedRow, files }) {
  try {
    const response = await apiUpdateAlbum(updatedRow);

    if (response.status!==200) {
      triggerToast('error', '更新失败')
      return;
    }

    // 上传图片
    if (Object.keys(files).length > 0) {
      await uploadFiles(files, updatedRow.id);
    }

    // 获取更新后的数据
    const updatedAlbum = (await apiGetAlbumByAlbumId(updatedRow.id)).data;
    // 更新图片
    updatedAlbum.cover = await apiGetCoverFileUrl(updatedAlbum.coverUrl);
    updatedAlbum.artist.avatar = await apiGetArtistAvatarFileUrl(updatedAlbum.artist.avatarUrl);
    const index = albums.value.findIndex(album => album.id === updatedAlbum.id);
    if (index !== -1) {
      albums.value[index] = updatedAlbum;
    }

    triggerToast('success', '更新成功')
  } catch (error) {
    console.error(error);
    triggerToast('error', '更新过程中出现错误')
  }
}

async function handleAddDataAndUploadFiles({ newRow, files, onSuccess}) {
  try {
    const response = await apiUpdateAlbum(newRow);
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
    const newAlbum = (await apiGetAlbumByAlbumId(id)).data;
    // 更新图片
    newAlbum.cover = await apiGetCoverFileUrl(newAlbum.coverUrl);
    newAlbum.artist.avatar = await apiGetArtistAvatarFileUrl(newAlbum.artist.avatarUrl);
    albums.value.push(newAlbum);
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
      if (key === 'cover') {
        const response = await apiUploadCoverFile(id, file);
        if (response.status!==200) {
          triggerToast('error', '上传封面图片出错');
        }
      }
      // 可扩展其他图片字段
    } catch (error) {
      console.error(error);
      triggerToast('error', `上传${key}文件出错`)
    }
  }
}

async function handleDeleteData(id) {
  try {
    const response = await apiDeleteAlbumById(id);
    if (response.status!==200) {
      triggerToast('error', '删除失败')
      return;
    }
    const index = albums.value.findIndex(album => album.id === id);
    if (index !== -1) {
      albums.value.splice(index, 1);
    }
    triggerToast('success', '删除成功')
  } catch (error) {
    console.error(error);
    triggerToast('error', '删除过程中出现错误')
  }
}

onMounted(getAllAlbums);
onMounted(getAllArtists);
</script>

<template>
  <alerts ref="alertsRef" />
  <my-table
    :modelValue="albums"
    :columns="[
  { key: 'id', label: 'ID', readOnly: true },

  { key: 'cover', label: '封面', displayComponent: 'img', editComponent: 'MyImageUpload',imageClass: 'size-14 object-cover rounded-box' },

  { key: 'coverUrl', label: '封面url', hidden: true },

  { key: 'title', label: '专辑标题' ,bold:true},

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
    }
  },

  { key: 'description', label: '简介',displayComponent:'LongTextEditor', editComponent: 'LongTextEditor',buttonText: '简介', title: '简介',},

  { key: 'releaseDate', label: '发行日期', editComponent: 'input-date' }
]"
    @update="handleUpdateDataAndUploadFiles"
    @add="handleAddDataAndUploadFiles"
    @delete="handleDeleteData"
  />
</template>

<style scoped>

</style>