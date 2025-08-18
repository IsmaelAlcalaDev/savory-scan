
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Play } from 'lucide-react';

export function MassUpload() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Carga Masiva de Datos</h2>
          <p className="text-gray-600">Importa restaurantes y menús masivamente mediante CSV</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Descargar Template CSV
        </Button>
      </div>

      {/* Proceso de carga */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Subir Archivo CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium">Arrastra tu archivo CSV aquí</p>
              <p className="text-sm text-gray-600 mb-4">o haz click para seleccionar</p>
              <Button>Seleccionar Archivo</Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Formatos Soportados:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• CSV con encoding UTF-8</li>
                <li>• Máximo 1000 restaurantes por archivo</li>
                <li>• Campos requeridos: nombre, dirección, teléfono, email</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Adjuntar Menús y Fotos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium">Sube PDFs de menús y fotos</p>
              <p className="text-sm text-gray-600 mb-4">Se procesarán con IA automáticamente</p>
              <Button variant="outline">Seleccionar Archivos</Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Archivos Aceptados:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PDFs de menús (hasta 10MB)</li>
                <li>• Imágenes JPG, PNG (hasta 5MB cada una)</li>
                <li>• Nombrar archivos con ID del restaurante</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado de procesamiento */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Procesamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Validación de datos CSV</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completado
                </Badge>
              </div>
              <Progress value={100} className="h-2" />
              <p className="text-sm text-gray-600">247 restaurantes validados correctamente</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Creación de restaurantes</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  <Play className="h-3 w-3 mr-1" />
                  En Proceso
                </Badge>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-sm text-gray-600">161 de 247 restaurantes creados (65%)</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Procesamiento de menús con IA</span>
                <Badge variant="outline" className="bg-gray-50 text-gray-700">
                  Pendiente
                </Badge>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-sm text-gray-600">Esperando finalización de creación</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button>Pausar Proceso</Button>
              <Button variant="outline">Ver Log Detallado</Button>
              <Button variant="outline">Descargar Errores</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de cargas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Cargas Masivas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">Carga Madrid Centro - 247 restaurantes</h4>
                  <p className="text-sm text-gray-600">Iniciado: 18 Enero 2024, 14:30</p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">En Proceso</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>✅ 161 Creados</span>
                <span>🔄 86 Pendientes</span>
                <span>❌ 0 Errores</span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">Carga Valencia - 89 restaurantes</h4>
                  <p className="text-sm text-gray-600">Completado: 15 Enero 2024, 09:15</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">Completado</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>✅ 87 Creados</span>
                <span>❌ 2 Errores</span>
                <span>📊 845 Platos extraídos</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
