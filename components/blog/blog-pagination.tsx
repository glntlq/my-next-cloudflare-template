'use client'

import { useSearchParams } from 'next/navigation'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { usePathname } from '@/i18n/navigation'

interface BlogPaginationProps {
  currentPage: number
  totalPages: number
}

export function BlogPagination({ currentPage, totalPages }: BlogPaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  // 如果只有一页，不显示分页
  if (totalPages <= 1) return null

  // 计算要显示的页码
  const getPageNumbers = () => {
    const pages = []

    // 始终显示第一页
    pages.push(1)

    // 当前页附近的页码
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 2 && currentPage > 3) {
        pages.push('ellipsis-start')
      } else if (i === totalPages - 1 && currentPage < totalPages - 2) {
        pages.push('ellipsis-end')
      } else {
        pages.push(i)
      }
    }

    // 始终显示最后一页（如果有多页）
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    // 去重
    return Array.from(new Set(pages))
  }

  const pageNumbers = getPageNumbers()

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={createPageURL(currentPage - 1)}
            aria-disabled={currentPage <= 1}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }

          return (
            <PaginationItem key={page}>
              <PaginationLink href={createPageURL(page as number)} isActive={page === currentPage}>
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          <PaginationNext
            href={createPageURL(currentPage + 1)}
            aria-disabled={currentPage >= totalPages}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}