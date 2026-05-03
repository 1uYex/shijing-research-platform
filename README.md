# 《诗经》文本流变研究支持平台 MVP

本平台是《诗经》文本流变研究的轻量级数字人文 MVP，用于结构化管理文献、异文、论文章节及其证据关系。

项目关注的不是普通文献收藏，而是将论文写作中常见但容易隐含的“文献—异文—论证结构”关系显式化，帮助研究者在申报、答辩和阶段性研究中展示材料如何支撑论证。

## 项目定位

- 面向《诗经》文本流变研究的研究支持型原型
- 以文献、异文、章节为核心数据对象
- 以证据链绑定和关系总览作为核心展示能力
- 适合用于大学生创新创业项目申报、课程项目、研究方案演示和早期原型验证

## 学术功能

- 文献资料结构化管理：记录题名、作者、年份、文献类型、出版来源、检索标识、参考文献格式和本地文件，并支持按关键词和学术用途筛选。
- 异文证据条目管理：记录篇目、传世文本、出土文本、来源材料、地域、时代、释读依据和可信度，并支持证据条目检索。
- 章节与证据链绑定：创建论文结构，并将章节与相关文献、异文证据绑定。
- 关系总览与可视化：以“章节—文献—异文”三类节点展示证据关系，支持点击查看证据链说明。
- 示例数据展示：提供示例导入功能，便于评审快速理解平台结构和使用场景。

## 当前边界

- 当前版本为研究支持型原型，不是成熟的学术数据库或自动分析系统。
- 暂不包含登录、复杂权限和多人协作。
- SQLite 数据库适合本地演示和轻量部署，暂不作为生产级长期数据方案。
- 示例数据仅用于展示功能，不代表最终学术结论。
- 文件上传当前以本地存储为主，可在后续版本扩展为对象存储。

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
cat > .env <<'EOF'
VITE_API_BASE_URL=http://127.0.0.1:8000
EOF
npm run dev
```

前端地址：`http://127.0.0.1:5173`

如果后端不是运行在 `8000` 端口，请修改 `frontend/.env`：

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 功能概览

- 首页 Dashboard：显示文献数、异文数、章节数，并支持导入示例数据。
- 文献库：添加、查看、删除文献，支持上传本地文件、结构化参考文献信息和前端检索筛选。
- 异文数据：录入篇目、传世文本、出土文本、来源材料、地域、时代、可信度等证据字段，并支持前端检索筛选。
- 论文结构：创建章节，并绑定相关文献和异文。
- 关系总览：展示“章节—文献—异文”的关联关系和证据链说明。

## 部署

部署到腾讯云 Linux 服务器的步骤见：

```bash
DEPLOYMENT.md
```

前端生产构建时可通过 `VITE_API_BASE_URL` 指定后端 API 地址；后端可通过 `CORS_ORIGINS` 配置允许访问的前端来源。
