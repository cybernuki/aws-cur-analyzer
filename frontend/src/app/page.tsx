"use client"

import { useState, ChangeEvent, FormEvent } from 'react';
import ReportTable from '@/components/ReportTable';
import styles from '@/styles/Home.module.css';
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/upload-parquet/`, {
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
    <div className={styles.container}>
      {!report ? (
        // Show upload form when no data
        <main className={styles.main}>
          <h1 className={styles.title}>Analizador de Consumo AWS (CUR)</h1>
          <p className={styles.description}>Sube tu archivo <code>.parquet</code> diario del AWS Cost and Usage Report.</p>

          {/* Button to open CUR setup modal */}
          <div className="mb-4">
            <button
              onClick={() => setIsCurSetupModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              📊 ¿Cómo generar archivos .parquet de AWS CUR?
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fileInputContainer}>
              <input
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                accept=".parquet"
                className={styles.fileInputHidden}
              />
              <label htmlFor="fileInput" className={styles.fileInputLabel}>
                <span className={styles.fileInputButton}>Seleccionar archivo</span>
                <span className={styles.fileInputText}>
                  {file ? file.name : 'Ningún archivo seleccionado'}
                </span>
              </label>
            </div>
            <button type="submit" disabled={isLoading || !file} className={styles.submitButton}>
              {isLoading ? (
                <div className={styles.loading}>
                  <div className={styles.loadingSpinner}></div>
                  Procesando...
                </div>
              ) : (
                'Generar Informe'
              )}
            </button>
          </form>

          {error && <p className={styles.error}>{error}</p>}
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
