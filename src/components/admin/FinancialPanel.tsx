
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, CreditCard, FileText, Download } from 'lucide-react';

export function FinancialPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Panel Financiero</h2>
          <p className="text-gray-600">Gestión de ingresos, suscripciones y facturación</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Generar Reporte
        </Button>
      </div>

      {/* Métricas financieras */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-900">€89,340</div>
                <p className="text-sm text-green-700">Ingresos Mes</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <Badge variant="outline" className="mt-2 text-xs bg-green-50 text-green-700">+12.5%</Badge>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-900">€1,234,567</div>
                <p className="text-sm text-blue-700">Ingresos Año</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <Badge variant="outline" className="mt-2 text-xs bg-blue-50 text-blue-700">+18.3%</Badge>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-900">€42.50</div>
                <p className="text-sm text-purple-700">ARPU Mensual</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
            <Badge variant="outline" className="mt-2 text-xs bg-purple-50 text-purple-700">+5.2%</Badge>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-900">€3,247</div>
                <p className="text-sm text-orange-700">Facturas Pend.</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
            <Badge variant="outline" className="mt-2 text-xs bg-orange-50 text-orange-700">8 facturas</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Planes de suscripción */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Planes de Suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">Plan Gratuito</h3>
                <div className="text-3xl font-bold text-gray-600">€0</div>
                <p className="text-sm text-gray-500">/mes</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Restaurantes activos:</span>
                  <span className="font-medium">1,847</span>
                </div>
                <div className="flex justify-between">
                  <span>Ingresos mensuales:</span>
                  <span className="font-medium">€0</span>
                </div>
                <div className="flex justify-between">
                  <span>% del total:</span>
                  <span className="font-medium">64.9%</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-blue-900">Plan Básico</h3>
                <div className="text-3xl font-bold text-blue-600">€29</div>
                <p className="text-sm text-blue-500">/mes</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Restaurantes activos:</span>
                  <span className="font-medium">742</span>
                </div>
                <div className="flex justify-between">
                  <span>Ingresos mensuales:</span>
                  <span className="font-medium">€21,518</span>
                </div>
                <div className="flex justify-between">
                  <span>% del total:</span>
                  <span className="font-medium">26.1%</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-purple-900">Plan Premium</h3>
                <div className="text-3xl font-bold text-purple-600">€79</div>
                <p className="text-sm text-purple-500">/mes</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Restaurantes activos:</span>
                  <span className="font-medium">258</span>
                </div>
                <div className="flex justify-between">
                  <span>Ingresos mensuales:</span>
                  <span className="font-medium">€20,382</span>
                </div>
                <div className="flex justify-between">
                  <span>% del total:</span>
                  <span className="font-medium">9.0%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facturas pendientes */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas Pendientes de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium">Casa Pepe - Factura #2024-001</h4>
                <p className="text-sm text-gray-600">Vencida hace 15 días</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-red-600">€79.00</div>
                <Badge variant="destructive" className="text-xs">Vencida</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
              <div>
                <h4 className="font-medium">La Taberna - Factura #2024-002</h4>
                <p className="text-sm text-gray-600">Vence en 3 días</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-yellow-600">€29.00</div>
                <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">Por vencer</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
