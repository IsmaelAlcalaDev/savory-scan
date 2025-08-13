
import React from 'react';
import { Phone, MapPin, Mail, Clock } from 'lucide-react';

interface RestaurantContactInfoProps {
  phone?: string;
  email?: string;
  address: string;
  schedules: Array<{
    day_of_week: number;
    opening_time: string;
    closing_time: string;
    is_closed: boolean;
  }>;
}

const daysOfWeek = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export default function RestaurantContactInfo({ 
  phone, 
  email, 
  address, 
  schedules 
}: RestaurantContactInfoProps) {
  const getTodaySchedule = () => {
    const today = new Date().getDay();
    return schedules.find(s => s.day_of_week === today);
  };

  const todaySchedule = getTodaySchedule();
  const isOpenNow = () => {
    if (!todaySchedule || todaySchedule.is_closed) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = todaySchedule.opening_time.split(':').map(Number);
    const [closeHour, closeMin] = todaySchedule.closing_time.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  return (
    <div className="space-y-6 bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        Información de contacto
      </h3>
      
      <div className="space-y-4">
        {phone && (
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-full p-2 mt-0.5">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teléfono</p>
              <a 
                href={`tel:${phone}`} 
                className="font-medium text-lg hover:text-primary transition-colors"
              >
                {phone}
              </a>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="bg-primary/10 rounded-full p-2 mt-0.5">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dirección</p>
            <p className="font-medium">{address}</p>
          </div>
        </div>

        {email && (
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-full p-2 mt-0.5">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <a 
                href={`mailto:${email}`} 
                className="font-medium hover:text-primary transition-colors"
              >
                {email}
              </a>
            </div>
          </div>
        )}

        {todaySchedule && (
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-full p-2 mt-0.5">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hoy</p>
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {todaySchedule.is_closed 
                    ? 'Cerrado' 
                    : `${todaySchedule.opening_time} - ${todaySchedule.closing_time}`
                  }
                </p>
                <span 
                  className={`text-xs px-2 py-1 rounded-full ${
                    isOpenNow() 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isOpenNow() ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
