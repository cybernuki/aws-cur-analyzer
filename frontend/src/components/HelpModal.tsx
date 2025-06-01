'use client';
import { useState } from 'react';

export default function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botón de ayuda */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg transition-colors z-50"
        title="Ayuda"
      >
        ?
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                ¿Cómo usar AWS CUR Analyzer?
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Paso 1 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    Configura AWS CUR
                  </h3>
                  <p className="text-gray-600 mb-2">
                    En AWS Console, ve a Billing → Cost and Usage Reports
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1 ml-4">
                    <li>• Usa <strong>Standard Data Export</strong> (no legacy)</li>
                    <li>• Selecciona <strong>CUR 2.0</strong></li>
                    <li>• Marca la opción de formato <strong>Parquet</strong></li>
                  </ul>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    Descarga tu archivo
                  </h3>
                  <p className="text-gray-600">
                    Descarga el archivo JSON de consumo de AWS desde tu bucket S3 o desde la consola de AWS.
                  </p>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    Sube tu archivo
                  </h3>
                  <p className="text-gray-600">
                    Arrastra y suelta tu archivo JSON en el área de carga o haz clic para seleccionarlo.
                  </p>
                </div>
              </div>

              {/* Paso 4 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    Analiza tus datos
                  </h3>
                  <p className="text-gray-600">
                    Explora los servicios organizados por pestañas y descarga los datos en formato JSON si necesitas.
                  </p>
                </div>
              </div>

              {/* Nota importante */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Importante:</strong> Asegúrate de que tu archivo CUR esté en formato Parquet y sea de tipo CUR 2.0 para obtener los mejores resultados.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}