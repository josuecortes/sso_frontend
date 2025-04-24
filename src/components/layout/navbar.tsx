'use client'

import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleProfileClick = () => {
    router.push('/dashboard/profile')
  }

  // Pega as iniciais do email para usar como fallback do avatar
  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  return (
    <header className="h-16 bg-background border-b px-4 lg:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <ThemeToggle />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 px-2 lg:px-3 py-2 rounded-full hover:bg-accent"
          >
            <span className="text-sm text-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {user?.email ? getInitials(user.email) : '??'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleProfileClick}>
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
