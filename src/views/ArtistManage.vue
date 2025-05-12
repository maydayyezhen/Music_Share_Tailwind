<script setup>
import MyTable from '../components/MyTable.vue'
import Alerts from "@/components/Alerts.vue";
import {onMounted, ref} from "vue";
import {
  apiCreateArtist, apiDeleteArtistById,
  apiGetArtistAvatarFileUrl,
  apiGetArtistById, apiGetArtists,
  apiUpdateArtist, apiUploadAvatarFile
} from "@/api/artist-api.js";
const alertsRef = ref(null)
function triggerToast(alertType, alertMessage) {
  alertsRef.value?.showToast(alertType, alertMessage)
}

const artists = ref([])
const sortBy = ref('id')        // 默认按哪个字段排序
const sortOrder = ref('asc')      // 默认排序方向

//满足歌手查询的各种需求
async function getArtists(page=0, size=5,keyword='',sortByField='id',sortOrderDirection='asc'){
  sortBy.value = sortByField
  sortOrder.value = sortOrderDirection
  const response = await apiGetArtists(page, size, keyword,sortByField,sortOrderDirection);
  artists.value = response.data;
  // 并行加载头像
  await Promise.all(artists.value.content.map(async (artist) => {
    artist.avatar = await apiGetArtistAvatarFileUrl(artist.avatarUrl);
  }))
}

// 更新数据时调用
async function handleUpdateDataAndUploadFiles({ updatedRow, files }) {
  try {
    const response = await apiUpdateArtist(updatedRow);

    if (response.status!==200) {
      triggerToast('error', '更新失败')
      return;
    }

    // 上传图片
    if (Object.keys(files).length > 0) {
      await uploadFiles(files, updatedRow.id);
    }

    // 获取更新后的数据
    const updatedArtist = (await apiGetArtistById(updatedRow.id)).data;
    // 更新图片
    updatedArtist.avatar = await apiGetArtistAvatarFileUrl(updatedArtist.avatarUrl);
    const index = artists.value.content.findIndex(artist => artist.id === updatedArtist.id);
    if (index !== -1) {
      artists.value.content[index] = updatedArtist;
    }

    triggerToast('success', '更新成功')
  } catch (error) {
    console.error(error);
    triggerToast('error', '更新过程中出现错误')
  }
}

async function handleAddDataAndUploadFiles({ newRow, files, onSuccess}) {
  try {
    const response = await apiCreateArtist(newRow);
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
    const newArtist = (await apiGetArtistById(id)).data;
    // 更新图片
    newArtist.avatar = await apiGetArtistAvatarFileUrl(newArtist.avatarUrl);
    artists.value.content.push(newArtist);
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
      if (key === 'avatar') {
        const response = await apiUploadAvatarFile(id, file);
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
    const response = await apiDeleteArtistById(id);
    if (response.status!==200) {
      triggerToast('error', '删除失败')
      return;
    }
    const index = artists.value.content.findIndex(artist => artist.id === id);
    if (index !== -1) {
      artists.value.content.splice(index, 1);
    }
    triggerToast('success', '删除成功')
  } catch (error) {
    console.error(error);
    triggerToast('error', '删除过程中出现错误')
  }
}

onMounted(getArtists);
</script>

<template>
  <alerts ref="alertsRef" />
  <my-table
      :modelValue="artists.content"
      :columns="[
  { key: 'id', label: 'ID', readOnly: true, sortable: true},

  { key: 'avatar', label: '头像', displayComponent: 'img', editComponent: 'MyImageUpload',imageClass: 'object-cover rounded-full size-12' },

  { key: 'avatarUrl', label: '头像url', hidden: true },

  { key: 'name', label: '音乐人',bold:true,sortable: true},

  { key: 'bio', label: '简介', displayComponent:'editor', editComponent: 'editor',buttonText: '简介', title: '简介'},

]"
      :pagination="artists.page"
      :sort-by="sortBy"
      :sort-order="sortOrder"
      @update="handleUpdateDataAndUploadFiles"
      @add="handleAddDataAndUploadFiles"
      @delete="handleDeleteData"
      @query-change="getArtists"
  />
</template>

<style scoped>

</style>