import { getTranslations } from 'next-intl/server'

import { LocaleSwitcher } from '@/components/locale-switcher'
import LoginModal from '@/components/login/login-modal'
import Logo from '@/components/logo'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export default async function Header({ className }: { className?: string }) {
  const t = await getTranslations('headers')

  return (
    <header
      className={cn(
        'bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur',
        className
      )}
    >
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-foreground hover:text-primary text-sm font-medium transition-colors">
              {t('home')}
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary text-sm font-medium transition-colors">
              {t('about')}
            </Link>
            {/* Add more navigation links as needed */}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LoginModal />
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  )
}