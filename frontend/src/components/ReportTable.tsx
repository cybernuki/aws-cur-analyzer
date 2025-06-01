import styles from '@/styles/ReportTable.module.css';
import { ReportItem } from '@/types/ReportItem'; 

interface ReportTableProps {
  data: ReportItem[];
}

export default function ReportTable({ data }: ReportTableProps) {
  if (!data || data.length === 0) {
    return <p>No hay datos para mostrar o el formato es incorrecto.</p>;
  }

  // Asegurarse de que data[0] existe antes de intentar acceder a sus claves
  // Esto también ayuda si el backend devuelve un array vacío o un objeto de error que no es un array
  if (typeof data[0] !== 'object' || data[0] === null) {
     return <p>Formato de datos inesperado.</p>;
  }

  const columns = Object.keys(data[0]) as (keyof ReportItem)[];

  return (
    <div className={styles.tableContainer}>
      <h2>Informe de Consumo</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={`${rowIndex}-${column}`}>{String(row[column])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}