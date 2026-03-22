# 幼儿英语口语教程网页 - 运维文档

## 项目概述

- **项目路径**: `D:\Soft\MyCode\MY-notebook\30_研究\教育\幼儿英语口语教程`
- **技术栈**: 纯前端（HTML + CSS + JavaScript），无需后端
- **数据存储**: 本地 JSON（data.js），浏览器 LocalStorage（收藏/进度）

## 文件结构

```
幼儿英语口语教程/
├── index.html          # 主网页（约60KB）
├── data.js             # 教程数据（515KB，1128句口语+1112个词汇）
├── parse-scenes.js     # 数据生成脚本（从场景卡片生成data.js）
├── verify.js           # 数据验证脚本
├── _ops/               # 运维文档备份
│   └── OPS-RUNBOOK.md
└── 场景卡片/           # 32个场景源文件（Markdown格式）
    ├── 场景01_问候与告别.md
    ├── 场景02_家庭成员称呼.md
    └── ...
```

## 功能清单

### 已实现功能
- [x] 8个阶段，32个生活场景
- [x] 核心口语（1128句）
- [x] 核心词汇（1112个）
- [x] 亲子对话示例
- [x] 教学游戏活动
- [x] 复习要点清单
- [x] 家长贴士
- [x] 收藏功能（LocalStorage）
- [x] 学习进度记录
- [x] 全文搜索
- [x] **语音朗读**（Web Speech API）
- [x] **移动端适配**（手机+iPad横竖屏）

### 语音朗读覆盖
- 核心口语：每句旁 ▶ 按钮
- 核心词汇：每个单词旁 ▶ 按钮
- 亲子对话：每句旁 ▶ 按钮
- 教学游戏：每游戏旁 ▶ 按钮
- 复习要点：每条旁 ▶ 按钮

## 本地运行

```bash
# 方式1：直接打开
start index.html

# 方式2：本地服务器（推荐，语音功能需要）
npx serve . -p 3000
# 访问 http://localhost:3000
```

## 修改内容 workflow

```bash
# 1. 修改场景源文件
# 编辑 场景卡片/场景XX_XXX.md

# 2. 重新生成数据
node parse-scenes.js

# 3. 验证数据完整性
node verify.js

# 4. 刷新浏览器查看效果
```

## 部署上线

### GitHub Pages（免费推荐）
```bash
# 1. 上传代码到GitHub仓库
# 2. Settings → Pages → Source: Deploy from branch
# 3. 选择 main 分支 / root
# 4. 访问 https://username.github.io/repo-name/
```

### Vercel（零配置静态部署）
```bash
# 方式1：导入 GitHub 仓库
# 1. 在 Vercel 中选择 New Project
# 2. 导入 early-english 仓库
# 3. Framework Preset 选择 Other
# 4. Root Directory 保持 ./
# 5. 直接 Deploy

# 方式2：CLI 部署
npx vercel
npx vercel --prod
```

- 仓库已包含 `vercel.json`
- 所有非静态文件路径会重写到 `index.html`，便于单页应用式导航
- 无需 Node 服务端，也无需构建步骤

### VPS + Nginx
```bash
# 上传
scp -r ./* root@your-vps:/var/www/kids-english/

# Nginx配置
server {
    listen 80;
    server_name english.yourdomain.com;
    root /var/www/kids-english;
    index index.html;
    gzip on;
}
```

## 浏览器兼容性

| 浏览器 | 支持 | 备注 |
|--------|------|------|
| Chrome | 完全 | 推荐 |
| Edge | 完全 | 推荐 |
| Safari | 完全 | iOS需联网 |
| Firefox | 部分 | 语音需配置 |

## 常见问题

### 页面空白
- 检查 data.js 是否存在
- F12控制台查看报错
- 运行 `node verify.js`

### 语音不朗读
- 检查系统音量
- 确认浏览器支持 Web Speech API
- 使用HTTPS或localhost

### 数据修改后不生效
- Ctrl+F5 强制刷新
- 重新运行 `node parse-scenes.js`

## 备份策略

```bash
# 备份源数据（最重要）
zip -r backup-scenes-$(date +%Y%m%d).zip 场景卡片/

# 完整备份
zip -r backup-full-$(date +%Y%m%d).zip *.html *.js 场景卡片/
```

## 更新记录

| 日期 | 修改内容 |
|------|----------|
| 2026-03-22 | 初始版本 |
| 2026-03-22 | 添加语音朗读功能 |
| 2026-03-22 | 优化移动端适配 |
