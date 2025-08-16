
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { OrderItem, Diner } from '@/contexts/OrderSimulatorContext';

export interface SavedTicket {
  id: string;
  code: string;
  total_amount: number;
  total_items: number;
  diner_count: number;
  created_at: string;
}

export interface SavedTicketDetail extends SavedTicket {
  items: Array<{
    id: string;
    dish_id: number;
    dish_name: string;
    dish_image_url?: string;
    variant_id?: number;
    variant_name?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    diner_name: string;
  }>;
  diners: Array<{
    name: string;
  }>;
}

export const useSavedTickets = (restaurantId: number) => {
  const { user } = useAuth();
  const [savedTickets, setSavedTickets] = useState<SavedTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedTickets = async () => {
    if (!user || !restaurantId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('ticket_simulations')
        .select('id, code, total, diners_count, created_at')
        .eq('restaurant_id', restaurantId)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedTickets: SavedTicket[] = (data || []).map(ticket => ({
        id: ticket.id,
        code: ticket.code,
        total_amount: ticket.total || 0,
        total_items: 0, // We'll calculate this from ticket items if needed
        diner_count: ticket.diners_count || 0,
        created_at: ticket.created_at
      }));

      setSavedTickets(formattedTickets);
    } catch (err) {
      console.error('Error fetching saved tickets:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar tickets guardados');
    } finally {
      setLoading(false);
    }
  };

  const saveTicket = async (
    name: string,
    orderItems: OrderItem[],
    diners: Diner[],
    totalAmount: number
  ) => {
    if (!user || !restaurantId) return { success: false, error: 'Usuario no autenticado' };

    try {
      setLoading(true);
      setError(null);

      // Create ticket simulation with the correct column names
      const { data: ticketData, error: ticketError } = await supabase
        .from('ticket_simulations')
        .insert({
          code: name,
          restaurant_id: restaurantId,
          created_by: user.id,
          total: totalAmount,
          diners_count: diners.length,
          diner_names: diners.map(d => ({ name: d.name }))
        })
        .select('id')
        .single();

      if (ticketError) throw ticketError;

      // Create ticket items with the correct column names
      const ticketItems = orderItems.map(item => {
        const price = item.selectedVariant?.price || item.dish.base_price;
        
        return {
          ticket_id: ticketData.id,
          dish_id: item.dish.id,
          dish_name: item.dish.name,
          variant_id: item.selectedVariant?.id,
          quantity: item.quantity,
          unit_price: price,
          subtotal: price * item.quantity
        };
      });

      const { error: itemsError } = await supabase
        .from('ticket_items')
        .insert(ticketItems);

      if (itemsError) throw itemsError;

      // Refresh the tickets list
      await fetchSavedTickets();

      return { success: true };
    } catch (err) {
      console.error('Error saving ticket:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar ticket';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getTicketDetail = async (ticketId: string): Promise<SavedTicketDetail | null> => {
    if (!user) return null;

    try {
      // Get ticket basic info
      const { data: ticketData, error: ticketError } = await supabase
        .from('ticket_simulations')
        .select('*')
        .eq('id', ticketId)
        .eq('created_by', user.id)
        .single();

      if (ticketError) throw ticketError;

      // Get ticket items
      const { data: itemsData, error: itemsError } = await supabase
        .from('ticket_items')
        .select('*')
        .eq('ticket_id', ticketId);

      if (itemsError) throw itemsError;

      // Format the response to match expected interface
      const formattedItems = (itemsData || []).map(item => ({
        id: item.id,
        dish_id: item.dish_id,
        dish_name: item.dish_name,
        dish_image_url: undefined,
        variant_id: item.variant_id,
        variant_name: undefined,
        quantity: item.quantity || 1,
        unit_price: item.unit_price,
        total_price: item.subtotal,
        diner_name: 'Comensal'
      }));

      return {
        id: ticketData.id,
        code: ticketData.code,
        total_amount: ticketData.total || 0,
        total_items: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
        diner_count: ticketData.diners_count || 0,
        created_at: ticketData.created_at,
        items: formattedItems,
        diners: Array.isArray(ticketData.diner_names) ? ticketData.diner_names as Array<{name: string}> : []
      };
    } catch (err) {
      console.error('Error fetching ticket detail:', err);
      return null;
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('ticket_simulations')
        .delete()
        .eq('id', ticketId)
        .eq('created_by', user.id);

      if (error) throw error;

      // Refresh the tickets list
      await fetchSavedTickets();

      return { success: true };
    } catch (err) {
      console.error('Error deleting ticket:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar ticket';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedTickets();
  }, [user, restaurantId]);

  return {
    savedTickets,
    loading,
    error,
    saveTicket,
    getTicketDetail,
    deleteTicket,
    refreshTickets: fetchSavedTickets
  };
};
