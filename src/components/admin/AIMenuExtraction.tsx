
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, FileText, Eye, CheckCircle, AlertCircle, Play, Pause } from 'lucide-react';

const mockExtractions = [
  {
    id: 1,
    restaurant: 'Casa Pepe',
    menuFile: 'menu_casa_pepe.pdf',
    status: 'completed',
    dishesExtracted: 24,
    confidence: 95,
    reviewNeeded: 2
  },
  {
    id: 2,
    restaurant: 'La Taberna',
    menuFile: 'taberna_menu.pdf',
    status: 'processing',
    dishesExtracted: 0,
    confidence: 0,
    reviewNeeded: 0
  }
];

export function AIMenuExtraction() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">IA Extracción de Menús</h2>
          <p className="text-gray-600">Sistema inteligente para extraer platos de PDFs de menús</p>
        </div>
        <Button className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Procesar Cola
        </Button>
      </div>

      {/* Estadísticas de IA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-900">15,847</div>
                <p className="text-sm text-purple-700">Platos Extraídos</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-900">94.2%</div>
                <p className="text-sm text-green-700">Precisión Media</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-900">342</div>
                <p className="text-sm text-blue-700">PDFs Procesados</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-900">23</div>
                <p className="text-sm text-orange-700">En Cola</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuración de IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Configuración del Sistema IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Modelo de Extracción</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                  <span className="text-sm font-medium">GPT-4 Vision</span>
                  <Badge variant="default">Activo</Badge>
                </div>
                <p className="text-xs text-gray-600">Precisión: 94.2% | Costo: €0.03/página</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Confianza Mínima</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Umbral de confianza</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
                <p className="text-xs text-gray-600">Platos con menor confianza requieren revisión manual</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Procesamiento</h4>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full">
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar Sistema
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  Ajustar Parámetros
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cola de procesamiento */}
      <Card>
        <CardHeader>
          <CardTitle>Cola de Procesamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockExtractions.map((extraction) => (
              <div key={extraction.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{extraction.restaurant}</h4>
                    <p className="text-sm text-gray-600">{extraction.menuFile}</p>
                  </div>
                  <Badge variant={extraction.status === 'completed' ? 'default' : 'secondary'}>
                    {extraction.status === 'completed' ? 'Completado' : 'Procesando'}
                  </Badge>
                </div>

                {extraction.status === 'completed' ? (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Platos extraídos:</span>
                      <div className="font-medium text-green-600">{extraction.dishesExtracted}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Confianza media:</span>
                      <div className="font-medium">{extraction.confidence}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Requieren revisión:</span>
                      <div className="font-medium text-orange-600">{extraction.reviewNeeded}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Progress value={45} className="h-2" />
                    <p className="text-sm text-gray-600">Procesando página 3 de 8...</p>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Resultados
                  </Button>
                  {extraction.reviewNeeded > 0 && (
                    <Button size="sm" variant="outline">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Revisar ({extraction.reviewNeeded})
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
