# ColorLore · 中国传统色

一个基于 [Astro](https://astro.build) 的中国传统颜色内容站：左侧是颜色列表，右侧是对应的文章内容，点开一个颜色，整个页面会染上它的底色。

线上地址：https://azrng.github.io/ColorLore/

## 新增一个颜色

1. 在仓库根目录新建 `颜色名.md`，顶部加上 frontmatter：

   ```yaml
   ---
   name: 赤金
   slug: chijin
   hex: "#EACD76"
   order: 3
   ---
   ```

   - `name`：显示名
   - `slug`：URL 用的拼音（不要与其他颜色重复）
   - `hex`：该颜色的色值，决定整站的背景与强调色
   - `order`：左侧列表的排序

2. 正文按现有文章的结构写：若干个 `## 小节`，每个小节里 `### 标题` 的下一行会被渲染为该小节的大标题，`### 正文` 标记本身会被忽略。
3. 图片放进 `images/颜色名/`，在文章里用相对路径引用（如 `images/赤金/01-01.png`），这样在 GitHub 上也能直接预览；连续多张图片会自动并排展示。行首的 `#标签 #标签` 会渲染成标签样式。
4. 提交推送到 `main` 分支，GitHub Actions 会自动构建发布。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321/ColorLore/
npm run build    # 构建产物在 dist/
npm run preview  # 本地预览构建产物
```

## 部署

站点托管在 GitHub Pages，部署方式为 GitHub Actions（见 `.github/workflows/deploy.yml`）。仓库只需在 Settings → Pages → Build and deployment 里把 Source 设为 **GitHub Actions**，之后每次推送 `main` 分支都会自动发布。
