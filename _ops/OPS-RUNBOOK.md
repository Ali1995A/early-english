# 幼儿英语口语教程网页运维手册

## 项目结构

```
幼儿英语口语教程/
├── index.html          # 主网页（约60KB，含语音朗读+移动端优化）
├── data.js             # 教程数据（515KB，1128句+1112词）
├── parse-scenes.js     # 数据生成脚本
├── verify.js           # 数据验证脚本
├── _ops/               # 运维文档目录
│   └── OPS-RUNBOOK.md  # 本手册
└── 场景卡片/          # 32个场景源文件
    ├── 场景01_问候与告别.md
    └── ...
```

## 功能特性

### 语音朗读功能
- 使用浏览器原生 Web Speech API
- 语速：0.5（适合幼儿跟读）
- 音调：1.1（更明亮）
- 朗读按钮覆盖位置：
  - 核心口语：每句英文旁 ▶ 按钮
  - 核心词汇：每个单词旁 ▶ 按钮
  - 亲子对话：每句对话旁 ▶ 按钮
  - 教学游戏：每个游戏标题旁 ▶ 按钮（自动提取描述中的英文）
  - 复习要点：每条要点旁 ▶ 按钮（自动提取英文短语）

### 移动端适配
- 手机竖屏（<480px）：单列卡片布局，触摸优化按钮
- 手机横屏（481-767px）：双列词汇网格
- iPad 竖屏（768-1023px）：双列场景布局
- iPad 横屏（1024-1366px）：三列词汇网格，内容居中
- 触摸设备：最小点击区域 36-40px，移除点击高亮

## 日常操作

### 本地预览

```bash
# 方式1：直接打开（无跨域限制，单文件可运行）
start index.html

# 方式2：本地服务器（推荐，支持语音API）
npx serve . -p 3000
# 访问 http://localhost:3000
```

### 修改场景内容后更新

```bash
# 1. 修改 场景卡片/场景XX_XXX.md 文件
# 2. 重新生成数据
node parse-scenes.js

# 3. 验证数据
node verify.js

# 4. 刷新浏览器查看
```

### 数据备份

```bash
# 备份源数据（最重要）
zip -r backup-scenes-$(date +%Y%m%d).zip 场景卡片/

# 完整备份
zip -r backup-full-$(date +%Y%m%d).zip *.html *.js 场景卡片/
```

## 部署方案

### 方案A：VPS + Nginx（推荐）

```bash
# 1. 上传到VPS
scp -r ./* root@74.48.42.20:/var/www/kids-english/

# 2. Nginx配置
```

```nginx
# /etc/nginx/sites-available/kids-english
server {
    listen 80;
    server_name english.yourdomain.com;
    root /var/www/kids-english;
    index index.html;

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1M;
        add_header Cache-Control "public, immutable";
    }

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

```bash
# 3. 启用站点
ln -s /etc/nginx/sites-available/kids-english /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 方案B：GitHub Pages

```bash
# 1. 创建仓库，上传代码
# 2. Settings → Pages → Source: Deploy from branch
# 3. 选择 main 分支 / root
# 4. 访问 https://yourname.github.io/repo-name/
```

### 方案C：Vercel/Netlify

```bash
# Vercel CLI
npx vercel --prod

# Netlify
npx netlify deploy --prod --dir=.
```

#### Vercel 部署说明

- 仓库根目录已提供 `vercel.json`
- 项目是纯静态站点，无需构建命令，无需输出目录配置
- 在 Vercel 导入 GitHub 仓库时，`Framework Preset` 选择 `Other`
- 保持 `Root Directory` 为仓库根目录
- `vercel.json` 会将非静态资源路径重写到 `index.html`，避免后续扩展前端路由时出现 404

## 故障排查

### 页面空白

- 检查 data.js 是否存在且格式正确
- 浏览器F12 → Console查看报错
- 验证：`node verify.js`

### 数据不更新

- 强制刷新：Ctrl+F5
- 检查 parse-scenes.js 是否成功执行
- 查看生成的 data.js 时间戳

### 搜索无结果

- 确认 data.js 正确加载
- 检查搜索关键词是否有特殊字符

### 语音朗读无声音

- 检查系统音量是否开启
- 浏览器标签页是否被静音
- 确认使用 Chrome/Edge/Safari 等现代浏览器
- 首次使用可能需要联网加载语音包
- 按 F12 打开控制台查看是否有权限错误

### 移动端显示异常

- 检查 viewport meta 标签是否正确
- 确认 CSS 媒体查询生效
- 尝试清除浏览器缓存

## 浏览器兼容性

| 浏览器 | 支持情况 | 备注 |
|--------|----------|------|
| Chrome | 完全支持 | 推荐 |
| Edge | 完全支持 | 推荐 |
| Safari | 完全支持 | iOS 需联网加载语音 |
| Firefox | 部分支持 | 语音功能需额外配置 |

## 安全建议

1. **分离敏感数据**：如有用户数据，改用数据库存储，不要放LocalStorage
2. **HTTPS**：生产环境强制使用HTTPS（语音API需要）
3. **备份策略**：每周自动备份场景卡片目录到另一台机器

## 更新记录

| 日期 | 操作 | 执行人 |
|------|------|--------|
| 2026-03-22 | 初始部署 | - |
| 2026-03-22 | 添加语音朗读功能（核心口语、词汇、对话、游戏、复习要点） | - |
| 2026-03-22 | 优化移动端适配（手机、iPad横竖屏） | - |
