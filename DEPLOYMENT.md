# 腾讯云服务器部署指南

本文档说明如何将本项目手动部署到一台腾讯云 Linux 服务器，例如 Ubuntu 22.04。部署方式为：

- 前端：Vite 构建为静态文件，由 nginx 托管。
- 后端：FastAPI 运行在服务器本机 `127.0.0.1:8000`，由 systemd 管理。
- nginx：监听公网 `80` 端口，并将 `/api` 与 `/uploads` 反向代理到后端。
- 数据库：SQLite，文件位于 `backend/storage/shijing_research.db`。

正式部署建议只开放公网 `80/443`，后端 `8000` 不直接暴露到公网。

## 1. 服务器环境准备

登录服务器后执行：

```bash
sudo apt update
sudo apt install -y git nginx python3 python3-venv python3-pip curl
```

安装 Node.js LTS：

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

确认 nginx 可用：

```bash
nginx -v
sudo systemctl status nginx
```

## 2. 拉取项目代码

建议部署到 `/opt`：

```bash
cd /opt
sudo git clone https://github.com/YOUR_USERNAME/shijing-research-platform.git
sudo chown -R $USER:$USER shijing-research-platform
cd /opt/shijing-research-platform
```

如果已经拉取过代码，更新时执行：

```bash
cd /opt/shijing-research-platform
git pull
```

## 3. 后端部署

进入后端目录：

```bash
cd /opt/shijing-research-platform/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

本项目会自动创建：

```text
backend/storage/uploads
backend/storage/shijing_research.db
```

只要 `/opt/shijing-research-platform/backend/storage` 不被删除，SQLite 数据和本地上传文件在服务器重启后会保留。

### 临时启动测试

```bash
cd /opt/shijing-research-platform/backend
source .venv/bin/activate
CORS_ORIGINS=http://YOUR_SERVER_IP uvicorn main:app --host 0.0.0.0 --port 8000
```

另开终端或在服务器内执行：

```bash
curl http://127.0.0.1:8000/health
```

看到下面内容即表示后端正常：

```json
{"status":"ok"}
```

测试完成后按 `Ctrl+C` 停止临时进程。

### 使用 systemd 管理后端服务

创建服务文件：

```bash
sudo nano /etc/systemd/system/shijing-api.service
```

写入以下内容。把 `YOUR_SERVER_IP` 改成你的服务器公网 IP；如果以后使用域名，也可以写成 `https://example.com`。

```ini
[Unit]
Description=Shijing Research FastAPI
After=network.target

[Service]
User=root
WorkingDirectory=/opt/shijing-research-platform/backend
Environment="CORS_ORIGINS=http://YOUR_SERVER_IP,http://YOUR_SERVER_IP:80"
ExecStart=/opt/shijing-research-platform/backend/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable shijing-api
sudo systemctl start shijing-api
sudo systemctl status shijing-api
```

查看后端日志：

```bash
sudo journalctl -u shijing-api -n 100 --no-pager
```

说明：

- `uvicorn main:app --host 0.0.0.0 --port 8000` 可以用于直接公网测试。
- 正式部署推荐 systemd 中使用 `--host 127.0.0.1`，让后端只被 nginx 内部访问。

## 4. 前端部署

进入前端目录：

```bash
cd /opt/shijing-research-platform/frontend
npm install
```

如果通过 nginx 使用 `/api` 反向代理，推荐前端生产环境 API 地址写成：

```bash
cat > .env.production <<'EOF'
VITE_API_BASE_URL=http://YOUR_SERVER_IP/api
EOF
```

如果你临时开放了后端 `8000` 端口，也可以写成：

```bash
cat > .env.production <<'EOF'
VITE_API_BASE_URL=http://YOUR_SERVER_IP:8000
EOF
```

如果以后使用独立 API 域名：

```bash
cat > .env.production <<'EOF'
VITE_API_BASE_URL=https://api.example.com
EOF
```

构建前端：

```bash
npm run build
```

构建成功后会生成：

```text
frontend/dist
```

## 5. nginx 配置

nginx 负责：

- `/`：访问前端静态页面。
- `/api/`：反向代理到 FastAPI 后端。
- `/uploads/`：访问后端上传文件。

创建 nginx 配置：

```bash
sudo nano /etc/nginx/sites-available/shijing
```

写入以下内容。把 `YOUR_SERVER_IP` 替换成你的服务器公网 IP；如果使用域名，把 `server_name` 改成域名。

```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;

    client_max_body_size 50M;

    root /opt/shijing-research-platform/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8000/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/shijing /etc/nginx/sites-enabled/shijing
sudo nginx -t
sudo systemctl reload nginx
```

如果上传较大 PDF 或图片，`client_max_body_size 50M;` 可以避免 nginx 默认上传大小限制导致失败。

## 6. 腾讯云安全组 / 防火墙

在腾讯云控制台的安全组或轻量应用服务器防火墙中开放：

```text
22    SSH
80    HTTP
443   HTTPS，绑定域名和证书后使用
```

如果不经过 nginx，想临时直接测试后端，可以临时开放：

```text
8000  FastAPI 测试端口
```

正式部署建议关闭公网 `8000`，只通过 nginx 的 `/api` 反向代理访问后端。

## 7. 验证步骤

### 验证后端本机服务

```bash
curl http://127.0.0.1:8000/health
```

应返回：

```json
{"status":"ok"}
```

### 验证 nginx API 反向代理

```bash
curl http://YOUR_SERVER_IP/api/health
```

应返回：

```json
{"status":"ok"}
```

### 验证前端页面

浏览器访问：

```text
http://YOUR_SERVER_IP
```

在页面中测试：

1. 首页是否正常打开。
2. 点击“导入示例数据”。
3. 添加文献。
4. 上传文献文件。
5. 添加异文。
6. 创建章节并绑定文献和异文。
7. 打开“关系总览”，检查节点和证据链说明。

### 常用排错命令

查看后端状态：

```bash
sudo systemctl status shijing-api
sudo journalctl -u shijing-api -n 100 --no-pager
```

查看 nginx 状态和错误：

```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -n 100 /var/log/nginx/error.log
```

重新构建前端并刷新 nginx：

```bash
cd /opt/shijing-research-platform/frontend
npm run build
sudo systemctl reload nginx
```

更新代码后重启后端：

```bash
cd /opt/shijing-research-platform
git pull
cd backend
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart shijing-api
```
