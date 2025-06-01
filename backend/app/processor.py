import pandas as pd
import io

def process_parquet_file(file_contents: bytes):
    """
    Lee un archivo Parquet desde bytes, procesa los datos de consumo y devuelve un resumen.
    """
    try:
        # Leer el archivo Parquet desde el contenido en memoria
        parquet_file = io.BytesIO(file_contents)
        df = pd.read_parquet(parquet_file)

        # Filtrar solo por ítems de tipo 'Usage' o relevantes para consumo
        # Ajusta estos según los tipos de línea que consideres "uso"
        relevant_line_item_types = ['Usage', 'SavingsPlanCoveredUsage', 'DiscountedUsage']
        df_usage = df[df['line_item_line_item_type'].isin(relevant_line_item_types)].copy()

        if df_usage.empty:
            return {"error": "No 'Usage' line items found in the Parquet file."}

        # Asegurarse que line_item_usage_amount es numérico
        df_usage['line_item_usage_amount'] = pd.to_numeric(df_usage['line_item_usage_amount'], errors='coerce')
        df_usage.dropna(subset=['line_item_usage_amount'], inplace=True)

        # Agrupar y sumar
        consumption_report = df_usage.groupby([
            'product_product_name',
            'line_item_product_code',
            'line_item_usage_type',
            'pricing_unit' # ¡Clave para tu estimación!
        ])['line_item_usage_amount'].sum().reset_index()

        consumption_report.rename(columns={
            'product_product_name': 'Servicio',
            'line_item_product_code': 'CodigoServicio',
            'line_item_usage_type': 'TipoDeUso',
            'pricing_unit': 'Unidad',
            'line_item_usage_amount': 'CantidadConsumida'
        }, inplace=True)

        # Convertir a lista de diccionarios para la respuesta JSON
        return consumption_report.to_dict(orient='records')

    except Exception as e:
        # Loguear el error si tienes un sistema de logging
        print(f"Error processing Parquet file: {e}")
        return {"error": f"Failed to process Parquet file: {str(e)}"}   