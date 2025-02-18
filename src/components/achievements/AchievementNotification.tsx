/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Component: AchievementNotification                                                             ║
 * ║ Description: Toast notification component for unlocked achievements                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AchievementNotificationProps {
  name: string;
  description: string;
  icon: LucideIcon;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const rarityColors = {
  common: 'bg-slate-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500'
};

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  name,
  description,
  icon: Icon,
  rarity
}) => {
  return (
    <div className="flex items-center space-x-3 p-2">
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center",
        "bg-gradient-to-br from-background/50 to-background",
        "border-2",
        {
          'border-slate-500': rarity === 'common',
          'border-blue-500': rarity === 'rare',
          'border-purple-500': rarity === 'epic',
          'border-yellow-500': rarity === 'legendary',
        }
      )}>
        <Icon className={cn(
          "w-6 h-6",
          {
            'text-slate-400': rarity === 'common',
            'text-blue-400': rarity === 'rare',
            'text-purple-400': rarity === 'epic',
            'text-yellow-400': rarity === 'legendary',
          }
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm truncate">{name}</h4>
          <Badge variant="secondary" className={cn(
            "text-[10px] px-1.5 py-0.5",
            rarityColors[rarity]
          )}>
            {rarity.toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>
    </div>
  );
};

export default AchievementNotification;