# 中草药识别系统 - 前端

基于 Vue 3 + TypeScript + Vite 的中草药识别前端应用。

## 技术栈

- **框架**: Vue 3.5 + TypeScript
- **构建工具**: Vite 7
- **状态管理**: Pinia
- **路由**: Vue Router 5
- **HTTP 客户端**: Axios
- **UI**: 自定义 CSS 变量主题

## 功能模块

- 用户登录/注册
- 中草药拍照识别
- 药材百科查询
- 识别历史记录
- 个人中心（修改密码）
- 管理后台（药材/用户管理）

## 快速开始

### 环境要求

- Node.js 20+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 项目结构

```
src/
├── api/          # API 接口
├── assets/       # 静态资源
├── components/   # 通用组件
├── composables/  # 组合式函数
├── layouts/      # 布局组件
├── router/       # 路由配置
├── stores/       # Pinia 状态管理
├── styles/       # 全局样式
├── types/        # TypeScript 类型
├── utils/        # 工具函数
├── views/        # 页面组件
├── App.vue       # 根组件
└── main.ts       # 入口文件
```

## Docker 部署

### 前置条件

确保后端容器已运行并发布在 8080 端口：

```bash
docker ps | grep herb-api
```

### 构建并启动

```bash
# 构建并启动前端容器
docker-compose up -d --build

# 查看日志
docker logs -f herb-frontend

# 访问 http://localhost
```

### 网络配置

前端容器需要能访问后端容器，执行一次即可：

```bash
docker network connect herbrecognition-fe_herb-network herb-api
```

### 常用命令

```bash
# 重启前端
docker-compose restart frontend

# 停止服务
docker-compose down

# 重新构建（清除缓存）
docker-compose build --no-cache frontend

# 查看容器状态
docker ps | grep herb-frontend
```

## 外网部署

### 方案 1：云服务器直接部署

1. 将代码上传到服务器
2. 确保后端容器运行在 8080 端口
3. 执行 `docker-compose up -d --build`
4. 开放服务器 80 端口防火墙

### 方案 2：自定义端口

修改 `docker-compose.yml`：

```yaml
ports:
  - "8080:80" # 外部访问 8080，内部 80
```

### 方案 3：绑定域名

修改 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    # ...
}
```

## API 配置

开发环境代理配置在 `vite.config.ts`：

```typescript
server: {
  proxy: {
    '/api': 'http://localhost:8080',
    '/uploads': 'http://localhost:8080',
  }
}
```

生产环境由 Nginx 反向代理到后端容器。

## 环境变量

| 变量              | 说明         | 默认值         |
| ----------------- | ------------ | -------------- |
| VITE_API_BASE_URL | API 基础地址 | 空（使用代理） |

## 相关项目

- 后端 API: [herb-recognition-be](https://github.com/NaseemLi/HerbRecognition-be)
