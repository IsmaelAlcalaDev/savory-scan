
import { Badge } from '@/components/ui/badge';

interface DietPercentageBadgesProps {
  veganPct?: number;
  vegetarianPct?: number;
  glutenFreePct?: number;
  healthyPct?: number;
  itemsTotal?: number;
  showZero?: boolean;
  maxBadges?: number;
}

export default function DietPercentageBadges({
  veganPct = 0,
  vegetarianPct = 0,
  glutenFreePct = 0,
  healthyPct = 0,
  itemsTotal = 0,
  showZero = false,
  maxBadges = 3
}: DietPercentageBadgesProps) {
  if (itemsTotal === 0) {
    return null;
  }

  const badges = [
    {
      label: 'Vegano',
      percentage: veganPct,
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      emoji: '🌱'
    },
    {
      label: 'Vegetariano', 
      percentage: vegetarianPct,
      color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
      emoji: '🥬'
    },
    {
      label: 'Sin Gluten',
      percentage: glutenFreePct,
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      emoji: '🌾'
    },
    {
      label: 'Saludable',
      percentage: healthyPct,
      color: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      emoji: '💪'
    }
  ];

  // Filter and sort badges
  const visibleBadges = badges
    .filter(badge => showZero || badge.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, maxBadges);

  if (visibleBadges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {visibleBadges.map((badge, index) => (
        <Badge
          key={badge.label}
          variant="secondary"
          className={`text-xs ${badge.color} transition-colors`}
        >
          <span className="mr-1">{badge.emoji}</span>
          {Math.round(badge.percentage)}%
        </Badge>
      ))}
    </div>
  );
}
