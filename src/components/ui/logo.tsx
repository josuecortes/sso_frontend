type LogoProps = {
  variant?: 'vertical' | 'horizontal'
  className?: string
}

export function Logo({ variant = 'vertical', className }: LogoProps) {
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          SSO
        </div>
        <div className="text-lg text-muted-foreground">
          Seed
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 mb-8 ${className}`}>
      <div className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
        SSO
      </div>
      <div className="text-xl text-muted-foreground">
        Seed
      </div>
    </div>
  );
}
