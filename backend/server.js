import express from 'express'
import cors from 'cors'
import { initDb, getAllTodos, createTodo, updateTodo, deleteTodo, getDbInfo } from './db.js'

const PORT = process.env.PORT || 3001

initDb()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  const db = getDbInfo()
  res.json({
    ok: true,
    message: '后端服务运行中',
    database: db.engine,
    todoCount: db.count,
  })
})

app.get('/api/todos', (_req, res) => {
  res.json(getAllTodos())
})

app.post('/api/todos', (req, res) => {
  const { title } = req.body
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: '标题不能为空' })
  }

  const todo = createTodo(String(title).trim())
  res.status(201).json(todo)
})

app.patch('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id)
  const { title, completed } = req.body

  if (title !== undefined && !String(title).trim()) {
    return res.status(400).json({ error: '标题不能为空' })
  }

  const updated = updateTodo(id, {
    title: title !== undefined ? String(title).trim() : undefined,
    completed,
  })

  if (!updated) {
    return res.status(404).json({ error: '待办不存在' })
  }

  res.json(updated)
})

app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id)
  const removed = deleteTodo(id)

  if (!removed) {
    return res.status(404).json({ error: '待办不存在' })
  }

  res.json(removed)
})

app.listen(PORT, () => {
  const db = getDbInfo()
  console.log(`API: http://localhost:${PORT}`)
  console.log(`数据库: ${db.engine} (${db.path})`)
})
