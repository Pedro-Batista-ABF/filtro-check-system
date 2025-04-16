
import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  className?: string;
  disabled?: boolean;
  count?: number;
}

export default function FeatureCard({
  title,
  description,
  icon,
  to,
  onClick,
  variant = 'default',
  className,
  disabled = false,
  count
}: FeatureCardProps) {
  const cardContent = (
    <Card 
      className={cn(
        "transition-all duration-200 h-full", 
        !disabled && !onClick && to && "hover:shadow-md hover:border-primary/50",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        {icon && <div className="h-8 w-8 text-primary/70">{icon}</div>}
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
        
        {typeof count === 'number' && (
          <div className="mt-4">
            <p className="text-3xl font-bold text-primary">{count}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (disabled) {
    return cardContent;
  }

  if (onClick) {
    return (
      <button 
        onClick={onClick} 
        className="w-full text-left"
        disabled={disabled}
      >
        {cardContent}
      </button>
    );
  }

  if (to) {
    return (
      <Link to={to} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
