<script setup>
import MyTable from "@/components/MyTable.vue";
import {onMounted, ref} from "vue";
import {
  apiCreateAlbum,
  apiDeleteAlbumById,
  apiGetAlbumById,
  apiGetAlbums,
  apiGetCover,
  apiUpdateAlbum,
  apiUploadCoverFile
} from "@/api/album-api.js";
import {apiGetAllArtists, apiGetArtistAvatar} from "@/api/artist-api.js";
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
    artist.avatar = await apiGetArtistAvatar(artist.avatarUrl);
  }))
}


const albums = ref([])
const sortBy = ref('id')        // 默认按哪个字段排序
const sortOrder = ref('asc')      // 默认排序方向
//满足歌手查询的各种需求
const getAlbums = async (page=0, size=5,keyword='',sortByField='id',sortOrderDirection='asc') => {
  sortBy.value = sortByField
  sortOrder.value = sortOrderDirection
  albums.value = await apiGetAlbums(page, size, keyword, sortByField, sortOrderDirection)
  // 并行加载封面和头像
  await Promise.all(albums.value.content.map(async (album) => {
    album.cover = await apiGetCover(album.coverUrl);
    album.artist.avatar = await apiGetArtistAvatar(album.artist.avatarUrl);
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
    const updatedAlbum = await apiGetAlbumById(updatedRow.id);
    // 更新图片
    updatedAlbum.cover = await apiGetCover(updatedAlbum.coverUrl);
    updatedAlbum.artist.avatar = await apiGetArtistAvatar(updatedAlbum.artist.avatarUrl);
    const index = albums.value.content.findIndex(album => album.id === updatedAlbum.id);
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
    const response = await apiCreateAlbum(newRow);
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
    const newAlbum = await apiGetAlbumById(id);
    // 更新图片
    newAlbum.cover = await apiGetCover(newAlbum.coverUrl);
    newAlbum.artist.avatar = await apiGetArtistAvatar(newAlbum.artist.avatarUrl);
    albums.value.content.push(newAlbum);
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

onMounted(getAlbums);
onMounted(getAllArtists);
</script>

<template>
  <alerts ref="alertsRef" />
  <div class="flex mt-16 mx-3 justify-center items-center">
    <my-table
        :modelValue="albums.content"
        :columns="[
  { key: 'id', label: 'ID', readOnly: true, sortable: true },

  { key: 'cover', label: '封面', displayComponent: 'img', editComponent: 'MyImageUpload',imageClass: 'size-14 object-cover rounded-box' },

  { key: 'coverUrl', label: '封面url', hidden: true },

  { key: 'title', label: '专辑标题' ,bold:true, sortable: true},

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

  { key: 'description', label: '简介',displayComponent:'editor', editComponent: 'editor',buttonText: '简介', title: '简介'},

  { key: 'releaseDate', label: '发行日期', editComponent: 'input-date',sortable: true }
]"
        :pagination="albums.page"
        :sort-by="sortBy"
        :sort-order="sortOrder"
        @update="handleUpdateDataAndUploadFiles"
        @add="handleAddDataAndUploadFiles"
        @delete="handleDeleteData"
        @query-change="getAlbums"
    />
  </div>

</template>

<style scoped>

</style>