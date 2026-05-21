const API_BASE = '/api'

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `请求失败 (${res.status})`)
  }
  return data
}

export function fetchTodos() {
  return request('/todos')
}

export function createTodo(title) {
  return request('/todos', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

export function updateTodo(id, payload) {
  return request(`/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteTodo(id) {
  return request(`/todos/${id}`, { method: 'DELETE' })
}

export function checkHealth() {
  return request('/health')
}
