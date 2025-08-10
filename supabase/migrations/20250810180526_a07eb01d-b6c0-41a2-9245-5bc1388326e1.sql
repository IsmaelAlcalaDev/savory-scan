
-- Recalcular contadores para dejar los datos históricos consistentes (usuarios únicos por ventana)
SELECT public.recalculate_favorites_counters();
