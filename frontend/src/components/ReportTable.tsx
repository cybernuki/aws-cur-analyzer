import { useState } from 'react';
import styles from '@/styles/ReportTable.module.css';
import { ReportItem } from '@/types/ReportItem';
import DataVisualization from './DataVisualization';

interface ReportTableProps {
  data: ReportItem[];
  onBack?: () => void;
  onNewUpload?: () => void;
}

export default function ReportTable({ data, onBack, onNewUpload }: ReportTableProps) {
  const [activeTab, setActiveTab] = useState<string>('');

  if (!data || data.length === 0) {
    return (
      <div className={styles.noDataContainer}>
        <p className={styles.noDataText}>No hay datos para mostrar o el formato es incorrecto.</p>
      </div>
    );
  }

  // Ensure data[0] exists before trying to access its keys
  if (typeof data[0] !== 'object' || data[0] === null) {
    return (
      <div className={styles.noDataContainer}>
        <p className={styles.noDataText}>Formato de datos inesperado.</p>
      </div>
    );
  }

  // Group data by service
  const groupedData = data.reduce((acc, item) => {
    const service = item.Servicio;
    if (!acc[service]) {
      acc[service] = [];
    }
    acc[service].push(item);
    return acc;
  }, {} as Record<string, ReportItem[]>);

  const services = Object.keys(groupedData);
  const allTabKey = 'TODOS_LOS_SERVICIOS';
  const visualizationTabKey = 'VISUALIZACIONES';

  // Set initial active tab if not set
  if (!activeTab && services.length > 0) {
    setActiveTab(allTabKey);
  }

  const currentData = activeTab === allTabKey ? data : (groupedData[activeTab] || []);
  const columns = Object.keys(data[0]) as (keyof ReportItem)[];

  // Function to download JSON
  const downloadJSON = () => {
    const dataToDownload = currentData;
    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = activeTab === allTabKey ? 'todos_los_servicios' : activeTab;
    link.download = `${fileName}_consumption_report.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.fullScreenContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {onBack && (
            <button onClick={onBack} className={styles.backButton}>
              <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
          )}
          <h1 className={styles.title}>Informe de Consumo AWS</h1>
        </div>
        <div className={styles.headerActions}>
          {onNewUpload && (
            <button onClick={onNewUpload} className={styles.newUploadButton}>
              <svg className={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Nuevo Archivo
            </button>
          )}
          <button onClick={downloadJSON} className={styles.downloadButton}>
            <svg className={styles.downloadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar JSON
          </button>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        {/* "All" Tab */}
        <button
          onClick={() => setActiveTab(allTabKey)}
          className={`${styles.tab} ${activeTab === allTabKey ? styles.activeTab : ''}`}
        >
          Todos los Servicios
          <span className={styles.tabCount}>({data.length})</span>
        </button>

        {/* Visualization Tab */}
        <button
          onClick={() => setActiveTab(visualizationTabKey)}
          className={`${styles.tab} ${activeTab === visualizationTabKey ? styles.activeTab : ''}`}
        >
          📊 Visualizaciones
        </button>

        {/* Tabs by service */}
        {services.map((service) => (
          <button
            key={service}
            onClick={() => setActiveTab(service)}
            className={`${styles.tab} ${activeTab === service ? styles.activeTab : ''}`}
          >
            {service}
            <span className={styles.tabCount}>({groupedData[service].length})</span>
          </button>
        ))}
      </div>

      {/* Content area - show visualization or table based on active tab */}
      {activeTab === visualizationTabKey ? (
        <DataVisualization data={data} />
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column} className={styles.tableHeader}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={styles.tableRow}>
                    {columns.map((column) => (
                      <td key={`${rowIndex}-${column}`} className={styles.tableCell}>
                        {String(row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}