// @ts-check
import { defineConfig } from 'astro/config';
import { visit } from 'unist-util-visit';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// GitHub Pages 子路径。若以后绑定独立域名，改成 '/' 即可。
const BASE = '/ColorLore';

/** 把 markdown 里相对路径的图片（images/xx/yy.png）改写为带 base 的绝对路径 */
function remarkContentImages() {
  return (tree) => {
    visit(tree, 'image', (node) => {
      if (/^(https?:|data:|#|\/)/i.test(node.url)) return;
      node.url = `${BASE}/${node.url.replace(/^\.\//, '')}`;
    });
  };
}

const headingText = (node) =>
  (node.children ?? [])
    .filter((c) => c.type === 'text' || c.type === 'inlineCode')
    .map((c) => c.value)
    .join('')
    .trim();

/** 文章排版整理：去掉「标题/正文」小节标记、合并连续图片为画廊、识别标签行 */
function remarkPolishArticle() {
  return (tree) => {
    const kids = tree.children;
    for (let i = 0; i < kids.length; i++) {
      const node = kids[i];

      if (node.type === 'heading' && node.depth === 3) {
        const label = headingText(node);
        if (label !== '标题' && label !== '正文') continue;
        const next = kids[i + 1];
        kids.splice(i, 1);
        i--;
        // 「标题」的下一行是真正的文章标题，提升为大标题（h4）
        if (label === '标题' && next && next.type === 'paragraph') {
          next.type = 'heading';
          next.depth = 4;
        }
        continue;
      }

      if (
        node.type === 'paragraph' &&
        node.children.length === 1 &&
        node.children[0].type === 'image'
      ) {
        // 相邻的纯图片段落合并成一个画廊段落
        let j = i + 1;
        while (
          j < kids.length &&
          kids[j].type === 'paragraph' &&
          kids[j].children.length === 1 &&
          kids[j].children[0].type === 'image'
        ) {
          node.children.push(kids[j].children[0]);
          kids.splice(j, 1);
        }
        node.data = { hProperties: { class: 'gallery' } };
        continue;
      }

      if (node.type === 'paragraph') {
        const first = node.children.find((c) => c.type === 'text');
        if (first && /^[#＃]/.test(first.value.trim())) {
          node.data = { hProperties: { class: 'post-tags' } };
        }
      }
    }
  };
}

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

/** 仓库根目录的 images/ 保持原位（GitHub 上也要能预览）：开发时用中间件伺服，构建时拷进 dist */
function contentImages() {
  const imagesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'images');
  return {
    name: 'content-images',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          let pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
          if (pathname.startsWith(`${BASE}/`)) pathname = pathname.slice(BASE.length);
          if (!pathname.startsWith('/images/')) return next();
          const rel = decodeURIComponent(pathname.slice('/images/'.length));
          const file = path.normalize(path.join(imagesDir, rel));
          if (!file.startsWith(imagesDir) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
            res.statusCode = 404;
            return res.end('Not found');
          }
          res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream');
          fs.createReadStream(file).pipe(res);
        });
      },
      'astro:build:done': async ({ dir }) => {
        await fs.promises.cp(imagesDir, path.join(fileURLToPath(dir), 'images'), { recursive: true });
      },
    },
  };
}

export default defineConfig({
  site: 'https://azrng.github.io',
  base: BASE,
  integrations: [contentImages()],
  markdown: { remarkPlugins: [remarkContentImages, remarkPolishArticle] },
});
