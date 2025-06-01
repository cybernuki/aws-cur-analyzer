'use client';

interface CurSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CurSetupModal({ isOpen, onClose }: CurSetupModalProps) {
  if (!isOpen) return null;

  // Handle clicks on the overlay (background) to close modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the click was directly on the overlay, not on the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            📊 Cómo generar archivos .parquet de AWS CUR
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Paso 1: Configuración inicial */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Configurar AWS Cost and Usage Report (CUR)
              </h3>
              <p className="text-gray-600 mb-3">
                En la consola de AWS, navega a <strong>Billing & Cost Management → Cost and Usage Reports</strong>
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Configuración requerida:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ <strong>Report type:</strong> Standard Data Export (no Legacy)</li>
                  <li>✅ <strong>Data export version:</strong> CUR 2.0</li>
                  <li>✅ <strong>File format:</strong> Parquet (obligatorio)</li>
                  <li>✅ <strong>Compression:</strong> GZIP (recomendado)</li>
                  <li>✅ <strong>Time granularity:</strong> Daily o Hourly</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    📖 <a
                      href="https://docs.aws.amazon.com/cur/latest/userguide/cur-create.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-800 underline"
                    >
                      Guía paso a paso para crear un CUR
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Paso 2: Columnas requeridas */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Verificar columnas requeridas
              </h3>
              <p className="text-gray-600 mb-3">
                El analizador requiere estas columnas específicas en tu archivo .parquet:
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Columnas obligatorias:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
                  <div>• <code>line_item_line_item_type</code></div>
                  <div>• <code>line_item_usage_amount</code></div>
                  <div>• <code>line_item_product_code</code></div>
                  <div>• <code>line_item_usage_type</code></div>
                  <div>• <code>pricing_unit</code></div>
                  <div>• <code>product.product_name</code> (opcional)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Paso 3: Configuración del bucket S3 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Configurar bucket S3 de destino
              </h3>
              <p className="text-gray-600 mb-3">
                Especifica un bucket S3 donde AWS depositará los archivos CUR:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Crea un bucket S3 dedicado para CUR</li>
                <li>• Configura los permisos necesarios para AWS Billing</li>
                <li>• Define un prefijo para organizar los archivos</li>
              </ul>
            </div>
          </div>

          {/* Paso 4: Descarga y uso */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Descargar y usar archivos
              </h3>
              <p className="text-gray-600 mb-3">
                Una vez configurado, AWS generará archivos diariamente:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Los archivos aparecerán en tu bucket S3 en 24-48 horas</li>
                <li>• Descarga los archivos .parquet (no .csv)</li>
                <li>• Usa archivos individuales, no manifiestos</li>
              </ul>
            </div>
          </div>

          {/* Información importante */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">Notas importantes:</h4>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="space-y-1">
                    <li>• Los archivos CUR pueden tardar hasta 24 horas en generarse</li>
                    <li>• Asegúrate de usar CUR 2.0, no la versión legacy</li>
                    <li>• El formato Parquet es más eficiente que CSV para archivos grandes</li>
                    <li>• Los archivos pueden ser de varios MB o GB dependiendo del uso</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Ejemplo de estructura de archivo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Ejemplo de estructura esperada:</h4>
            <pre className="text-xs text-gray-600 overflow-x-auto">
{`line_item_line_item_type | line_item_usage_amount | line_item_product_code | ...
Usage                    | 100.5                  | AmazonEC2              | ...
SavingsPlanCoveredUsage  | 50.2                   | AmazonS3               | ...
DiscountedUsage          | 25.8                   | AmazonRDS              | ...`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-between items-center">
          <div className="text-sm text-gray-500">
            💡 ¿Necesitas más ayuda?{' '}
            <a
              href="https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Consulta la documentación oficial de AWS CUR
            </a>
          </div>
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition-colors"
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
}
