
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

export default function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Company Description */}
          <div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('description')}</p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t('contact.title')}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('contact.intro')}</p>
            <p className="mt-2 text-blue-600 hover:underline dark:text-blue-400">{t('contact.email')}</p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('contact.responseTime')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{t('quickLinks.title')}</h3>
            <div className="mt-4 flex flex-col space-y-2">
              <Link href="/" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                {t('quickLinks.home')}
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                {t('quickLinks.aboutUs')}
              </Link>
              <Link
                href="/refund-policy"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                {t('quickLinks.refundPolicy')}
              </Link>
              <Link
                href="/subscription-terms"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                {t('quickLinks.subscriptionTerms')}
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
          {t('copyright')}
        </div>
      </div>
    </footer>
  )
}
