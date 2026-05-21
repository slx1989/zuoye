import { DatabaseSync } from 'node:sqlite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const DB_PATH = path.join(DATA_DIR, 'todos.db')
const LEGACY_JSON = path.join(DATA_DIR, 'todos.json')

let db

export function initDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  db = new DatabaseSync(DB_PATH)

  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  migrateFromJson()
  return db
}

function migrateFromJson() {
  if (!fs.existsSync(LEGACY_JSON)) return

  const { count } = db.prepare('SELECT COUNT(*) AS count FROM todos').get()
  if (count > 0) return

  const legacy = JSON.parse(fs.readFileSync(LEGACY_JSON, 'utf-8'))
  if (!legacy.length) return

  const insert = db.prepare(
    'INSERT INTO todos (id, title, completed, created_at) VALUES (?, ?, ?, ?)'
  )

  db.exec('BEGIN')
  try {
    for (const item of legacy) {
      insert.run(
        item.id,
        item.title,
        item.completed ? 1 : 0,
        item.createdAt || new Date().toISOString()
      )
    }
    db.exec('COMMIT')
    console.log(`已从 todos.json 迁移 ${legacy.length} 条数据到 SQLite`)
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
}

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    createdAt: row.created_at,
  }
}

export function getAllTodos() {
  const rows = db.prepare('SELECT * FROM todos ORDER BY id DESC').all()
  return rows.map(mapRow)
}

export function createTodo(title) {
  const createdAt = new Date().toISOString()
  const result = db
    .prepare(
      'INSERT INTO todos (title, completed, created_at) VALUES (?, 0, ?)'
    )
    .run(title, createdAt)
  return getTodoById(Number(result.lastInsertRowid))
}

export function getTodoById(id) {
  const row = db.prepare('SELECT * FROM todos WHERE id = ?').get(id)
  return row ? mapRow(row) : null
}

export function updateTodo(id, { title, completed }) {
  const existing = getTodoById(id)
  if (!existing) return null

  const nextTitle = title !== undefined ? title : existing.title
  const nextCompleted =
    completed !== undefined ? (completed ? 1 : 0) : existing.completed ? 1 : 0

  db.prepare('UPDATE todos SET title = ?, completed = ? WHERE id = ?').run(
    nextTitle,
    nextCompleted,
    id
  )

  return getTodoById(id)
}

export function deleteTodo(id) {
  const existing = getTodoById(id)
  if (!existing) return null
  db.prepare('DELETE FROM todos WHERE id = ?').run(id)
  return existing
}

export function getDbInfo() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM todos').get()
  return { engine: 'SQLite', path: DB_PATH, count }
}
