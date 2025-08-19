
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RestaurantSchedule {
  id: number;
  restaurant_id: number;
  day_of_week: number;
  is_closed: boolean;
  first_opening_time?: string;
  first_closing_time?: string;
  second_opening_time?: string;
  second_closing_time?: string;
  notes?: string;
  is_active: boolean;
  has_split_schedule?: boolean;
  formatted_schedule?: string;
}

export const useRestaurantSchedules = (restaurantId: number) => {
  const [schedules, setSchedules] = useState<RestaurantSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('restaurant_schedules')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .order('day_of_week');

        if (fetchError) {
          throw fetchError;
        }

        const formattedSchedules = (data || []).map(schedule => ({
          ...schedule,
          has_split_schedule: !!(schedule.second_opening_time && schedule.second_closing_time),
          formatted_schedule: formatSchedule(schedule)
        }));

        setSchedules(formattedSchedules);
      } catch (err) {
        console.error('Error fetching restaurant schedules:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar horarios');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [restaurantId]);

  const formatSchedule = (schedule: any) => {
    if (schedule.is_closed) return 'Cerrado';
    
    if (schedule.second_opening_time && schedule.second_closing_time) {
      return `${schedule.first_opening_time?.slice(0, 5)} - ${schedule.first_closing_time?.slice(0, 5)} y ${schedule.second_opening_time?.slice(0, 5)} - ${schedule.second_closing_time?.slice(0, 5)}`;
    }
    
    return `${schedule.first_opening_time?.slice(0, 5)} - ${schedule.first_closing_time?.slice(0, 5)}`;
  };

  const getCurrentDayStatus = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todaySchedule = schedules.find(s => s.day_of_week === currentDay);
    
    if (!todaySchedule || todaySchedule.is_closed) {
      return { status: 'Cerrado', className: 'text-red-500', isOpen: false };
    }
    
    // Verificar primer turno
    if (todaySchedule.first_opening_time && todaySchedule.first_closing_time) {
      if (currentTime >= todaySchedule.first_opening_time && currentTime <= todaySchedule.first_closing_time) {
        return { status: `Abierto hasta las ${todaySchedule.first_closing_time.slice(0, 5)}`, className: 'text-green-500', isOpen: true };
      }
    }
    
    // Verificar segundo turno si existe
    if (todaySchedule.second_opening_time && todaySchedule.second_closing_time) {
      if (currentTime >= todaySchedule.second_opening_time && currentTime <= todaySchedule.second_closing_time) {
        return { status: `Abierto hasta las ${todaySchedule.second_closing_time.slice(0, 5)}`, className: 'text-green-500', isOpen: true };
      }
    }
    
    return { status: 'Cerrado', className: 'text-red-500', isOpen: false };
  };

  return { schedules, loading, error, getCurrentDayStatus };
};
