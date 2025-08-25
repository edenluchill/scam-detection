# 诈骗检测助手

一个基于 Next.js + shadcn/ui + Tailwind CSS 的诈骗检测网站，帮助用户在加拿大检查电话号码和邮箱地址的安全性。

## 功能特点

- 🔍 **智能检测**: 支持电话号码和邮箱地址的诈骗风险评估
- 🌐 **网络搜索**: 模拟 Google 搜索、社交媒体检查等多源信息整合
- 📊 **风险评分**: 提供 0-100 的风险评分和详细建议
- 🎨 **现代界面**: 使用 shadcn/ui 组件库，界面美观直观
- 📱 **响应式设计**: 完美适配桌面和移动设备
- ⚡ **实时分析**: 快速返回分析结果

## 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **组件**: shadcn/ui + Radix UI
- **图标**: Lucide React
- **语言**: TypeScript

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 3. 访问应用

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
scam-detection/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/analyze/        # 分析API接口
│   │   ├── globals.css         # 全局样式
│   │   ├── layout.tsx          # 根布局
│   │   └── page.tsx            # 主页面
│   ├── components/             # React组件
│   │   ├── ui/                 # shadcn/ui组件
│   │   └── LoadingSpinner.tsx  # 加载动画组件
│   └── lib/
│       └── utils.ts            # 工具函数
├── components.json             # shadcn/ui配置
├── tailwind.config.js          # Tailwind配置
├── tsconfig.json              # TypeScript配置
└── package.json               # 项目依赖
```

## API 接口

### POST /api/analyze

分析电话号码或邮箱地址的诈骗风险。

**请求参数:**

```json
{
  "query": "example@email.com",
  "type": "email"
}
```

**响应格式:**

```json
{
  "query": "example@email.com",
  "type": "email",
  "findings": [
    {
      "source": "Google 搜索结果",
      "content": "未发现明显的诈骗举报",
      "severity": "low",
      "date": "2024-01-25"
    }
  ],
  "riskScore": 15,
  "recommendation": "✅ 低风险：未发现明显的诈骗迹象，但仍需保持警惕",
  "summary": "目前未发现明显的诈骗指标，但请继续保持谨慎"
}
```

## 使用说明

1. **选择检测类型**: 选择要检测的是邮箱地址还是电话号码
2. **输入信息**: 在输入框中输入要检查的邮箱或电话号码
3. **开始检查**: 点击"开始检查"按钮或按回车键
4. **查看结果**: 系统会显示风险评分、详细发现和安全建议

## 风险评分说明

- **70-100 分**: 高风险，强烈建议避免接触
- **40-69 分**: 中等风险，需要谨慎处理
- **0-39 分**: 低风险，但仍需保持警惕

## 开发说明

这是一个演示项目，当前使用模拟数据。在实际部署中，您需要：

1. 集成真实的搜索 API（如 Google Custom Search API）
2. 连接社交媒体平台的 API
3. 集成诈骗数据库
4. 添加用户认证和数据持久化
5. 实施更复杂的风险评估算法

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

MIT License
