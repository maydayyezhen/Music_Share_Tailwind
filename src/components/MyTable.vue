<script setup>

// 定义父组件传递给当前组件的输入
import {ref} from "vue";
import MyImageUpload from "@/components/MyImageUpload.vue";
import MySelector from "@/components/MySelector.vue";
import LongTextEditor from "@/components/LongTextEditor.vue";
import AudioUpload from "@/components/AudioUpload.vue";
import MiniAudioPlayer from "@/components/MiniAudioPlayer.vue";
import Pagination from "@/components/Pagination.vue";

const props = defineProps({
  modelValue: Array,
  columns: Array,
  pagination: Object,
  sortBy: String,
  sortOrder: String,
})

const mode = ref(null);      // null: 没有操作，'edit': 编辑，'add': 新增
const editingRow = ref(null); // 用来标识正在编辑的行
const editBuffer = ref({});   // 用来存储编辑的缓存数据

//编辑部分
function startEdit(row) {
  editingRow.value = row
  editBuffer.value = {}
  mode.value = 'edit';

  for (const column of props.columns) {
    const key = column.key
    const value = row[key]
    //处理图片编辑数据结构
    if (column.editComponent === 'MyImageUpload') {
      editBuffer.value[key] = value
          ? { url: value, file: null }  // 图片 URL 包装成对象
          : null
    } else {
      editBuffer.value[key] = value
    }
  }
}

function cancelEdit() {
  console.log(editingRow.value)
  editingRow.value = null; // 重置编辑状态
  editBuffer.value = {};   // 清空编辑缓存
  mode.value = null;
}

const emit = defineEmits(['update', 'add', 'delete', 'query-change']);

async function confirmEdit(row) {
  const updatedRow = { ...row };
  let files = {};

  for (const column of props.columns) {
    const key = column.key;
    const value = editBuffer.value[key];

    // 如果是图片字段，存储图片文件
    if (column.editComponent === 'MyImageUpload') {
      if (value?.file instanceof File) {
        files[key] = value.file;  // 保存文件，并关联字段的 key
      } else {
        updatedRow[key] = value?.url || '';  // 如果没有上传文件，保持现有的 URL
      }
    }
    else if (column.editComponent === 'input-file'|| column.editComponent === 'AudioUpload') {
      if (value instanceof File) {
        files[key] = value; // 直接是 File 对象
      } else {
        updatedRow[key] = value?.url || ''; // 回退处理（比如已有 URL 或空值）
      }
    }
    else {
      updatedRow[key] = value;  // 其他字段直接合并
    }
  }

  // 通知父组件更新数据和上传图片
  emit('update', { updatedRow, files: files });
  // 取消编辑状态
  cancelEdit();
}

//新增部分
function startAdd() {
  const newRow = {}; // 新增行的临时数据对象
  // 初始化每一列的字段，和表格数据结构一致
  for (const column of props.columns) {
    newRow[column.key] = null;
  }
  // 将这个新行加入到表格数据
  props.modelValue.unshift(newRow);  // 在表格数据末尾添加空行
  editingRow.value = newRow;     // 设置当前正在编辑的行
  editBuffer.value = { ...newRow }; // 初始化编辑缓存
  mode.value = 'add';
}

function cancelAdd() {
  // 从表格数据中移除新增的空行
  props.modelValue.shift();
  editingRow.value = null; // 重置编辑状态
  editBuffer.value = {};   // 清空编辑缓存
  mode.value = null;
}

async function confirmAdd() {
  const newRow = {};
  const files = {};

  for (const column of props.columns) {
    const key = column.key;
    const value = editBuffer.value[key];

    if (column.editComponent === 'MyImageUpload') {
      if (value?.file instanceof File) {
        files[key] = value.file;
      } else {
        newRow[key] = value?.url || '';
      }
    }
    else if (column.editComponent === 'input-file'|| column.editComponent === 'AudioUpload') {
      if (value instanceof File) {
        files[key] = value; // 直接是 File 对象
      } else {
        newRow[key] = value?.url || ''; // 回退处理（比如已有 URL 或空值）
      }
    }
    else {
      newRow[key] = value;
    }
  }

  // 发出新增请求
  emit('add', { newRow, files: files, onSuccess: removeTempRow });
  // 清除新增状态
  cancelAdd();
}

function removeTempRow() {
  const index = props.modelValue.findIndex(item => !item.id);
  if (index !== -1) props.modelValue.splice(index, 1);
}

async function confirmDelete()
{
  emit('delete', editingRow.value.id);
  cancelEdit();
}

</script>


<template>
  <div class="rounded-box border border-base-content/5 bg-base-100">
    <table class="table table-zebra">
      <!-- head -->
      <thead>
        <tr>
          <th v-for="column in columns.filter(c => !c.hidden)" :key="column.key">
            <span class="flex items-center gap-1">
              {{ column.label }}
              <span
                  v-if="column.sortable && sortOrder === 'asc'"
                  @click="emit('query-change', 0, pagination.size, searchKeyword, column.key, sortBy===column.key?'desc':'asc');"
                  :class="[ 'cursor-pointer','select-none','mx-0.5',sortBy === column.key && sortOrder === 'asc' ? 'text-primary font-bold' : 'text-gray-400']">
                ▲
              </span>

              <span
                  v-else-if="column.sortable"
                  @click="emit('query-change', 0, pagination.size, searchKeyword, column.key, sortBy===column.key?'asc':'desc');"
                  :class="['cursor-pointer','select-none','mx-0.5',sortBy === column.key && sortOrder === 'desc' ? 'text-primary font-bold' : 'text-gray-400']">
                ▼
              </span>


            </span>
          </th>
          <th class="hover:underline cursor-pointer text-primary" @click="mode === null && startAdd()">新建</th>
        </tr>
      </thead>
      <!-- body -->
      <tbody>
        <tr v-for="row in modelValue" :key="row.id" >
          <td v-for="column in columns.filter(c => !c.hidden)" :key="column.key" class="hover:bg-primary-content/50 " :class="{ 'font-bold': column.bold }" >
            <!-- 编辑状态 -->
            <div v-if="!column.readOnly && editingRow && editingRow.id === row.id" class="max-w-[12rem]">
              <MyImageUpload
                  v-if="column.editComponent === 'MyImageUpload'"
                  v-model="editBuffer[column.key]"
                  :imageClass="column.imageClass "
                  class="w-full"
              />
              <MySelector
                  v-else-if="column.editComponent === 'MySelector'"
                  v-model="editBuffer[column.key]"
                  v-bind="column.props"
                  class="w-full"
              />
              <LongTextEditor v-else-if ="column.editComponent==='textarea'|| column.editComponent==='editor'"
                              v-model="editBuffer[column.key]"
                              :button-text="column.buttonText"
                              :title="typeof column.title === 'function' ? column.title(row) : column.title"
                              :edit="true"
                              :edit-component="column.editComponent"
              />
              <AudioUpload v-else-if="column.editComponent === 'AudioUpload'" v-model="editBuffer[column.key]" />
              <input
                  v-else-if="column.editComponent === 'input-file'"
                  type="file"
                  class="file-input file-input-bordered w-full"
                  @change="e => editBuffer[column.key] = e.target.files[0]"
              />
              <input
                  v-else-if="column.editComponent === 'input-date'"
                  v-model="editBuffer[column.key]"
                  type="date"
                  class="input input-bordered w-full"
              />
              <input
                  v-else
                  v-model="editBuffer[column.key]"
                  type="text"
                  class="input input-bordered w-full"
              />
            </div>
            <!-- 展示状态 -->
            <div v-else>
              <!-- 多组件 -->
              <div v-if="Array.isArray(column.displayComponent)" class="flex gap-2">
                <div v-for="subColumn in column.displayComponent" :key="subColumn.key" class="flex items-center">
                  <!-- 如果是图片组件 -->
                  <img
                      v-if="subColumn.component === 'img'"
                      :src="row[column.key]?.[subColumn.key]"
                      alt="image"
                      :class="column.props?.imageClass || 'size-12 object-cover rounded-md'"
                  />
                  <!-- 如果是文本 -->
                  <span v-else :title="row[column.key]?.[subColumn.key]" class="text-ellipsis whitespace-nowrap max-w-[10rem] overflow-hidden">{{ row[column.key]?.[subColumn.key] }}</span>
                </div>
              </div>


              <!-- 单组件 -->
              <div v-else class="max-w-[10rem] overflow-hidden whitespace-nowrap text-ellipsis">
                <img v-if="column.displayComponent === 'img'" :src="row[column.key]" alt="image" :class="column.imageClass || 'size-10 object-cover rounded-box'">
                <MiniAudioPlayer v-else-if="column.displayComponent === 'MiniAudioPlayer'" :src="row[column.key]" />
                <LongTextEditor v-else-if ="column.editComponent==='textarea'|| column.editComponent==='editor'"
                                v-model="row[column.key]"
                                :button-text="column.buttonText"
                                :title="typeof column.title === 'function' ? column.title(row) : column.title"
                />
                <span v-else :title="row[column.key]" class="block truncate">{{ row[column.key] }}</span>
              </div>
            </div>
          </td>
          <th>
            <div v-if="editingRow && editingRow.id === row.id" class="flex">
              <button  class="btn btn-ghost btn-xs" @click="mode === 'edit' ? confirmEdit() : (mode === 'add' ? confirmAdd() : null)">保存</button>
              <button class="btn btn-ghost btn-xs" @click="mode === 'edit' ? cancelEdit() : (mode === 'add' ? cancelAdd() : null)">
                取消
              </button>
              <label for="delete_modal" class="btn btn-ghost btn-xs">删除</label>
            </div>
            <button v-else class="btn btn-ghost btn-xs" @click="startEdit(row)">编辑</button>
          </th>
        </tr>
      </tbody>
      <tfoot v-if="pagination">
      <tr>
        <td colspan="100%" class="text-center">
          <div class="flex flex-wrap justify-center items-center gap-4 my-4">

            <!-- 搜索框 -->
            <div class="flex items-center gap-2">
              <span>搜索:</span>
              <input
                  type="text"
                  v-model="searchKeyword"
                  class="input input-bordered input-sm w-48"
                  @change="emit('query-change',0,pagination.size,searchKeyword, sortBy, sortOrder)"
                  placeholder="输入关键词搜索"
              />
              <button class="btn btn-sm" @click="emit('query-change',0,pagination.size,searchKeyword, sortBy, sortOrder)">搜索</button>
            </div>

            <pagination
              :number="pagination.number"
              :size="pagination.size"
              :total-pages="pagination.totalPages"
              @change="(number, size) => emit('query-change', number, size, searchKeyword, sortBy, sortOrder)"
            >
            </pagination>

          </div>
        </td>
      </tr>
      </tfoot>
    </table>
  </div>

  <input type="checkbox" id="delete_modal" class="modal-toggle" />
  <div class="modal" role="dialog">
    <div class="modal-box">
      <h3 class="text-lg font-bold">确认删除</h3>
      <p class="py-4">你确定要删除这行数据吗？此操作无法撤销。</p>
      <div class="modal-action">
        <label for="delete_modal" class="btn"  @click="mode === 'edit' ? confirmDelete() : (mode === 'add' ? cancelAdd() : null)">确认</label>
        <label for="delete_modal" class="btn">取消</label>
      </div>
    </div>
  </div>
</template>