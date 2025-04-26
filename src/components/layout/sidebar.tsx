'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { LayoutDashboard, Shield, MapPin, Building2, Users, Briefcase } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      href: '/dashboard/roles',
      label: 'Permissões',
      icon: Shield
    },
    {
      href: '/dashboard/location-types',
      label: 'Tipos de Local',
      icon: MapPin
    },
    {
      href: '/dashboard/org-unit-types',
      label: 'Tipos de Unidade',
      icon: Building2
    },
    {
      href: '/dashboard/org-units',
      label: 'Unidades',
      icon: Users
    },
    {
      href: '/dashboard/positions',
      label: 'Cargos',
      icon: Briefcase
    }
  ];

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
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive 
                  ? "bg-gray-800 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  )
}
