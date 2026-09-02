# TSF Ranking

Time Series 预测排行榜前端（Vite + React + TypeScript + Tailwind）。

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:8080

## 脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 开发服务器 |
| `npm run build` | 生产构建 → `dist/` |
| `npm run build:pages` | GitHub Pages 构建 → `docs/`（base=`/Time-Series-complete-leaderboard/`） |
| `npm run preview` | 预览 `dist/` |

## 部署到 GitHub Pages

1. 仓库 Settings → Pages → Source 选 **Deploy from a branch**
2. Branch 选 `main`，Folder 选 `/docs`
3. 本地执行后推送：

```bash
npm run build:pages
git add docs
git commit -m "chore: update GitHub Pages build"
git push
```

线上地址：https://keep-maker.github.io/Time-Series-complete-leaderboard/

## Docker 部署（云服务器 82 端口）

项目含 `Dockerfile` + `docker-compose.yml`，多阶段构建（Node 编译 → Nginx 托管静态文件）。

```bash
# 本机打包上传（排除 node_modules）
tar -czf /tmp/port82-frontend.tar.gz -C . --exclude=node_modules --exclude=dist --exclude=docs --exclude=.git .
scp -i D:/my_key/my_key.pem /tmp/port82-frontend.tar.gz root@150.158.139.177:/root/

# 服务器上
mkdir -p /root/port82-frontend && tar -xzf /root/port82-frontend.tar.gz -C /root/port82-frontend
cd /root/port82-frontend
docker-compose build && docker-compose up -d
```

访问：http://150.158.139.177:82/

> 若 82 端口被 nginx 占用，需先备份并移除 `/etc/nginx/conf.d/port82-frontend.conf` 后 `nginx -s reload`。

## 已做调整

- 标题为 **Time Series complete leaderboard**
- Metric 切换仅一列，表格 `table-fixed`，避免 Model 列抖动
- 已去掉 Footer / Sources / What was missing
- 已剥离 Grok / auth / Docker 等无关脚手架
