
import React from 'react';
import { Clock, Users, Utensils, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSavedTickets, type SavedTicket } from '@/hooks/useSavedTickets';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';
import { useAuth } from '@/contexts/AuthContext';

interface SavedTicketsSectionProps {
  restaurantId: number;
}

export default function SavedTicketsSection({ restaurantId }: SavedTicketsSectionProps) {
  const { user } = useAuth();
  const { savedTickets, loading, getTicketDetail, deleteTicket } = useSavedTickets(restaurantId);
  const { loadTicket, openSimulator } = useOrderSimulator();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleLoadTicket = async (ticket: SavedTicket) => {
    const detail = await getTicketDetail(ticket.id);
    if (detail) {
      loadTicket(detail.items, detail.diners);
      openSimulator();
    }
  };

  const handleDeleteTicket = async (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar este ticket?')) {
      await deleteTicket(ticketId);
    }
  };

  // Don't show section if user is not authenticated or no tickets
  if (!user || loading || savedTickets.length === 0) {
    return null;
  }

  return (
    <div className="bg-background border-b">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Tus Tickets Guardados</h3>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {savedTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex-shrink-0 bg-accent/20 rounded-lg p-3 border cursor-pointer hover:bg-accent/30 transition-colors min-w-[280px]"
              onClick={() => handleLoadTicket(ticket)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm truncate pr-2">{ticket.name}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteTicket(ticket.id, e)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(ticket.created_at)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Utensils className="h-3 w-3" />
                      <span>{ticket.total_items} platos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{ticket.diner_count}</span>
                    </div>
                  </div>
                  
                  <div className="font-semibold text-primary text-sm">
                    {formatPrice(ticket.total_amount)}
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-accent/40">
                <p className="text-xs text-muted-foreground">
                  Toca para cargar en el simulador
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
