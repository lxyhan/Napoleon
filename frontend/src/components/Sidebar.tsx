'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import Home from '@/app/page'

const navigation = [
  { name: 'Today', href: '/today', icon: HomeIcon },
  { name: 'Dashboard', href: '/dashboard', icon: CalendarIcon },
  { name: 'Profile', href: '/profile', icon: UsersIcon },
//   { name: 'Reports', href: '/reports', icon: ChartPieIcon },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-20 overflow-y-auto bg-gray-100 pb-4">
        {/* Sidebar header (Logo) */}

        {/* Navigation */}
        <nav className="mt-8">
          <ul role="list" className="flex flex-col items-center space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={classNames(
                    pathname === item.href
                      ? 'bg-gray-200 text-grey-800'
                      : 'text-gray-400 hover:bg-gray-200 hover:text-grey-800',
                    'group flex gap-x-3 rounded-md p-3 text-sm/6 font-semibold'
                  )}
                >
                  <item.icon aria-hidden="true" className="h-6 w-6 shrink-0" />
                  <span className="sr-only">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-20">
        {children}
      </main>
    </div>
  )
}
