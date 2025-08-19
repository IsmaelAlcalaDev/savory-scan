
import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useRestaurantSchedules } from '@/hooks/useRestaurantSchedules';

interface CompactRestaurantScheduleProps {
  restaurantId: number;
}

const dayNames = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export default function CompactRestaurantSchedule({ restaurantId }: CompactRestaurantScheduleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { schedules, loading, error, getCurrentDayStatus } = useRestaurantSchedules(restaurantId);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-secondary/30 rounded w-32 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || schedules.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-red-500">
            Horarios no disponibles
          </span>
        </div>
      </div>
    );
  }

  const formatTime = (time?: string | null) => {
    if (!time) return '';
    return time.slice(0, 5);
  };

  const getNextWorkingDay = () => {
    const today = new Date().getDay();
    for (let i = 1; i <= 7; i++) {
      const dayIndex = (today + i) % 7;
      const schedule = schedules.find(s => s.day_of_week === dayIndex);
      if (schedule && !schedule.is_closed) {
        return {
          name: dayNames[dayIndex],
          schedule
        };
      }
    }
    return null;
  };

  const currentStatus = getCurrentDayStatus();
  const nextWorkingDay = getNextWorkingDay();
  const today = new Date().getDay();
  const todayName = dayNames[today];
  const todaySchedule = schedules.find(s => s.day_of_week === today);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentStatus.isOpen ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${currentStatus.className}`}>
            {currentStatus.status}
          </span>
        </div>
      </div>

      {/* Today's schedule */}
      {todaySchedule && !todaySchedule.is_closed && (
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary">{todayName}</span>
            {todaySchedule.second_opening_time && todaySchedule.second_closing_time && (
              <Badge variant="outline" className="text-xs">Turno partido</Badge>
            )}
          </div>
          <span className="text-muted-foreground">
            {todaySchedule.first_opening_time && todaySchedule.first_closing_time && (
              `${formatTime(todaySchedule.first_opening_time)} - ${formatTime(todaySchedule.first_closing_time)}`
            )}
            {todaySchedule.second_opening_time && todaySchedule.second_closing_time && (
              ` y ${formatTime(todaySchedule.second_opening_time)} - ${formatTime(todaySchedule.second_closing_time)}`
            )}
          </span>
        </div>
      )}

      {/* Next working day */}
      {nextWorkingDay && (
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{nextWorkingDay.name}</span>
            {nextWorkingDay.schedule.second_opening_time && nextWorkingDay.schedule.second_closing_time && (
              <Badge variant="outline" className="text-xs">Turno partido</Badge>
            )}
          </div>
          <span className="text-muted-foreground">
            {nextWorkingDay.schedule.first_opening_time && nextWorkingDay.schedule.first_closing_time && (
              `${formatTime(nextWorkingDay.schedule.first_opening_time)} - ${formatTime(nextWorkingDay.schedule.first_closing_time)}`
            )}
            {nextWorkingDay.schedule.second_opening_time && nextWorkingDay.schedule.second_closing_time && (
              ` y ${formatTime(nextWorkingDay.schedule.second_opening_time)} - ${formatTime(nextWorkingDay.schedule.second_closing_time)}`
            )}
          </span>
        </div>
      )}

      {/* Collapsible full schedule */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
          <span>Ver todos los horarios</span>
          {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-2 mt-3">
          {dayNames.map((dayName, index) => {
            const schedule = schedules.find(s => s.day_of_week === index);
            const isToday = new Date().getDay() === index;
            
            return (
              <div
                key={index}
                className={`flex justify-between items-center py-2 px-3 rounded-lg transition-smooth ${
                  isToday ? 'bg-primary/10' : 'bg-secondary/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {dayName}
                  </span>
                  {schedule && schedule.second_opening_time && schedule.second_closing_time && (
                    <Badge variant="outline" className="text-xs">Turno partido</Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {schedule?.is_closed || !schedule ? (
                    'Cerrado'
                  ) : (
                    <>
                      {schedule.first_opening_time && schedule.first_closing_time && (
                        `${formatTime(schedule.first_opening_time)} - ${formatTime(schedule.first_closing_time)}`
                      )}
                      {schedule.second_opening_time && schedule.second_closing_time && (
                        ` y ${formatTime(schedule.second_opening_time)} - ${formatTime(schedule.second_closing_time)}`
                      )}
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
