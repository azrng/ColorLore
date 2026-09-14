import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const colors = defineCollection({
  // 颜色文章统一放在 content/ 目录
  loader: glob({
    pattern: '*.md',
    base: './contents',
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
