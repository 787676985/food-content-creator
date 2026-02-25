# 🍽️ 美食内容创作平台

AI驱动的社交媒体内容创作工具，专注于美食领域，支持抖音、小红书、今日头条等平台。

## ✨ 功能特性

### 📝 AI内容创作助手
- **热点文案生成** - 输入话题，AI自动生成多风格原创文案
- **视频脚本生成** - 输入主题，生成短视频拍摄脚本
- **爆款标题优化** - 输入内容，生成吸引眼球的爆款标题
- **多平台适配** - 同一内容自动适配抖音/小红书/头条等不同风格

### 📊 热点趋势分析
- **实时热点追踪** - 抓取美食领域实时热门话题
- **热门关键词** - 一键选择热门关键词搜索
- **AI趋势分析** - 自动分析热点趋势
- **最佳发布时间** - 显示各时段发布建议

### 🎨 内容素材工具
- **AI封面生成** - 根据描述自动生成精美美食封面图
- **多种风格** - 美食摄影/生活方式/极简/鲜艳活泼
- **模板中心** - 提供探店/食谱/Vlog/科普模板

### 📱 多平台管理
- **数据概览** - 总发布数/点赞/评论/分享统计
- **发布历史** - 查看历史发布记录和数据表现
- **账号管理** - 小红书/抖音账号连接状态

## 🚀 快速开始

### 方式一：本地开发

```bash
# 克隆项目
git clone https://github.com/787676985/food-content-creator.git
cd food-content-creator

# 安装依赖
bun install

# 启动开发服务器
bun run dev
```

访问 http://localhost:3000

### 方式二：Docker部署

```bash
# 克隆项目
git clone https://github.com/787676985/food-content-creator.git
cd food-content-creator

# 使用Docker Compose启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

访问 http://localhost:3000

### 方式三：Docker手动构建

```bash
# 构建镜像
docker build -t food-content-creator .

# 运行容器
docker run -d -p 3000:3000 --name food-content-creator food-content-creator
```

## 🛠️ 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **动画**: Framer Motion
- **AI能力**: z-ai-web-dev-sdk
- **运行时**: Bun

## 📁 项目结构

```
food-content-creator/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 主页面
│   │   ├── layout.tsx        # 布局
│   │   └── api/              # API路由
│   │       ├── content/      # 内容生成API
│   │       ├── trends/       # 热点搜索API
│   │       └── images/       # 图片生成API
│   └── components/           # UI组件
├── public/                   # 静态资源
├── Dockerfile               # Docker配置
├── docker-compose.yml       # Docker Compose配置
└── package.json             # 项目配置
```

## 🔧 环境变量

创建 `.env` 文件配置环境变量：

```env
# 可选：API密钥配置
# OPENAI_API_KEY=your_api_key
```

## 📄 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
