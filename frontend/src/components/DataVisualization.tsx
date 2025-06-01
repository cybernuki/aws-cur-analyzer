import { useState, useEffect } from 'react';
import { ReportItem } from '@/types/ReportItem';

interface DataVisualizationProps {
  data: ReportItem[];
}

interface UnitAnalysis {
  totalConsumption: number;
  services: Set<string>;
  usageTypes: Set<string>;
  records: ReportItem[];
}

interface TopConsumptionItem extends ReportItem {
  key: string;
  unitKey: string;
}

interface ProcessedData {
  unitAnalysis: Record<string, UnitAnalysis>;
  serviceByUnit: Record<string, number>;
  topConsumptionItems: TopConsumptionItem[];
  totalServices: number;
  totalRecords: number;
  totalUnits: number;
  uniqueUsageTypes: number;
}

export default function DataVisualization({ data }: DataVisualizationProps) {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Group by pricing unit for cost analysis
    const unitAnalysis = data.reduce((acc, item) => {
      const unit = item.Unidad || 'Unknown';
      if (!acc[unit]) {
        acc[unit] = {
          totalConsumption: 0,
          services: new Set(),
          usageTypes: new Set(),
          records: []
        };
      }
      acc[unit].totalConsumption += item.CantidadConsumida;
      acc[unit].services.add(item.Servicio);
      acc[unit].usageTypes.add(item.TipoDeUso);
      acc[unit].records.push(item);
      return acc;
    }, {} as Record<string, UnitAnalysis>);

    // Service consumption by unit
    const serviceByUnit = data.reduce((acc, item) => {
      const key = `${item.Servicio} (${item.Unidad})`;
      acc[key] = (acc[key] || 0) + item.CantidadConsumida;
      return acc;
    }, {} as Record<string, number>);

    // Top consumption items for cost estimation
    const topConsumptionItems = data
      .map(item => ({
        ...item,
        key: `${item.Servicio} - ${item.TipoDeUso}`,
        unitKey: `${item.Servicio} (${item.Unidad})`
      }))
      .sort((a, b) => b.CantidadConsumida - a.CantidadConsumida)
      .slice(0, 15);

    setProcessedData({
      unitAnalysis,
      serviceByUnit,
      topConsumptionItems,
      totalServices: new Set(data.map(item => item.Servicio)).size,
      totalRecords: data.length,
      totalUnits: Object.keys(unitAnalysis).length,
      uniqueUsageTypes: new Set(data.map(item => item.TipoDeUso)).size
    });
  }, [data]);

  if (!processedData) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-slate-400">
        <div className="w-8 h-8 border-3 border-blue-400/20 border-t-blue-400 rounded-full animate-spin mb-4"></div>
        <p>Procesando datos...</p>
      </div>
    );
  }

  return (
    <div className="p-8 text-slate-200 h-full overflow-y-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold m-0 mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Análisis de Costos AWS
        </h2>
        <p className="text-slate-400 text-base m-0">
          Métricas para estimación de costos por unidad de medida
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8 max-md:grid-cols-2 max-sm:grid-cols-1">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center shadow-lg transition-all duration-300 hover:bg-white/8 hover:-translate-y-1">
          <h4 className="text-sm font-medium text-slate-400 m-0 mb-2 uppercase tracking-wider">
            Servicios AWS
          </h4>
          <span className="text-3xl font-bold text-blue-400 block">
            {processedData.totalServices}
          </span>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center shadow-lg transition-all duration-300 hover:bg-white/8 hover:-translate-y-1">
          <h4 className="text-sm font-medium text-slate-400 m-0 mb-2 uppercase tracking-wider">
            Tipos de Unidad
          </h4>
          <span className="text-3xl font-bold text-blue-400 block">
            {processedData.totalUnits}
          </span>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center shadow-lg transition-all duration-300 hover:bg-white/8 hover:-translate-y-1">
          <h4 className="text-sm font-medium text-slate-400 m-0 mb-2 uppercase tracking-wider">
            Tipos de Uso
          </h4>
          <span className="text-3xl font-bold text-blue-400 block">
            {processedData.uniqueUsageTypes}
          </span>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center shadow-lg transition-all duration-300 hover:bg-white/8 hover:-translate-y-1">
          <h4 className="text-sm font-medium text-slate-400 m-0 mb-2 uppercase tracking-wider">
            Total Registros
          </h4>
          <span className="text-3xl font-bold text-blue-400 block">
            {processedData.totalRecords.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Unit analysis */}
      <div className="grid grid-cols-2 gap-8 mb-8 max-lg:grid-cols-1">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-xl font-semibold m-0 mb-4 text-slate-100 text-center">
            📊 Análisis por Unidad de Medida
          </h3>
          <div className="flex flex-col gap-4">
            {Object.entries(processedData.unitAnalysis).map(([unit, analysis]: [string, UnitAnalysis]) => (
              <div key={unit} className="bg-white/3 rounded-xl p-4 border border-white/10 transition-all duration-200 hover:bg-white/8 hover:border-blue-400/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-blue-400 text-lg">{unit}</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {analysis.totalConsumption.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-slate-400 max-sm:flex-col max-sm:gap-2">
                  <span>🔧 {analysis.services.size} servicios</span>
                  <span>📋 {analysis.usageTypes.size} tipos de uso</span>
                  <span>📄 {analysis.records.length} registros</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-xl font-semibold m-0 mb-4 text-slate-100 text-center">
            💰 Top Items para Estimación de Costos
          </h3>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-4 p-3 bg-white/8 rounded-lg font-semibold text-slate-100 text-sm uppercase tracking-wide max-sm:grid-cols-1 max-sm:gap-2">
              <span>Servicio - Tipo de Uso</span>
              <span className="max-sm:hidden">Unidad</span>
              <span>Cantidad</span>
            </div>
            {processedData.topConsumptionItems.map((item: TopConsumptionItem, index: number) => (
              <div key={`${item.key}-${index}`} className="grid grid-cols-3 gap-4 p-3 bg-white/3 rounded-lg items-center transition-all duration-200 border border-transparent hover:bg-white/8 hover:border-white/10 max-sm:grid-cols-1 max-sm:gap-2">
                <div className="flex items-center gap-3 max-sm:flex-col max-sm:items-start max-sm:gap-2">
                  <span className="font-semibold text-blue-400 text-sm min-w-8">#{index + 1}</span>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-200 font-medium">{item.Servicio}</span>
                    <span className="text-slate-400 text-sm italic">{item.TipoDeUso}</span>
                  </div>
                </div>
                <span className="text-yellow-400 font-semibold text-sm max-sm:text-xs max-sm:ml-8">{item.Unidad}</span>
                <span className="text-emerald-400 font-semibold font-mono max-sm:ml-8">{item.CantidadConsumida.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
