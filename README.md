# API Transit Frontend

基于 React + TypeScript + Vite + shadcn/ui 的 API 网关管理前端。

## 技术栈

- React 18
- TypeScript
- Vite 6
- TailwindCSS 3
- shadcn/ui
- React Router v7
- TanStack Query (React Query)
- Recharts
- Axios

## 开发

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev

# 构建生产版本
yarn build

# 预览生产构建
yarn preview
```

## 功能模块

- **仪表盘**：总览统计、请求趋势图表
- **上游管理**：配置和管理 API 上游服务
- **Token 管理**：创建和管理 API 访问令牌
- **路由规则**：配置请求路径改写规则
- **统计分析**：查看详细的调用统计数据

## API 代理

开发环境下，Vite 会将 `/admin` 路径代理到 `http://localhost:8080`。

## 环境变量

创建 `.env.local` 文件配置环境变量：

```env
VITE_API_BASE_URL=http://localhost:8080
```
