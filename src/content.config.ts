import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const colors = defineCollection({
  // 文章直接以仓库根目录的 md 文件为数据源（README 除外）
  loader: glob({
    pattern: ['*.md', '!README.md'],
    base: './',
    generateId: ({ entry, data }) =>
      (data?.slug as string | undefined) ?? entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    name: z.string(),
    slug: z.string().optional(),
    hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'hex 需为 #RRGGBB 格式'),
    order: z.number().default(99),
  }),
});

export const collections = { colors };
