
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Schedule {
  day_of_week: number;
  opening_time: string;
  closing_time: string;
  is_closed: boolean;
}

interface RestaurantScheduleProps {
  schedules: Schedule[];
}

const dayNames = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export default function RestaurantSchedule({ schedules }: RestaurantScheduleProps) {
  const formatTime = (time: string) => {
    return time.slice(0, 5); // Remove seconds
  };

  const getCurrentDayStatus = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todaySchedule = schedules.find(s => s.day_of_week === currentDay);
    
    if (!todaySchedule || todaySchedule.is_closed) {
      return { status: 'Cerrado', className: 'text-red-500' };
    }
    
    if (currentTime >= todaySchedule.opening_time && currentTime <= todaySchedule.closing_time) {
      return { status: 'Abierto', className: 'text-green-500' };
    }
    
    return { status: 'Cerrado', className: 'text-red-500' };
  };

  const currentStatus = getCurrentDayStatus();

  return (
    <Card className="bg-gradient-card border-glass shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Horarios
          <span className={`text-sm font-medium ${currentStatus.className}`}>
            • {currentStatus.status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
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
                <span className={`font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                  {dayName}
                </span>
                <span className="text-muted-foreground">
                  {schedule?.is_closed || !schedule ? (
                    'Cerrado'
                  ) : (
                    `${formatTime(schedule.opening_time)} - ${formatTime(schedule.closing_time)}`
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
