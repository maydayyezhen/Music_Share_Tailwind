<script setup>
import {onMounted, ref} from 'vue'
import isEqual from 'lodash/isEqual'
import {apiDeleteArtistById, apiGetAllArtists, apiUpdateArtist,apiUploadAvatarFile} from "@/api/artist-api.js";
import {apiGetCoverFileUrl} from "@/api/album-api.js";
import Alerts from "@/components/Alerts.vue";

const artists = ref([]);           // 当前正在编辑或展示的艺术家数据
const originalArtists = ref([]);   // 原始数据的备份，用于还原或对比
const artistAvatarUrls = ref({});

const getAllArtists = async () => {
  if(getAllArtistsFlag.value) {getAllArtistsFlag.value = false; return}
  const response = await apiGetAllArtists();
  artists.value = response.data;
  originalArtists.value = JSON.parse(JSON.stringify(response.data));
  for (const artist of artists.value) {
    artistAvatarUrls.value[artist.id] = await apiGetCoverFileUrl(artist.avatarUrl);
  }
}
onMounted(() => {
    getAllArtists();
  }
);
const editingArtist = ref(null);
const editingName = ref(false);
const editingBio = ref(false);
const editingAvatar = ref(false);
const name = ref('');
const bio = ref('');
const avatarUrl = ref(null);

const editArtist = (type) => {
  if(type === 'name'){
    name.value= editingArtist.value.name;
    editingName.value = true;
  }
  if(type === 'bio'){
    bio.value= editingArtist.value.bio;
    editingBio.value = true;
  }
  if(type === 'avatar'){
    avatarUrl.value= editingArtist.value.avatarUrl;
    editingAvatar.value = true;
  }
}
const finishEdit = () => {
  if (editingName.value) {
    artists.value.find(artist => artist.id === editingArtist.value.id).name = name.value;
    editingName.value = false;
  }
  if (editingBio.value) {
    artists.value.find(artist => artist.id === editingArtist.value.id).bio = bio.value;
    editingBio.value = false;
  }
};

const endEdit = () => {
  editingArtist.value = null;
  name.value='';
  bio.value='';
  avatarUrl.value=null;
  editingName.value = false;
  editingBio.value = false;
}

const updateEdit = async () => {
  if(!changed() && !avatarUrl.value){ endEdit(); triggerToast('info','没有更改'); return}
  const currentArtist = artists.value.find(artist => artist.id === editingArtist.value.id);
  if (
      !currentArtist.name?.trim() ||
      (!currentArtist.avatarUrl && !selectedAvatarFile.value) ||
      !currentArtist.bio?.trim()
  ) {
    triggerToast('error', '请填写完整信息（姓名、头像和简介）');
    return;
  }


  try{
    const response = await apiUpdateArtist(currentArtist);
    if(selectedAvatarFile.value)
    {
      const updatedArtist = response.data;
      await apiUploadAvatarFile(updatedArtist.id, selectedAvatarFile.value)
    }
    if (response.status === 200) {
      triggerToast('success','保存成功！');
      endEdit();
      await getAllArtists();
    }
    else
      triggerToast('error', response.data.message);
  }catch (e){
    triggerToast('error', e.message);
  }
}

const changed = () => {
  if (!editingArtist.value) return false;
  const originalArtist = originalArtists.value.find(artist => artist.id === editingArtist.value.id);
  const currentArtist = artists.value.find(artist => artist.id === editingArtist.value.id);
  if(avatarUrl.value)
    return !isEqual(currentArtist, originalArtist) || avatarUrl.value !== currentArtist.avatarUrl;
  return !isEqual(currentArtist, originalArtist);
}

const newEditArtist = ref(null);
const handleClickEdit = (artist) => {
  if(editingArtist.value) finishEdit();
  if (editingArtist.value && editingArtist.value.id !== artist.id && changed()) {
    save_modal.showModal();
    newEditArtist.value = artist;
  }
  else
  {
    avatarUrl.value=null;
    selectedAvatarFile.value=null;
    editingArtist.value = artist;
  }

}

const deleteId = ref(null);

const deleteArtist = async (id) => {
  try{
    const response = await apiDeleteArtistById(id);
    if (response.status === 200) {
      await getAllArtists();
      editingArtist.value = null;
      triggerToast('info', '删除成功');
    }
    else
      triggerToast('error', response.data.message);
  }catch (e){
    triggerToast('error', e.message);
  }
}

const alertsRef = ref(null);
function triggerToast(alertType, alertMessage) {
  alertsRef.value?.showToast(alertType, alertMessage)
}
const newArtist = ref(null);

const getAllArtistsFlag = ref(false);
const addRow = () => {
  newArtist.value = {
    name: '',
    bio: '',
    avatarUrl: '',
  };
  if(!artists.value[0].id)
  {
    triggerToast('warning', '请先保存当前新建的歌手！');
    return;
  }
  artists.value.unshift(newArtist.value);
  newEditArtist.value = newArtist.value;
  if (editingArtist.value&& changed()) {
    getAllArtistsFlag.value = true;
    save_modal.showModal();
  } else {
    editingArtist.value = newArtist.value;
    editingName.value = true;
  }
}

const selectedAvatarFile = ref(null);

const selectAvatar = (event) => {
  editArtist('avatar')
  const file = event.target.files[0]
  if (file) {
    selectedAvatarFile.value = file
    avatarUrl.value = URL.createObjectURL(file)
  }
  editingAvatar.value = false;
}

</script>

<template>
  <alerts ref="alertsRef" />
  <!-- 新建按钮 -->
  <div class="overflow-x-auto">
    <table class="table">
      <!-- head -->
      <thead>
      <tr>
        <th>
          <label>
          </label>
        </th>
        <th>艺人</th>
        <th>简介</th>
        <th>风格</th>
        <th class="hover:underline cursor-pointer text-primary" @click="addRow">新建歌手</th>
      </tr>
      </thead>
      <tbody>
      <!-- row 1 -->
      <tr v-for="artist in artists" :key="artist.id"
          :class="{ 'bg-base-300': editingArtist && editingArtist.id === artist.id }">
        <th>
        </th>
        <td>
          <div class="flex items-center gap-3">
            <div class="avatar">
              <div class=" h-12 w-12 relative group">
                <!-- 只有在编辑状态下才显示上传功能 -->
                <label v-if="editingArtist && editingArtist.id === artist.id" class="cursor-pointer w-full h-full">
                  <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="selectAvatar($event)"
                  />
                  <!-- 头像 -->
                  <img
                      :src="avatarUrl||artistAvatarUrls[artist.id]||'https://api.dicebear.com/9.x/initials/svg?seed=%E4%B8%8A%E4%BC%A01555'"
                      alt="点击上传头像"
                      class="w-full h-full rounded-box"
                  />
                  <!-- 悬浮提示：点击上传头像 -->
                  <div class="absolute inset-0 flex justify-center items-center text-white opacity-0 group-hover:opacity-60 transition-opacity duration-300">
                    <!-- 黑色半透明背景 -->
                    <div class="absolute inset-0 bg-black bg-opacity-25 transition-opacity duration-300"></div>
                    <span class="z-10">点击上传头像</span>
                  </div>
                </label>

                <!-- 非编辑状态显示头像 -->
                <img
                    v-else
                    :src="artistAvatarUrls[artist.id]||'https://api.dicebear.com/9.x/initials/svg?seed=%E4%B8%8A%E4%BC%A01555'"
                    alt="Avatar Tailwind CSS Component"
                    class="w-full h-full rounded-box"
                />
              </div>
            </div>

            <div>
              <div v-if="editingArtist && editingArtist.id === artist.id && editingName">
                <input
                    v-model="name"
                    class="input input-sm input-bordered"
                    @blur="finishEdit"
                    @keyup.enter="finishEdit"
                />
              </div>
              <div v-else @click="editingArtist.id === artist.id ? editArtist('name') : null"
                   :class="{ 'hover:underline cursor-pointer': editingArtist && editingArtist.id === artist.id }"
                   class="font-bold">
                <div v-if="editingArtist && editingArtist.id === artist.id">{{ artist.name.trim() === '' ? '点击编辑' : artist.name}}</div>
                <div v-else>{{ artist.name }}</div>
              </div>
              <div class="text-sm opacity-50">United States</div>
            </div>
          </div>
        </td>
        <td class="max-w-[300px]">
          <div v-if="editingArtist && editingArtist.id === artist.id && editingBio">
              <textarea
                  v-model="bio"
                  class="textarea textarea-bordered w-full resize-none"
                  rows="3"
                  @blur="finishEdit"
                  @keyup.enter="finishEdit"
              ></textarea>
          </div>
          <div v-else @click="editingArtist.id === artist.id ? editArtist('bio') : null"
               :class="{ 'hover:underline cursor-pointer': editingArtist && editingArtist.id === artist.id }"
               class="line-clamp-3">
            <div v-if="editingArtist && editingArtist.id === artist.id">{{ artist.bio.trim() === '' ? '点击编辑' : artist.bio }}</div>
            <div v-else>{{ artist.bio }}</div>
          </div>
          <br />
          <span class="badge badge-ghost badge-sm">标签</span>
        </td>
        <td>歌手歌曲流派风格</td>
        <th>
          <button v-if="!editingArtist||editingArtist.id!==artist.id" class="btn btn-ghost btn-xs" @click="handleClickEdit(artist)">编辑</button>
          <button v-if="editingArtist&&editingArtist.id===artist.id" class="btn btn-ghost btn-xs" @click="updateEdit">保存</button>
          <button v-if="editingArtist&&editingArtist.id===artist.id" class="btn btn-ghost btn-xs" @click="finishEdit(); artists = JSON.parse(JSON.stringify(originalArtists));editingArtist = null;avatarUrl=null; selectedAvatarFile.value = null;" >取消</button>
          <label v-if="editingArtist&&editingArtist.id===artist.id && artist.id" for="delete_modal" class="btn btn-ghost btn-xs" @click="deleteId=artist.id">删除</label>
        </th>
      </tr>
      <!-- 其余行保持不变 -->
      </tbody>
    </table>
  </div>
  <dialog id="save_modal" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
      <h3 class="text-lg font-bold">保存更改？</h3>
      <p class="py-4">您有未保存的更改，是否保存它们？</p>
      <div class="modal-action">
        <form method="dialog">
          <!-- if there is a button in form, it will close the modal -->
          <button class="btn" @click="() => updateEdit().then(() => { finishEdit(); editingArtist = newEditArtist;avatarUrl=null; })">保存</button>
          <button class="btn" @click="finishEdit();artists=originalArtists;editingArtist=newEditArtist;avatarUrl=null;" >丢弃</button>
        </form>
      </div>
    </div>
  </dialog>
  <input type="checkbox" id="delete_modal" class="modal-toggle" />
  <div class="modal" role="dialog">
    <div class="modal-box">
      <h3 class="text-lg font-bold">确认删除</h3>
      <p class="py-4">你确定要删除这个歌手吗？此操作无法撤销。</p>
      <div class="modal-action">
        <label for="delete_modal" class="btn" @click="deleteArtist(deleteId)">确认</label>
        <label for="delete_modal" class="btn">取消</label>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>