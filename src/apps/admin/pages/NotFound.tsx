
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Página no encontrada</h2>
        <p className="text-muted-foreground mb-4">
          La página que buscas no existe en el panel de administración.
        </p>
        <Button onClick={() => navigate('/admin')}>
          Ir al Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
