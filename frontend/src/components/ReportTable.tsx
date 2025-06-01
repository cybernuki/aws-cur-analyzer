import { useState } from 'react';
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
      <div className="flex justify-center items-center min-h-[200px] bg-white/[0.03] rounded-2xl border border-white/10 m-8">
        <p className="text-slate-400 text-lg font-medium text-center">No hay datos para mostrar o el formato es incorrecto.</p>
      </div>
    );
  }

  // Ensure data[0] exists before trying to access its keys
  if (typeof data[0] !== 'object' || data[0] === null) {
    return (
      <div className="flex justify-center items-center min-h-[200px] bg-white/[0.03] rounded-2xl border border-white/10 m-8">
        <p className="text-slate-400 text-lg font-medium text-center">Formato de datos inesperado.</p>
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
    <div className="fixed inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-slate-200 flex flex-col font-sans overflow-hidden">
      <div className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-lg border-b border-white/10 shadow-lg md:flex-row flex-col gap-4 md:gap-0">
        <div className="flex items-center gap-4 md:justify-start justify-center">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-white/10 text-slate-200 border border-white/20 px-4 py-2 rounded-lg font-medium text-sm cursor-pointer transition-all duration-200 hover:bg-white/15 hover:border-white/30 hover:-translate-x-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
          )}
          <h1 className="text-2xl md:text-3xl font-bold m-0 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tight md:text-left text-center">
            Informe de Consumo AWS
          </h1>
        </div>
        <div className="flex items-center gap-4 md:justify-end justify-center flex-wrap">
          {onNewUpload && (
            <button
              onClick={onNewUpload}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Nuevo Archivo
            </button>
          )}
          <button
            onClick={downloadJSON}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar JSON
          </button>
        </div>
      </div>

      <div className="flex px-8 bg-white/[0.02] border-b border-white/10 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/30">
        {/* "All" Tab */}
        <button
          onClick={() => setActiveTab(allTabKey)}
          className={`flex items-center gap-2 bg-transparent border-none text-slate-400 px-6 py-4 font-medium text-sm cursor-pointer transition-all duration-200 border-b-2 border-transparent whitespace-nowrap min-w-fit hover:text-slate-200 hover:bg-white/5 ${
            activeTab === allTabKey ? 'text-blue-400 border-blue-400 bg-blue-400/10' : ''
          }`}
        >
          Todos los Servicios
          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
            activeTab === allTabKey ? 'bg-blue-400/20 text-blue-400' : 'bg-white/10 text-slate-300'
          }`}>
            ({data.length})
          </span>
        </button>

        {/* Visualization Tab */}
        <button
          onClick={() => setActiveTab(visualizationTabKey)}
          className={`flex items-center gap-2 bg-transparent border-none text-slate-400 px-6 py-4 font-medium text-sm cursor-pointer transition-all duration-200 border-b-2 border-transparent whitespace-nowrap min-w-fit hover:text-slate-200 hover:bg-white/5 ${
            activeTab === visualizationTabKey ? 'text-blue-400 border-blue-400 bg-blue-400/10' : ''
          }`}
        >
          📊 Visualizaciones
        </button>

        {/* Tabs by service */}
        {services.map((service) => (
          <button
            key={service}
            onClick={() => setActiveTab(service)}
            className={`flex items-center gap-2 bg-transparent border-none text-slate-400 px-6 py-4 font-medium text-sm cursor-pointer transition-all duration-200 border-b-2 border-transparent whitespace-nowrap min-w-fit hover:text-slate-200 hover:bg-white/5 ${
              activeTab === service ? 'text-blue-400 border-blue-400 bg-blue-400/10' : ''
            }`}
          >
            {service}
            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
              activeTab === service ? 'bg-blue-400/20 text-blue-400' : 'bg-white/10 text-slate-300'
            }`}>
              ({groupedData[service].length})
            </span>
          </button>
        ))}
      </div>

      {/* Content area - show visualization or table based on active tab */}
      {activeTab === visualizationTabKey ? (
        <DataVisualization data={data} />
      ) : (
        <div className="flex-1 overflow-hidden p-8">
          <div className="h-full bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="h-full overflow-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-white/10 backdrop-blur-md border-b border-white/20 z-10">
                  <tr>
                    {columns.map((column) => (
                      <th key={column} className="text-left p-4 font-semibold text-slate-200 text-sm tracking-wide border-r border-white/10 last:border-r-0 bg-gradient-to-b from-white/5 to-transparent">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-white/5 transition-colors duration-150 hover:bg-white/5">
                      {columns.map((column) => (
                        <td key={`${rowIndex}-${column}`} className="p-4 text-slate-300 text-sm border-r border-white/5 last:border-r-0 font-mono">
                          {String(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}