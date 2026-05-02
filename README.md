# 诗经文本流变研究支持平台 MVP

一个本地运行的研究支持网站，用于管理《诗经》研究中的文献、异文、论证章节和它们之间的关联。

## 技术栈

- 前端：React + TypeScript + Vite + Tailwind CSS
- 后端：FastAPI + SQLAlchemy
- 数据库：SQLite
- 文件上传：本地存储到 `backend/storage/uploads`
- 不包含登录、权限系统

## 目录结构

```text
.
├── backend
│   ├── app
│   │   ├── database.py
│   │   ├── main.py
│   │   └── models.py
│   ├── requirements.txt
│   └── storage
│       └── uploads
└── frontend
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    └── src
        ├── App.tsx
        ├── main.tsx
        ├── index.css
        ├── components
        ├── lib
        ├── pages
        └── types
```

## 启动后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --reload-dir app --port 8000
```

后端地址：`http://127.0.0.1:8000`

## 启动前端

打开另一个终端：

```bash
cd frontend
npm install
npm run dev
```

前端地址：`http://127.0.0.1:5173`

如果后端不是运行在 `8000` 端口，可以在 `frontend/.env` 中设置：

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 第一版功能

- 首页 Dashboard：文献数、异文数、章节数
- 文献库：添加、查看、删除文献，支持上传本地文件
- 异文数据：录入篇目、传世文本、出土文本、异文类型、说明
- 论文结构：创建章节，并绑定相关文献和异文
- 关系总览：展示章节、文献、异文之间的关联

## 部署

部署到 Vercel + Render 的步骤见：

```bash
DEPLOYMENT.md
```
