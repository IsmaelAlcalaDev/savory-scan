
-- Enable RLS on ticket_simulations and ticket_items tables
ALTER TABLE public.ticket_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_items ENABLE ROW LEVEL SECURITY;

-- Policies for ticket_simulations
CREATE POLICY "Users can view their own ticket simulations" 
  ON public.ticket_simulations 
  FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own ticket simulations" 
  ON public.ticket_simulations 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own ticket simulations" 
  ON public.ticket_simulations 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own ticket simulations" 
  ON public.ticket_simulations 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Policies for ticket_items
CREATE POLICY "Users can view their own ticket items" 
  ON public.ticket_items 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.ticket_simulations ts 
    WHERE ts.id = ticket_simulation_id 
    AND ts.created_by = auth.uid()
  ));

CREATE POLICY "Users can create their own ticket items" 
  ON public.ticket_items 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ticket_simulations ts 
    WHERE ts.id = ticket_simulation_id 
    AND ts.created_by = auth.uid()
  ));

CREATE POLICY "Users can update their own ticket items" 
  ON public.ticket_items 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.ticket_simulations ts 
    WHERE ts.id = ticket_simulation_id 
    AND ts.created_by = auth.uid()
  ));

CREATE POLICY "Users can delete their own ticket items" 
  ON public.ticket_items 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.ticket_simulations ts 
    WHERE ts.id = ticket_simulation_id 
    AND ts.created_by = auth.uid()
  ));
