
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRestaurantSchedules } from '@/hooks/useRestaurantSchedules';

interface RestaurantScheduleAdvancedProps {
  restaurantId: number;
}

const dayNames = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export default function RestaurantScheduleAdvanced({ restaurantId }: RestaurantScheduleAdvancedProps) {
  const { schedules, loading, error, getCurrentDayStatus } = useRestaurantSchedules(restaurantId);

  if (loading) {
    return (
      <Card className="bg-gradient-card border-glass shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Horarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex justify-between items-center py-2 px-3 rounded-lg bg-secondary/20 animate-pulse">
                <div className="h-4 bg-secondary/30 rounded w-20"></div>
                <div className="h-4 bg-secondary/30 rounded w-32"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-card border-glass shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Horarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Error al cargar horarios</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStatus = getCurrentDayStatus();

  const formatTime = (time?: string | null) => {
    if (!time) return '';
    return time.slice(0, 5);
  };

  const renderScheduleRow = (schedule: any, dayName: string, isToday: boolean) => {
    if (schedule.is_closed) {
      return (
        <div className="flex items-center justify-between">
          <span className={`font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
            {dayName}
          </span>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-muted-foreground">Cerrado</span>
          </div>
        </div>
      );
    }

    // Check if has split schedule
    const hasSplitSchedule = schedule.second_opening_time && schedule.second_closing_time;

    return (
      <div className="flex items-center justify-between">
        <span className={`font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
          {dayName}
        </span>
        <div className="flex items-center gap-2">
          {hasSplitSchedule && (
            <Badge variant="outline" className="text-xs">Turno partido</Badge>
          )}
          <div className="text-sm text-muted-foreground">
            {schedule.first_opening_time && schedule.first_closing_time && (
              <span>
                {formatTime(schedule.first_opening_time)} - {formatTime(schedule.first_closing_time)}
              </span>
            )}
            {hasSplitSchedule && (
              <span className="mx-1">y</span>
            )}
            {hasSplitSchedule && (
              <span>
                {formatTime(schedule.second_opening_time)} - {formatTime(schedule.second_closing_time)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gradient-card border-glass shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Horarios
          <div className="flex items-center gap-1">
            {currentStatus.isOpen ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${currentStatus.className}`}>
              {currentStatus.status}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dayNames.map((dayName, index) => {
            const schedule = schedules.find(s => s.day_of_week === index);
            const isToday = new Date().getDay() === index;
            
            return (
              <div
                key={index}
                className={`py-3 px-4 rounded-lg transition-smooth ${
                  isToday ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/20'
                }`}
              >
                {schedule ? (
                  renderScheduleRow(schedule, dayName, isToday)
                ) : (
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                      {dayName}
                    </span>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-muted-foreground">Sin horario</span>
                    </div>
                  </div>
                )}
                {schedule && schedule.notes && (
                  <div className="mt-2 text-xs text-muted-foreground italic">
                    {schedule.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
