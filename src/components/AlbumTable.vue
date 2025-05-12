<script setup>
import {onMounted, ref} from 'vue'
import isEqual from 'lodash/isEqual'
import {
  apiDeleteAlbumById,
  apiGetAllAlbums,
  apiGetCover,
  apiUpdateAlbum,
  apiUploadCoverFile
} from '@/api/album-api.js'
import Alerts from '@/components/Alerts.vue'
import {apiGetAllArtists, apiGetArtistAvatarFileUrl} from "@/api/artist-api.js";
import ItemSelector from "@/components/MySelector.vue";

const albums = ref([])
const artists = ref([])
const originalAlbums = ref([])
const albumCoverUrls = ref({})
const artistAvatarUrls = ref([])

const getAllAlbums = async () => {
  if (getAllAlbumsFlag.value) {
    getAllAlbumsFlag.value = false
    return
  }
  const response = await apiGetAllAlbums()
  albums.value = response.data
  originalAlbums.value = JSON.parse(JSON.stringify(response.data))
  for (const album of albums.value) {
    albumCoverUrls.value[album.id] = await apiGetCover(album.coverUrl);
    artistAvatarUrls.value[album.id] = await apiGetArtistAvatarFileUrl(album.artist.avatarUrl)
  }
}

const getAllArtistsWithAvatar = async () => {
  const response = await apiGetAllArtists()
  artists.value = response.data
  for (const artist of artists.value) {
    artist.avatar = await apiGetArtistAvatarFileUrl(artist.avatarUrl)
  }
}

onMounted(() => {
  getAllAlbums()
  getAllArtistsWithAvatar()
})

const editingAlbum = ref(null)
const editingTitle = ref(false)
const editingDesc = ref(false)
const editingCover = ref(false)
const editingArtist = ref(false)
const title = ref('')
const desc = ref('')
const coverUrl = ref(null)
const artistId = ref(null)

const editAlbum = (type) => {
  if (type === 'title') {
    title.value = editingAlbum.value.title
    editingTitle.value = true
  }
  if (type === 'desc') {
    desc.value = editingAlbum.value.description
    editingDesc.value = true
  }
  if (type === 'cover') {
    coverUrl.value = editingAlbum.value.coverUrl
    editingCover.value = true
  }
  if (type === 'artist') {
    artistId.value= editingAlbum.value.artistId
    editingArtist.value=true;
  }
}

const finishEdit = () => {
  if (editingTitle.value) {
    albums.value.find(album => album.id === editingAlbum.value.id).title = title.value
    editingTitle.value = false
  }
  if (editingDesc.value) {
    albums.value.find(album => album.id === editingAlbum.value.id).description = desc.value
    editingDesc.value = false
  }
}

const endEdit = () => {
  editingAlbum.value = null
  title.value = ''
  desc.value = ''
  coverUrl.value = null
  editingTitle.value = false
  editingDesc.value = false
}

const updateEdit = async () => {
  if (!changed() && !coverUrl.value) {
    endEdit()
    triggerToast('info', '没有更改')
    return
  }
  const currentAlbum = albums.value.find(album => album.id === editingAlbum.value.id)
  if (!currentAlbum.title?.trim() || (!currentAlbum.coverUrl && !selectedCoverFile.value) || !currentAlbum.description?.trim()) {
    triggerToast('error', '请填写完整信息（专辑名、封面和简介）')
    return
  }
  try {
    const response = await apiUpdateAlbum(currentAlbum)
    if (selectedCoverFile.value) {
      const updatedAlbum = response.data
      await apiUploadCoverFile(updatedAlbum.id, selectedCoverFile.value)
    }
    if (response.status === 200) {
      triggerToast('success', '保存成功！')
      endEdit()
      await getAllAlbums()
    } else triggerToast('error', response.data.message)
  } catch (e) {
    triggerToast('error', e.message)
  }
}

const changed = () => {
  if (!editingAlbum.value) return false
  const originalAlbum = originalAlbums.value.find(album => album.id === editingAlbum.value.id)
  const currentAlbum = albums.value.find(album => album.id === editingAlbum.value.id)
  if (coverUrl.value) return !isEqual(currentAlbum, originalAlbum) || coverUrl.value !== currentAlbum.coverUrl
  return !isEqual(currentAlbum, originalAlbum)
}

const newEditAlbum = ref(null)
const handleClickEdit = (album) => {
  if (editingAlbum.value) finishEdit()
  if (editingAlbum.value && editingAlbum.value.id !== album.id && changed()) {
    save_modal.showModal()
    newEditAlbum.value = album
  } else {
    editingArtist.value=false;
    coverUrl.value = null
    selectedCoverFile.value = null
    selectedArtist.value = null;
    editingAlbum.value = album
  }
}

const deleteId = ref(null)

const deleteAlbum = async (id) => {
  try {
    const response = await apiDeleteAlbumById(id)
    if (response.status === 200) {
      await getAllAlbums()
      editingAlbum.value = null
      triggerToast('info', '删除成功')
    } else triggerToast('error', response.data.message)
  } catch (e) {
    triggerToast('error', e.message)
  }
}

const alertsRef = ref(null)
function triggerToast(alertType, alertMessage) {
  alertsRef.value?.showToast(alertType, alertMessage)
}

const newAlbum = ref(null)
const getAllAlbumsFlag = ref(false)
const addRow = () => {
  newAlbum.value = {
    title: '',
    description: '',
    coverUrl: ''
  }
  if (!albums.value[0].id) {
    triggerToast('warning', '请先保存当前新建的专辑！')
    return
  }
  albums.value.unshift(newAlbum.value)
  newEditAlbum.value = newAlbum.value
  if (editingAlbum.value && changed()) {
    getAllAlbumsFlag.value = true
    save_modal.showModal()
  } else {
    editingAlbum.value = newAlbum.value
    editingTitle.value = true
  }
}

const selectedCoverFile = ref(null)
const selectCover = (event) => {
  editAlbum('cover')
  const file = event.target.files[0]
  if (file) {
    selectedCoverFile.value = file
    coverUrl.value = URL.createObjectURL(file)
  }
  editingCover.value = false
}


const selectedArtist = ref(null)

const handleClickEditArtist = (album) => {
  editingAlbum.value.id === album.id ? editAlbum('artist') : null;
  selectedArtist.value=artists.value.find(artist => artist.id === album.artist.id);
}
</script>

<template>
  <alerts ref="alertsRef" />
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
      <tr>
        <th></th>
        <th>专辑</th>
        <th>歌手</th>
        <th>简介</th>
        <th>风格</th>
        <th class="hover:underline cursor-pointer text-primary" @click="addRow">新建专辑</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="album in albums" :key="album.id" :class="{ 'bg-base-300': editingAlbum && editingAlbum.id === album.id }">
        <th></th>
        <td>
          <div class="flex items-center gap-3">
            <div class="avatar">
              <div class="h-12 w-12 relative group">
                <label v-if="editingAlbum && editingAlbum.id === album.id" class="cursor-pointer w-full h-full">
                  <input type="file" accept="image/*" class="hidden" @change="selectCover($event)" />
                  <img :src="coverUrl || albumCoverUrls[album.id] || 'https://api.dicebear.com/9.x/initials/svg?seed=Album'" alt="点击上传封面" class="w-full h-full rounded-box" />
                  <div class="absolute inset-0 flex justify-center items-center text-white opacity-0 group-hover:opacity-60 transition-opacity duration-300">
                    <div class="absolute inset-0 bg-black bg-opacity-25 transition-opacity duration-300"></div>
                    <span class="z-10">点击上传封面</span>
                  </div>
                </label>
                <img v-else :src="albumCoverUrls[album.id] || 'https://api.dicebear.com/9.x/initials/svg?seed=Album'" alt="Album Cover" class="w-full h-full rounded-box" />
              </div>
            </div>
            <div>
              <div v-if="editingAlbum && editingAlbum.id === album.id && editingTitle">
                <input v-model="title" class="input input-sm input-bordered" @blur="finishEdit" @keyup.enter="finishEdit" />
              </div>
              <div v-else @click="editingAlbum.id === album.id ? editAlbum('title') : null" :class="{ 'hover:underline cursor-pointer': editingAlbum && editingAlbum.id === album.id }" class="font-bold">
                <div v-if="editingAlbum && editingAlbum.id === album.id">{{ album.title.trim() === '' ? '点击编辑' : album.title }}</div>
                <div v-else>{{ album.title }}</div>
              </div>
              <div class="text-sm opacity-50">China</div>
            </div>
          </div>
        </td>
        <!-- 歌手部分开始 -->
        <td>
          <div v-if="editingAlbum?.id === album.id">
            <ItemSelector
                v-if="editingArtist"
                v-model="selectedArtist"
                :items="artists"
                :getLabel="item => item.name"
                :getImage="item => item.avatar"
            />
            <div
                v-else
                @click="handleClickEditArtist(album)"
                class="font-bold hover:underline cursor-pointer"
            >
              <div class="flex items-center gap-2">
                <img
                    :src="artistAvatarUrls[album.id]"
                    alt="Artist Avatar"
                    class="w-10 h-10 rounded object-cover"
                />
                <span>{{ album.artist.name }}</span>
              </div>
            </div>
          </div>

          <div v-else class="flex items-center gap-2">
            <img
                :src="artistAvatarUrls[album.id]"
                alt="Artist Avatar"
                class="w-10 h-10 rounded object-cover"
            />
            <span>{{ album.artist.name }}</span>
          </div>
        </td>
        <!-- 歌手部分结束 -->

        <td class="max-w-[300px]">
          <div v-if="editingAlbum && editingAlbum.id === album.id && editingDesc">
            <textarea v-model="desc" class="textarea textarea-bordered w-full resize-none" rows="3" @blur="finishEdit" @keyup.enter="finishEdit"></textarea>
          </div>
          <div v-else @click="editingAlbum.id === album.id ? editAlbum('desc') : null" :class="{ 'hover:underline cursor-pointer': editingAlbum && editingAlbum.id === album.id }" class="line-clamp-3">
            <div v-if="editingAlbum && editingAlbum.id === album.id">{{ album.description.trim() === '' ? '点击编辑' : album.description }}</div>
            <div v-else>{{ album.description }}</div>
          </div>
          <br />
          <span class="badge badge-ghost badge-sm">标签</span>
        </td>
        <td>专辑音乐风格</td>
        <th>
          <button v-if="!editingAlbum || editingAlbum.id !== album.id" class="btn btn-ghost btn-xs" @click="handleClickEdit(album)">编辑</button>
          <button v-if="editingAlbum && editingAlbum.id === album.id" class="btn btn-ghost btn-xs" @click="updateEdit">保存</button>
          <button v-if="editingAlbum && editingAlbum.id === album.id" class="btn btn-ghost btn-xs" @click="finishEdit(); albums = JSON.parse(JSON.stringify(originalAlbums)); editingAlbum = null; coverUrl = null; selectedCoverFile.value = null">取消</button>
          <label v-if="editingAlbum && editingAlbum.id === album.id && album.id" for="delete_modal" class="btn btn-ghost btn-xs" @click="deleteId = album.id">删除</label>
        </th>
      </tr>
      </tbody>
    </table>
  </div>
  <dialog id="save_modal" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
      <h3 class="text-lg font-bold">保存更改？</h3>
      <p class="py-4">您有未保存的更改，是否保存它们？</p>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn" @click="() => updateEdit().then(() => { finishEdit(); editingAlbum = newEditAlbum; coverUrl = null })">保存</button>
          <button class="btn" @click="finishEdit(); albums = originalAlbums; editingAlbum = newEditAlbum; coverUrl = null">丢弃</button>
        </form>
      </div>
    </div>
  </dialog>
  <input type="checkbox" id="delete_modal" class="modal-toggle" />
  <div class="modal" role="dialog">
    <div class="modal-box">
      <h3 class="text-lg font-bold">确认删除</h3>
      <p class="py-4">你确定要删除这个专辑吗？此操作无法撤销。</p>
      <div class="modal-action">
        <label for="delete_modal" class="btn" @click="deleteAlbum(deleteId)">确认</label>
        <label for="delete_modal" class="btn">取消</label>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

