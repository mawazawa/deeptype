/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Component: LoadingState                                                                        ║
 * ║ Description: Loading state component with beautiful animations                                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  className?: string;
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'fancy';
}

const LoadingState: React.FC<LoadingStateProps> = ({
  className,
  message = 'Loading...',
  fullScreen = false,
  size = 'md',
  variant = 'default',
}) => {
  const containerClasses = cn(
    "flex flex-col items-center justify-center gap-4",
    fullScreen && "min-h-screen",
    className
  );

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  if (variant === 'minimal') {
    return (
      <div className={containerClasses}>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full bg-primary/50 animate-bounce",
                dotSizes[size]
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'fancy') {
    return (
      <div className={containerClasses}>
        <div className="relative">
          <div className={cn(
            "relative rounded-lg overflow-hidden bg-gradient-to-r from-background via-primary/5 to-background p-8",
            "before:absolute before:inset-0 before:bg-shimmer before:animate-shimmer"
          )}>
            <Keyboard
              className={cn(
                "text-primary animate-bounce-subtle",
                iconSizes[size]
              )}
              strokeWidth={1.5}
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className={cn(
            "font-medium text-foreground animate-pulse",
            {
              'text-sm': size === 'sm',
              'text-lg': size === 'md',
              'text-xl': size === 'lg',
            }
          )}>
            {message}
          </p>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full bg-primary/50",
                  dotSizes[size],
                  "animate-[bounce_1s_ease-in-out_infinite]"
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={containerClasses}>
      <div className="relative">
        <Keyboard
          className={cn(
            "text-primary animate-pulse",
            iconSizes[size]
          )}
          strokeWidth={1.5}
        />
        <div className="absolute inset-0 bg-shimmer animate-shimmer" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className={cn(
          "font-medium text-foreground",
          {
            'text-sm': size === 'sm',
            'text-lg': size === 'md',
            'text-xl': size === 'lg',
          }
        )}>
          {message}
        </p>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full bg-primary/50 animate-bounce",
                dotSizes[size]
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
