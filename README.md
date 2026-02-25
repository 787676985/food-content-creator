# 🍽️🐱 内容创作平台

AI驱动的内容创作平台，支持**美食**和**宠物**两个领域，帮助创作者快速生成爆款内容。

## ✨ 功能特性

### 🎯 双领域支持
- **美食领域** - 美食探店、食谱分享、美食测评
- **宠物领域** - 萌宠日常、养宠攻略、宠物训练

### 📝 AI内容创作
- **热点文案生成** - 输入话题，AI自动生成多风格原创文案
- **视频脚本生成** - 输入主题，生成短视频拍摄脚本
- **爆款标题优化** - 输入内容，生成吸引眼球的爆款标题
- **多平台适配** - 同一内容自动适配抖音/小红书/头条等不同风格

### 🎨 AI封面生成
- 根据描述自动生成精美封面图
- 多种风格选择：美食摄影/生活方式/极简/鲜艳活泼

### 📱 社交账号管理
- 添加和管理多个社交媒体账号
- 支持抖音、小红书、今日头条
- 查看账号数据和发布统计

### 📄 内容管理
- 保存和管理创作的内容
- 草稿和已发布状态管理
- 数据统计（点赞、评论、分享）

### ⚙️ AI服务配置
- 支持多种AI服务商：OpenAI、DeepSeek、Claude、智谱AI、Moonshot、通义千问
- 自定义API地址，兼容所有OpenAI格式接口
- 配置持久化存储，重启不丢失

## 🚀 快速开始

### 方式一：极空间部署（推荐）

复制以下YAML到极空间编辑器：

```yaml
services:
  content-creator:
    image: oven/bun:1-alpine
    container_name: content-creator
    restart: unless-stopped
    user: root
    ports:
      - "3020:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
    working_dir: /app
    volumes:
      - content-data:/app
      - content-db:/app/prisma
    command: >
      sh -c "
        apk add --no-cache git openssl &&
        if [ ! -f /app/package.json ]; then
          git clone --depth 1 https://github.com/787676985/food-content-creator.git /app
        fi &&
        cd /app &&
        bun install &&
        bunx prisma generate &&
        bunx prisma db push --skip-generate &&
        bun run build &&
        exec node .next/standalone/server.js
      "
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 180s

volumes:
  content-data:
  content-db:
```

### 方式二：本地开发

```bash
# 克隆项目
git clone https://github.com/787676985/food-content-creator.git
cd food-content-creator

# 安装依赖
bun install

# 初始化数据库
bunx prisma generate
bunx prisma db push

# 启动开发服务器
bun run dev
```

访问 http://localhost:3000

### 方式三：Docker Compose

```bash
# 克隆项目
git clone https://github.com/787676985/food-content-creator.git
cd food-content-creator

# 启动服务
docker-compose up -d --build
```

## ⚙️ AI服务配置

### 在平台内配置

1. 点击右上角 **"设置"** 按钮
2. 选择 **AI服务商**
3. 输入 **API Key**
4. 选择 **模型**
5. 开启 **启用开关**
6. 点击 **保存配置**

### 支持的AI服务商

| 服务商 | API地址 | 支持模型 |
|--------|---------|----------|
| OpenAI | api.openai.com | GPT-4o, GPT-4, GPT-3.5 |
| DeepSeek | api.deepseek.com | deepseek-chat, deepseek-coder |
| Claude | api.anthropic.com | claude-3.5-sonnet, claude-3-opus |
| 智谱AI | open.bigmodel.cn | glm-4-plus, glm-4-flash |
| Moonshot | api.moonshot.cn | moonshot-v1-8k/32k/128k |
| 通义千问 | dashscope.aliyuncs.com | qwen-turbo, qwen-plus, qwen-max |

## 🛠️ 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **动画**: Framer Motion
- **数据库**: SQLite + Prisma
- **AI能力**: z-ai-web-dev-sdk
- **运行时**: Bun

## 📁 项目结构

```
content-creator/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 主页面
│   │   ├── layout.tsx        # 布局
│   │   └── api/              # API路由
│   │       ├── config/       # 配置API
│   │       ├── accounts/     # 账号管理API
│   │       ├── contents/     # 内容管理API
│   │       ├── content/      # 内容生成API
│   │       └── images/       # 图片生成API
│   ├── components/           # UI组件
│   └── lib/                  # 工具库
├── prisma/
│   └── schema.prisma         # 数据库模型
├── Dockerfile
├── docker-compose.yml
└── docker-compose-zspace.yml # 极空间专用配置
```

## 📄 License

MIT License
