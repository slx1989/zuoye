<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  checkHealth,
} from '../api/todos.js'

const todos = ref([])
const newTitle = ref('')
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const apiOk = ref(false)

const remaining = computed(
  () => todos.value.filter((t) => !t.completed).length
)

async function loadTodos() {
  loading.value = true
  error.value = ''
  try {
    todos.value = await fetchTodos()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function checkApi() {
  try {
    await checkHealth()
    apiOk.value = true
  } catch {
    apiOk.value = false
  }
}

async function handleAdd() {
  const title = newTitle.value.trim()
  if (!title || submitting.value) return

  submitting.value = true
  error.value = ''
  try {
    const todo = await createTodo(title)
    todos.value.unshift(todo)
    newTitle.value = ''
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}

async function toggleTodo(todo) {
  try {
    const updated = await updateTodo(todo.id, { completed: !todo.completed })
    const index = todos.value.findIndex((t) => t.id === todo.id)
    if (index !== -1) todos.value[index] = updated
  } catch (e) {
    error.value = e.message
  }
}

async function removeTodo(todo) {
  try {
    await deleteTodo(todo.id)
    todos.value = todos.value.filter((t) => t.id !== todo.id)
  } catch (e) {
    error.value = e.message
  }
}

onMounted(async () => {
  await checkApi()
  await loadTodos()
})
</script>

<template>
  <div class="todo-app">
    <header class="header">
      <h1>待办清单</h1>
      <p class="subtitle">Vue 3 前端 + Express 后端 + SQLite 数据库</p>
      <span class="status" :class="{ online: apiOk }">
        {{ apiOk ? '后端已连接' : '后端未连接，请先启动 server' }}
      </span>
    </header>

    <form class="add-form" @submit.prevent="handleAdd">
      <input
        v-model="newTitle"
        type="text"
        placeholder="输入新待办…"
        :disabled="submitting"
        maxlength="200"
      />
      <button type="submit" :disabled="submitting || !newTitle.trim()">
        {{ submitting ? '添加中…' : '添加' }}
      </button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="loading" class="hint">加载中…</div>

    <ul v-else-if="todos.length" class="list">
      <li
        v-for="todo in todos"
        :key="todo.id"
        :class="{ done: todo.completed }"
      >
        <label>
          <input
            type="checkbox"
            :checked="todo.completed"
            @change="toggleTodo(todo)"
          />
          <span>{{ todo.title }}</span>
        </label>
        <button type="button" class="delete" @click="removeTodo(todo)">
          删除
        </button>
      </li>
    </ul>

    <p v-else class="hint">暂无待办，添加一条试试吧</p>

    <footer v-if="todos.length" class="footer">
      未完成 {{ remaining }} 项 · 共 {{ todos.length }} 项
    </footer>
  </div>
</template>

<style scoped>
.todo-app {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 48px 24px 64px;
  text-align: left;
}

.header {
  margin-bottom: 28px;
}

.header h1 {
  font-size: 32px;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--text);
}

.status {
  display: inline-block;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.status.online {
  background: var(--accent-bg);
  color: var(--accent);
}

.add-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.add-form input {
  flex: 1;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font: inherit;
  color: var(--text-h);
  background: var(--bg);
}

.add-form input:focus {
  outline: 2px solid var(--accent-border);
  border-color: var(--accent);
}

.add-form button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  color: #fff;
  background: var(--accent);
}

.add-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  color: #ef4444;
  font-size: 14px;
  margin: 0 0 16px;
}

.hint {
  color: var(--text);
  font-size: 15px;
  text-align: center;
  padding: 24px 0;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  transition: box-shadow 0.2s;
}

.list li:hover {
  box-shadow: var(--shadow);
}

.list li.done span {
  text-decoration: line-through;
  color: var(--text);
}

.list label {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.list label span {
  color: var(--text-h);
  word-break: break-word;
}

.delete {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  color: var(--text);
  background: transparent;
}

.delete:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.footer {
  margin-top: 20px;
  font-size: 14px;
  color: var(--text);
  text-align: center;
}
</style>
