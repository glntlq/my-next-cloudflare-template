'use client'

import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

export default function Page() {
  const t = useTranslations('AboutPage')
  return (
    <div>
      <p>{t('title')}</p>
      <Link href="/">{t('home')}</Link>
    </div>
  )
}