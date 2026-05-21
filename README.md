# 前后端分离项目（zuo）

基于 **Vue 3 + Vite** 前端与 **Node.js + Express** 后端，使用 **SQLite** 数据库存储待办数据。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3、Vite |
| 后端 | Express |
| 数据库 | SQLite（Node 内置 `node:sqlite`，文件 `backend/data/todos.db`） |
| 通信 | REST API，开发环境 Vite 代理 `/api` |

## 项目结构

```
zuo/
├── backend/
│   ├── server.js      # API 服务
│   ├── db.js          # 数据库初始化与 CRUD
│   └── data/
│       ├── todos.db   # SQLite 数据库（运行后自动生成）
│       └── todos.json # 旧版 JSON 数据（首次启动会自动迁移到 db）
├── src/
│   ├── api/todos.js
│   └── components/TodoApp.vue
└── vite.config.js
```

## 数据表结构

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,  -- 0/1
  created_at TEXT NOT NULL
);
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查（含数据库信息） |
| GET | `/api/todos` | 获取全部待办 |
| POST | `/api/todos` | 新增 `{ "title": "..." }` |
| PATCH | `/api/todos/:id` | 更新 `title` 或 `completed` |
| DELETE | `/api/todos/:id` | 删除 |

## 快速开始

```bash
npm run install:all
npm run dev:all
```

浏览器打开 http://localhost:5173 。

分开启动：

```bash
npm run dev:backend   # 后端 :3001
npm run dev           # 前端 :5173
```

## 查看数据库

可用 [DB Browser for SQLite](https://sqlitebrowser.org/) 打开 `backend/data/todos.db`，或使用命令行：

```bash
sqlite3 backend/data/todos.db "SELECT * FROM todos;"
```

## 生产构建

```bash
npm run build
npm run start --prefix backend
```

部署时请一并带上 `backend/data/todos.db`（或在新环境让程序自动建表）。

若作业明确要求 **MySQL**，说明连接信息（主机、库名、账号）后可改为 MySQL 版本。
