
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Star, 
  Heart, 
  TrendingUp, 
  Users,
  Award,
  Calendar
} from 'lucide-react';
import { RestaurantProfile } from '@/hooks/useRestaurantProfile';

interface RestaurantStatsSectionProps {
  restaurant: RestaurantProfile;
}

export default function RestaurantStatsSection({ restaurant }: RestaurantStatsSectionProps) {
  const stats = [
    {
      icon: Star,
      label: 'Valoración',
      value: restaurant.google_rating ? `${restaurant.google_rating}/5` : 'N/A',
      subValue: restaurant.google_rating_count ? `${restaurant.google_rating_count} reseñas` : '',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      icon: Heart,
      label: 'Favoritos Totales',
      value: restaurant.favorites_count.toString(),
      subValue: 'usuarios',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      icon: TrendingUp,
      label: 'Esta Semana',
      value: `+${restaurant.favorites_count_week}`,
      subValue: 'nuevos favoritos',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Calendar,
      label: 'Este Mes',
      value: `+${restaurant.favorites_count_month}`,
      subValue: 'favoritos del mes',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {stats.map((stat, index) => (
        <Card key={index} className={`border-2 ${stat.borderColor} hover:shadow-lg transition-all duration-300 hover:scale-105`}>
          <CardContent className={`p-6 ${stat.bgColor}`}>
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div className="text-right">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                {stat.label}
              </div>
              {stat.subValue && (
                <div className="text-xs text-gray-600">
                  {stat.subValue}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
