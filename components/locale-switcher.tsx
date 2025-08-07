'use client'

import { Check, Globe } from 'lucide-react'
import { Locale, useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import { useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { usePathname, useRouter } from '@/i18n/navigation'
import { locales } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type Props = {
  defaultValue: string
}

export function LocaleSwitcherSelect({ defaultValue }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()
  const params = useParams()

  function onLocaleSelect(locale: Locale) {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale }
      )
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('flex h-9 items-center gap-1 px-2', isPending && 'pointer-events-none opacity-50')}
          disabled={isPending}
        >
          <Globe className="size-4" />
          <span className="text-sm font-medium">{defaultValue}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            className="flex items-center justify-between"
            onClick={() => onLocaleSelect(locale.code)}
          >
            <span>{locale.name}</span>
            {defaultValue === locale.name && <Check className="ml-2 size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function LocaleSwitcher() {
  const locale = useLocale()

  const name = locales.find((i) => i.code === locale)?.name ?? 'Unknown'

  return <LocaleSwitcherSelect defaultValue={name} />
}