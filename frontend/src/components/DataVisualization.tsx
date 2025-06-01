import { useState, useEffect } from 'react';
import styles from '@/styles/DataVisualization.module.css';
import { ReportItem } from '@/types/ReportItem';

interface DataVisualizationProps {
  data: ReportItem[];
}

export default function DataVisualization({ data }: DataVisualizationProps) {
  const [processedData, setProcessedData] = useState<any>(null);

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
    }, {} as Record<string, any>);

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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Procesando datos...</p>
      </div>
    );
  }

  return (
    <div className={styles.visualizationContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Análisis de Costos AWS</h2>
        <p className={styles.subtitle}>Métricas para estimación de costos por unidad de medida</p>
      </div>

      {/* Key metrics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h4>Servicios AWS</h4>
          <span className={styles.statValue}>
            {processedData.totalServices}
          </span>
        </div>
        <div className={styles.statCard}>
          <h4>Tipos de Unidad</h4>
          <span className={styles.statValue}>
            {processedData.totalUnits}
          </span>
        </div>
        <div className={styles.statCard}>
          <h4>Tipos de Uso</h4>
          <span className={styles.statValue}>
            {processedData.uniqueUsageTypes}
          </span>
        </div>
        <div className={styles.statCard}>
          <h4>Total Registros</h4>
          <span className={styles.statValue}>
            {processedData.totalRecords.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Unit analysis */}
      <div className={styles.analysisGrid}>
        <div className={styles.analysisCard}>
          <h3 className={styles.chartTitle}>📊 Análisis por Unidad de Medida</h3>
          <div className={styles.unitAnalysisTable}>
            {Object.entries(processedData.unitAnalysis).map(([unit, analysis]: [string, any]) => (
              <div key={unit} className={styles.unitRow}>
                <div className={styles.unitHeader}>
                  <span className={styles.unitName}>{unit}</span>
                  <span className={styles.unitTotal}>{analysis.totalConsumption.toLocaleString()}</span>
                </div>
                <div className={styles.unitDetails}>
                  <span>🔧 {analysis.services.size} servicios</span>
                  <span>📋 {analysis.usageTypes.size} tipos de uso</span>
                  <span>📄 {analysis.records.length} registros</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.analysisCard}>
          <h3 className={styles.chartTitle}>💰 Top Items para Estimación de Costos</h3>
          <div className={styles.costEstimationTable}>
            <div className={styles.tableHeader}>
              <span>Servicio - Tipo de Uso</span>
              <span>Unidad</span>
              <span>Cantidad</span>
            </div>
            {processedData.topConsumptionItems.map((item: any, index: number) => (
              <div key={`${item.key}-${index}`} className={styles.costRow}>
                <div className={styles.costService}>
                  <span className={styles.rank}>#{index + 1}</span>
                  <div className={styles.serviceInfo}>
                    <span className={styles.serviceName}>{item.Servicio}</span>
                    <span className={styles.usageType}>{item.TipoDeUso}</span>
                  </div>
                </div>
                <span className={styles.unit}>{item.Unidad}</span>
                <span className={styles.consumption}>{item.CantidadConsumida.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
