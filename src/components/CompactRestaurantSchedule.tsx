
import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Schedule {
  day_of_week: number;
  opening_time: string;
  closing_time: string;
  is_closed: boolean;
}

interface CompactRestaurantScheduleProps {
  schedules: Schedule[];
}

const dayNames = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export default function CompactRestaurantSchedule({ schedules }: CompactRestaurantScheduleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const getCurrentDayStatus = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todaySchedule = schedules.find(s => s.day_of_week === currentDay);
    
    if (!todaySchedule || todaySchedule.is_closed) {
      return { 
        status: 'Cerrado', 
        className: 'text-red-500',
        isOpen: false,
        schedule: null
      };
    }
    
    if (currentTime >= todaySchedule.opening_time && currentTime <= todaySchedule.closing_time) {
      return { 
        status: `Abierto hasta las ${formatTime(todaySchedule.closing_time)}`, 
        className: 'text-green-500',
        isOpen: true,
        schedule: todaySchedule
      };
    }
    
    return { 
      status: `Cerrado - Abre a las ${formatTime(todaySchedule.opening_time)}`, 
      className: 'text-red-500',
      isOpen: false,
      schedule: todaySchedule
    };
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
      {currentStatus.schedule && (
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-primary">{todayName}</span>
          <span className="text-muted-foreground">
            {formatTime(currentStatus.schedule.opening_time)} - {formatTime(currentStatus.schedule.closing_time)}
          </span>
        </div>
      )}

      {/* Next working day */}
      {nextWorkingDay && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{nextWorkingDay.name}</span>
          <span className="text-muted-foreground">
            {formatTime(nextWorkingDay.schedule.opening_time)} - {formatTime(nextWorkingDay.schedule.closing_time)}
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
                <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                  {dayName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {schedule?.is_closed || !schedule ? (
                    'Cerrado'
                  ) : (
                    `${formatTime(schedule.opening_time)} - ${formatTime(schedule.closing_time)}`
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
