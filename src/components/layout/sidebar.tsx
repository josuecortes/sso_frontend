'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/roles', label: 'Roles' },
    { href: '/location-types', label: 'Location Types' },
    { href: '/organizational-unit-types', label: 'Org Unit Types' },
    { href: '/organizational-units', label: 'Org Units' },
    { href: '/positions', label: 'Positions' },
  ]

  return (
    <aside className="w-64 bg-muted/50 border-r min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b justify-between">
        <Logo variant="horizontal" />
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'block px-4 py-2 rounded hover:bg-accent text-sm font-medium text-foreground'
            )}
            onClick={onClose}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
