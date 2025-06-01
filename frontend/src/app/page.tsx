"use client"

import { useState, ChangeEvent, FormEvent } from 'react';
import ReportTable from '@/components/ReportTable';
import styles from '@/styles/Home.module.css';
import { ReportItem } from '@/types/ReportItem';

export default function Home() {
const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ReportItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
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

      const data: ReportItem[] = await response.json(); // Tipar la respuesta
      setReport(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { // Tipar el error capturado
      console.error("Upload failed:", err);
      setError(err.message || 'Ocurrió un error al procesar el archivo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Analizador de Consumo AWS (CUR)</h1>
        <p className={styles.description}>Sube tu archivo <code>.parquet</code> diario del AWS Cost and Usage Report.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".parquet"
            className={styles.fileInput}
          />
          <button type="submit" disabled={isLoading || !file} className={styles.submitButton}>
            {isLoading ? 'Procesando...' : 'Generar Informe'}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}

        {report && <ReportTable data={report} />}
      </main>
    </div>
  );
}
