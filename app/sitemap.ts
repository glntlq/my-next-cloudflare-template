import { MetadataRoute } from 'next'

import { locales } from '@/i18n/routing'

export const runtime = 'edge'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // 定义所有路由（不包含语言代码）
  const routes = ['', '/about']

  // 为每个路由和每种语言创建sitemap条目
  const entries: MetadataRoute.Sitemap = []

  for (const route of routes) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale.code}${route}`
      })
    }
  }

  return entries
}