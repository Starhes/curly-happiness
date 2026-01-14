# SwissTarget Proxy - Vercel 版本

基于 Vercel Edge Functions 的反向代理，代理 `https://swisstargetprediction.ch`。

## 功能

- ✅ 反向代理 SwissTargetPrediction
- ✅ 密码认证（Cookie/Header/URL参数）
- ✅ 重定向重写（保持在代理站点内）
- ✅ IP 检查接口

## 部署步骤

### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

### 3. 部署

```bash
cd vercel-proxy
vercel --prod
```

### 4. 配置环境变量（可选）

在 Vercel Dashboard 中配置：
- `AUTH_KEY`: 认证密钥（默认: `Hui123`）
- `TARGET_URL`: 目标网站（默认: `https://swisstargetprediction.ch`）

## 使用方法

### 访问代理

1. 打开 `https://你的域名.vercel.app/`
2. 输入密钥登录
3. 正常使用

### API 端点

```bash
# 检查 IP
curl -H "X-API-Key: Hui123" https://你的域名.vercel.app/api/ip

# 登录 API
curl -X POST -H "Content-Type: application/json" \
     -d '{"key":"Hui123"}' \
     https://你的域名.vercel.app/api/auth/login
```

## 文件结构

```
vercel-proxy/
├── api/
│   ├── _auth.ts          # 认证工具
│   ├── auth/
│   │   └── login.ts      # 登录 API
│   ├── ip.ts             # IP 检查
│   └── proxy.ts          # 主代理逻辑
├── public/
│   └── login.html        # 登录页面
├── package.json
└── vercel.json           # Vercel 配置
```
