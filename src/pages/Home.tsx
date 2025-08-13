
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>FoodieSpot - Delivery de Comida</title>
        <meta name="description" content="Encuentra los mejores restaurantes para delivery cerca de ti" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FoodieSpot</span>
            </div>
            <Link to="/auth">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Descubre los mejores
              <span className="text-orange-500 block">restaurantes</span>
              cerca de ti
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Explora una gran variedad de restaurantes y platos deliciosos. 
              Encuentra tu próxima comida favorita con delivery rápido y seguro.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/restaurantes">
                <Button size="lg" className="text-lg px-8 py-6">
                  Ver Restaurantes
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              
              <Link to="/platos">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Explorar Platos
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Encuentra cerca</h3>
                <p className="text-gray-600">
                  Descubre restaurantes en tu área con nuestro sistema de geolocalización
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Los mejores</h3>
                <p className="text-gray-600">
                  Calificaciones y reseñas reales para ayudarte a elegir
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Delivery rápido</h3>
                <p className="text-gray-600">
                  Recibe tu comida en tiempo récord con nuestros socios de delivery
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-gray-600">
              <p>&copy; 2024 FoodieSpot. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
