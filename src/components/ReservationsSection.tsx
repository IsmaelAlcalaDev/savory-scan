
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Phone } from 'lucide-react';

export default function ReservationsSection() {
  // Mock data
  const reservations = [
    {
      id: 1,
      restaurant: "Restaurante El Jardín",
      date: "2024-03-15",
      time: "20:00",
      guests: 4,
      status: "confirmed",
      phone: "+34 91 123 4567",
      address: "Calle Mayor 45, Madrid"
    },
    {
      id: 2,
      restaurant: "La Terraza Gourmet",
      date: "2024-03-20",
      time: "13:30",
      guests: 2,
      status: "pending",
      phone: "+34 91 987 6543",
      address: "Paseo de la Castellana 100, Madrid"
    },
    {
      id: 3,
      restaurant: "Sushi Zen",
      date: "2024-02-28",
      time: "19:00",
      guests: 3,
      status: "completed",
      phone: "+34 91 555 0123",
      address: "Gran Vía 28, Madrid"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmada</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-400 text-yellow-700">Pendiente</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusActions = (status: string, id: number) => {
    if (status === 'confirmed') {
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Modificar</Button>
          <Button variant="destructive" size="sm">Cancelar</Button>
        </div>
      );
    }
    if (status === 'pending') {
      return (
        <div className="flex gap-2">
          <Button size="sm">Confirmar</Button>
          <Button variant="outline" size="sm">Cancelar</Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mis Reservas</h3>
        <Button>Nueva Reserva</Button>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No tienes reservas aún</p>
          <Button className="mt-4">Hacer una Reserva</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{reservation.restaurant}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(reservation.date).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{reservation.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{reservation.guests} personas</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{reservation.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{reservation.phone}</span>
                  </div>
                  
                  {getStatusActions(reservation.status, reservation.id) && (
                    <div className="flex justify-end pt-2">
                      {getStatusActions(reservation.status, reservation.id)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
