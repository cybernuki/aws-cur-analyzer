"use client"

import { useState, ChangeEvent, FormEvent } from 'react';
import ReportTable from '@/components/ReportTable';
import { ReportItem } from '@/types/ReportItem';
import CurSetupModal from '@/components/CurSetupModal';

// Security configuration
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const validateFile = (file: File): string | null => {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return `Archivo muy grande. Tamaño máximo permitido: ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
  }

  // Validate file extension
  if (!file.name.toLowerCase().endsWith('.parquet')) {
    return 'Solo se permiten archivos .parquet';
  }

  // Validate minimum file size
  if (file.size < 100) {
    return 'El archivo parece estar vacío o corrupto';
  }

  return null; // File is valid
};

export default function Home() {
const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ReportItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isCurSetupModalOpen, setIsCurSetupModalOpen] = useState<boolean>(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      // Validate file before setting it
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        setFile(null);
        setReport(null);
        // Clear the input
        event.target.value = '';
        return;
      }

      // File is valid
      setFile(selectedFile);
      setReport(null); // Reset report when new file is selected
      setError('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError('Por favor, selecciona un archivo .parquet.');
      return;
    }

    setIsLoading(true);
    setError('');
    setReport(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-parquet', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.statusText}`);
      }

      const data: ReportItem[] = await response.json(); // Type the response
      setReport(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { // Type the caught error
      console.error("Upload failed:", err);
      setError(err.message || 'Ocurrió un error al procesar el archivo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewUpload = () => {
    setReport(null);
    setFile(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-slate-200 flex flex-col items-center justify-center font-sans overflow-hidden">
      {!report ? (
        // Show upload form when no data
        <main className="flex flex-col items-center w-full max-w-2xl p-8">
          <h1 className="m-0 mb-4 leading-tight text-5xl text-center font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
            Analizador de Consumo AWS (CUR)
          </h1>
          <p className="leading-relaxed text-lg text-center text-slate-300 m-0 mb-12 font-normal">
            Sube tu archivo <code className="bg-blue-400/10 text-blue-400 px-2 py-1 rounded-md font-mono text-base font-semibold">.parquet</code> diario del AWS Cost and Usage Report.
          </p>

          {/* Button to open CUR setup modal */}
          <div className="mb-4">
            <button
              onClick={() => setIsCurSetupModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              📊 ¿Cómo generar archivos .parquet de AWS CUR?
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8 p-12 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl w-full transition-all duration-300 hover:bg-white/8 hover:border-white/20">
            <div className="relative w-full">
              <input
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                accept=".parquet"
                className="absolute opacity-0 w-0 h-0 overflow-hidden"
              />
              <label htmlFor="fileInput" className="flex items-center w-full p-4 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl text-slate-200 text-base font-medium cursor-pointer transition-all duration-300 outline-none hover:bg-white/8 hover:border-blue-400/50 focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-400/10">
                <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none px-6 py-3 rounded-xl font-semibold text-sm mr-4 transition-all duration-200 flex-shrink-0 hover:from-blue-600 hover:to-blue-800 hover:-translate-y-0.5">
                  Seleccionar archivo
                </span>
                <span className="text-slate-200 text-sm opacity-80 overflow-hidden text-ellipsis whitespace-nowrap">
                  {file ? file.name : 'Ningún archivo seleccionado'}
                </span>
              </label>
            </div>
            <button
              type="submit"
              disabled={isLoading || !file}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 border-none rounded-2xl cursor-pointer text-lg font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/30 min-w-52 disabled:bg-white/10 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none enabled:hover:from-emerald-600 enabled:hover:to-emerald-700 enabled:hover:-translate-y-1 enabled:hover:shadow-xl enabled:hover:shadow-emerald-500/40"
            >
              {isLoading ? (
                <div className="flex items-center gap-2 text-blue-400 font-medium">
                  <div className="w-5 h-5 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
                  Procesando...
                </div>
              ) : (
                'Generar Informe'
              )}
            </button>
          </form>

          {error && (
            <p className="text-red-400 bg-red-400/10 border border-red-400/20 px-6 py-4 rounded-xl text-center font-medium mt-4 backdrop-blur-lg">
              {error}
            </p>
          )}
        </main>
      ) : (
        // Show table with upload option
        <ReportTable data={report} onNewUpload={handleNewUpload} />
      )}
      <CurSetupModal
        isOpen={isCurSetupModalOpen}
        onClose={() => setIsCurSetupModalOpen(false)}
      />
    </div>
  );
}
