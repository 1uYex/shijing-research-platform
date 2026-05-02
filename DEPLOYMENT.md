# 部署说明：Vercel + Render

本项目采用前后端分离部署：

- 前端：Vercel，部署 `frontend`
- 后端：Render，部署 `backend`
- 数据库：SQLite，仅用于演示。Render 免费实例的本地文件系统不适合长期保存生产数据。

## 1. 后端部署到 Render

### 准备

后端入口为：

```bash
backend/app/main.py
```

依赖文件：

```bash
backend/requirements.txt
```

Python 版本文件：

```bash
backend/runtime.txt
```

Render Blueprint 配置：

```bash
render.yaml
```

### 使用 Render Dashboard 部署

1. 将项目推送到 GitHub。
2. 打开 Render，新建 `Web Service`。
3. 选择当前仓库。
4. 如果不是使用 `render.yaml` Blueprint，请手动填写：

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

5. 部署完成后，Render 会生成类似这样的后端地址：

```text
https://shijing-research-api.onrender.com
```

6. 先访问健康检查接口确认后端正常：

```text
https://你的-render-服务地址/health
```

看到下面内容即表示后端启动正常：

```json
{"status":"ok"}
```

### 配置 CORS

Render 后端需要允许 Vercel 前端访问。部署前端后，把 Vercel 域名填入 Render 的环境变量：

```text
CORS_ORIGINS=https://你的-vercel-项目.vercel.app
```

后端已经默认允许 `http://localhost:5173` 和 `http://127.0.0.1:5173`，并允许 `https://*.vercel.app`。如果你以后绑定了自定义前端域名，可以继续用逗号分隔写入：

```text
CORS_ORIGINS=https://你的-vercel-项目.vercel.app,http://127.0.0.1:5173,http://localhost:5173
```

修改环境变量后，需要在 Render 上重新部署或重启服务。

## 2. 前端部署到 Vercel

### 使用 Vercel Dashboard 部署

1. 将项目推送到 GitHub。
2. 打开 Vercel，新建项目并导入该仓库。
3. 设置项目目录：

```text
Root Directory: frontend
```

4. Vercel 会识别 Vite 项目。也可以手动确认：

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

5. 在 Vercel 项目的环境变量里添加：

```text
VITE_API_BASE_URL=https://你的-render-服务地址
```

注意不要在地址末尾加 `/`，推荐写成：

```text
https://shijing-research-api.onrender.com
```

6. 重新部署前端。

## 3. 前端如何读取后端地址

前端 API 地址在这里读取：

```bash
frontend/src/lib/api.ts
```

代码使用：

```ts
import.meta.env.VITE_API_BASE_URL
```

本地开发时可创建：

```bash
frontend/.env
```

内容示例：

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Vercel 部署时则在 Vercel Dashboard 的 Environment Variables 中设置同名变量。

## 4. SQLite 演示说明

当前数据库文件会生成在：

```bash
backend/storage/shijing_research.db
```

在 Render 上这适合演示和答辩预览，但不适合正式生产：

- 服务重新部署后，本地 SQLite 数据可能丢失。
- 本地上传文件也可能丢失。
- 如果后续要正式使用，建议迁移到 PostgreSQL，并把上传文件迁移到对象存储。

## 5. 部署后的检查顺序

1. 打开 Render 后端：

```text
https://你的-render-服务地址/health
```

2. 打开 Vercel 前端：

```text
https://你的-vercel-项目.vercel.app
```

3. 在前端添加一条文献、一条异文、一个章节。
4. 进入“关系总览”，检查章节、文献、异文节点是否能正确关联。
