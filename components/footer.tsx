import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

export default function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Company Description */}
          <div>
            <p className="text-muted-foreground mt-2">{t('description')}</p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-foreground text-lg font-semibold">{t('contact.title')}</h3>
            <p className="text-muted-foreground mt-2">{t('contact.intro')}</p>
            <p className="text-primary mt-2 hover:underline">{t('contact.email')}</p>
            <p className="text-muted-foreground mt-2">{t('contact.responseTime')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground text-lg font-semibold">{t('quickLinks.title')}</h3>
            <div className="mt-4 flex flex-col space-y-2">
              <Link href="/" className="text-muted-foreground hover:text-primary">
                {t('quickLinks.home')}
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-primary">
                {t('quickLinks.aboutUs')}
              </Link>
              <Link href="/refund-policy" className="text-muted-foreground hover:text-primary">
                {t('quickLinks.refundPolicy')}
              </Link>
              <Link href="/subscription-terms" className="text-muted-foreground hover:text-primary">
                {t('quickLinks.subscriptionTerms')}
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-border text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
          {t('copyright')}
        </div>
      </div>
    </footer>
  )
}