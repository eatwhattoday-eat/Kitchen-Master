# 今天吃什么 · Cook 🍳

根据厨房里的食材和厨具，**一键算出今天能做什么菜**。

---

## ✨ 功能

- **🏠 今天吃啥** — 输入食材自动匹配菜谱，完美匹配 / 差一点就能做 / 🍰 甜品专区
- **🔪 我的厨房** — 食材库存管理，搜索+分类快速添加，过期提醒一键清理
- **📖 菜谱库** — 701 道菜（599 道家常 + 102 道甜品），支持搜索、分类筛选、B站视频教程
- **🛒 购物清单** — 缺的食材一键加入清单，买好直接入库
- **🌙 暗色模式** — 跟随系统自动切换
- **📱 iOS App** — Capacitor 封装，GitHub Actions 自动构建

## 📸 截图

| 首页 | 菜谱详情 | 厨房 |
|------|---------|------|
| ![首页](docs/home.png) | ![详情](docs/detail.png) | ![厨房](docs/kitchen.png) |

## 🛠 技术栈

Vue 3 + Vite + Pinia + Dexie + Capacitor

## 🚀 开发

```bash
cd cook-vite
npm install
npm run dev      # 启动 http://localhost:5173
npm run build    # 构建
```

## 📱 iOS 构建

Push 到 GitHub 后，Actions 自动构建 iOS App（无需本地 Xcode）。

手动触发：Actions → Build iOS App → Run workflow → 下载 .ipa
