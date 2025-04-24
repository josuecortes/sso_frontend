'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'

export function Sidebar() {
  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/roles', label: 'Roles' },
    { href: '/location-types', label: 'Location Types' },
    { href: '/organizational-unit-types', label: 'Org Unit Types' },
    { href: '/organizational-units', label: 'Org Units' },
    { href: '/positions', label: 'Positions' },
  ]

  return (
    <aside className="w-64 bg-gray-50 border-r min-h-screen">
      <div className="h-16 flex items-center px-6 border-b">
        <Logo variant="horizontal" />
      </div>
      <nav className="p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'block px-4 py-2 rounded hover:bg-gray-100 text-sm font-medium'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
