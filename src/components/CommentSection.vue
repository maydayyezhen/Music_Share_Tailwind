<script setup>
import {ref, onMounted, computed, watch} from 'vue';
import CommentAPI from '../api/comment-api';
import { apiGetUserAvatarFile } from '@/api/user-api.js';
import { createAvatarUrl } from '@/Tools/tools.js';
import {HandThumbUpIcon} from "@heroicons/vue/24/solid"
import{HandThumbUpIcon as HandThumbUpIconOutline ,TrashIcon} from "@heroicons/vue/24/outline/index.js";
import {useAuthStore} from "@/stores/authStore.js";
import Alerts from "@/components/Alerts.vue";
const alertsRef = ref(null)
function triggerToast(alertType, alertMessage) {
  alertsRef.value?.showToast(alertType, alertMessage)
}

const props = defineProps({
  contentType: {
    type: String,
    required: true,
    validator: (value) => ['song', 'album', 'artist', 'playlist'].includes(value),
  },
  contentId: {
    type: Number,
    required: true,
  },
});

const comments = ref([]);
const newComment = ref('');
const isSubmitting = ref(false);
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

const isLoggedIn = computed(() => localStorage.getItem('token') !== null);

function getCurrentUser() {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

function canDelete(comment) {
  const currentUser = useAuthStore().user;
  return currentUser && (comment.userId === currentUser.id || currentUser.role === 'admin');
}

async function loadComments() {
  try {
    const response = await CommentAPI.getComments(props.contentType, props.contentId);
    comments.value = response.data;

    for (const comment of comments.value) {
      try {
        comment.avatar = await apiGetUserAvatarFile(comment.avatarUrl) || createAvatarUrl(comment.username) || defaultAvatar;
      } catch (error) {
        console.error('加载评论头像失败:', error);
        comment.avatar = createAvatarUrl(comment.username) || defaultAvatar;
      }
    }
  } catch (error) {
    console.error('加载评论失败:', error);
    ElMessage.error('加载评论失败，请稍后再试');
  }
}

async function submitComment() {
  if (!newComment.value.trim()) return;
  isSubmitting.value = true;

  try {
    await CommentAPI.addComment({
      contentType: props.contentType,
      contentId: props.contentId,
      content: newComment.value.trim(),
    });

    newComment.value = '';
    await loadComments();
    triggerToast('success', '评论已发送');
  } catch (error) {
    console.error('提交评论失败:', error);
    triggerToast('error', '提交评论失败，请稍后再试');
  } finally {
    isSubmitting.value = false;
  }
}

async function deleteComment(commentId) {
  try {
    await CommentAPI.deleteComment(commentId);
    await loadComments();
    triggerToast('success', '评论已删除');
  } catch (error) {
    if (error !== 'cancel') {
      triggerToast('error','删除评论失败，请稍后再试')
    }
  }
}

async function toggleLike(comment) {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录再点赞');
    return;
  }

  try {
    const response = comment.liked
        ? await CommentAPI.unlikeComment(comment.id)
        : await CommentAPI.likeComment(comment.id);

    comment.liked = !comment.liked;
    comment.likeCount = response.data.likeCount;
  } catch (error) {
    console.error('点赞操作失败:', error);
    ElMessage.error('点赞操作失败，请稍后再试');
  }
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

onMounted(loadComments);
watch(props, loadComments)
</script>


<template>

  <div class="flex flex-col gap-4 mx-5 my-4">
    <alerts ref="alertsRef" />
    <h3 class="text-xl mt-6">评论 ({{ comments.length }})</h3>
    <div v-if="isLoggedIn" class="flex flex-col gap-2">
      <textarea
          v-model="newComment"
          class="textarea textarea-bordered w-full rounded resize-none "
          rows="3"
          placeholder="发表你的评论..."
          maxlength="500"
      ></textarea>
      <div class="flex justify-end">
        <button
            class="btn btn-secondary btn-sm px-6 rounded"
            :disabled="!newComment.trim() || isSubmitting"
            @click="submitComment"
        >
          <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
          <span v-else>发送评论</span>
        </button>
      </div>
    </div>
    <div v-else class="alert alert-info shadow-sm">
      <span>登录后才能发表评论</span>
    </div>

    <div v-if="comments.length > 0" class="flex flex-col gap-6 overflow-auto scrollbar scrollbar-thin scrollbar-thumb-base-content scrollbar-track-transparent ">
      <div v-for="comment in comments" :key="comment.id" class="flex flex-col gap-3">

        <div class="flex gap-3 items-center">
          <img
              :src="comment.avatar||createAvatarUrl(comment.username)"
              alt="User Avatar"
              class="w-10 h-10 rounded-full object-cover shadow-sm"
          />
          <div class="flex flex-col leading-tight">
    <span class="text-sm font-semibold">
      {{ comment.nickname || comment.username }}
    </span>
            <span class="text-xs text-base-content/50">
      {{ formatDate(comment.createdAt) }}
    </span>
          </div>
        </div>

        <div class="text-sm leading-relaxed whitespace-pre-line">
          {{ comment.content }}
        </div>

        <div class="flex flex-col">
          <div class="flex w-full justify-end items-center">
            <button
                :class="comment.liked ? 'btn-primary' : 'btn-outline'"
                :disabled="!isLoggedIn"
                @click="toggleLike(comment)"
                class="hover:brightness-75 cursor-pointer"
            >
              <HandThumbUpIcon v-if="comment.liked" class="size-5" />
              <HandThumbUpIconOutline v-else class="size-5" />
            </button>
            <span  class="mr-2">{{ comment.likeCount || 0 }}</span>
            <TrashIcon v-if="canDelete(comment)" class="size-5 hover:brightness-75 cursor-pointer" @click="deleteComment(comment.id)" />
          </div>
          <div class="divider mr-2"></div>
        </div>
      </div>
    </div>
    <div v-else class="flex justify-center py-10 ">
      <div class="text-gray-400">暂无评论</div>
    </div>
  </div>

</template>


<style scoped>

</style>