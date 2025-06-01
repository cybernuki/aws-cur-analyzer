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
            # Considerar si devolver un error o una lista vacía si no hay datos de uso.
            # Para consistencia, una lista vacía podría ser mejor si el archivo es válido pero no tiene 'Usage'.
            # return {"message": "No 'Usage' line items found matching the criteria."}
            return [] # Devolver una lista vacía si no hay ítems de uso relevantes

        # Asegurarse que line_item_usage_amount es numérico
        df_usage['line_item_usage_amount'] = pd.to_numeric(df_usage['line_item_usage_amount'], errors='coerce')
        df_usage.dropna(subset=['line_item_usage_amount'], inplace=True)

        # --- MODIFICACIÓN PARA OBTENER EL NOMBRE DEL SERVICIO CORRECTAMENTE ---
        # El nombre del servicio legible por humanos suele estar en 'product.product_name'.
        # 'line_item_product_code' es el código del servicio (ej: AmazonEC2) y es un buen fallback.

        # Creamos una columna 'NombreServicioEfectivo' para usar en el groupby.
        # Priorizamos 'product.product_name' si existe.
        if 'product.product_name' in df_usage.columns:
            df_usage['NombreServicioEfectivo'] = df_usage['product.product_name']
        # Si no, intentamos con 'product_name' (menos común para CUR anidados, pero por si acaso)
        elif 'product_name' in df_usage.columns:
            df_usage['NombreServicioEfectivo'] = df_usage['product_name']
        # Si ninguna de las anteriores existe, la columna 'NombreServicioEfectivo' no se crea aquí explícitamente,
        # pero el fillna posterior con 'line_item_product_code' lo manejará.
        # Para ser más explícitos, podríamos inicializarla con NAs:
        else:
            df_usage['NombreServicioEfectivo'] = pd.NA

        # Usamos 'line_item_product_code' como fallback si 'NombreServicioEfectivo' es NaN
        # (esto cubre casos donde la columna 'product.product_name' existe pero tiene valores nulos,
        # o si las columnas 'product.product_name' y 'product_name' no existían).
        df_usage['NombreServicioEfectivo'] = df_usage['NombreServicioEfectivo'].fillna(df_usage['line_item_product_code'])
        
        # Si 'NombreServicioEfectivo' aún pudiera ser NaN (si 'line_item_product_code' también lo fuera, muy raro)
        # se podría añadir un último fallback:
        df_usage['NombreServicioEfectivo'] = df_usage['NombreServicioEfectivo'].fillna('UnknownService')
        # --- FIN DE LA MODIFICACIÓN ---

        # Agrupar y sumar
        # Usamos la nueva columna 'NombreServicioEfectivo' para agrupar.
        consumption_report = df_usage.groupby([
            'NombreServicioEfectivo',
            'line_item_product_code',
            'line_item_usage_type',
            'pricing_unit' # ¡Clave para tu estimación!
        ])['line_item_usage_amount'].sum().reset_index()

        consumption_report.rename(columns={
            'NombreServicioEfectivo': 'Servicio', # Renombrar la columna derivada
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
        # Es buena práctica incluir el tipo de excepción para facilitar el debugging
        return {"error": f"Failed to process Parquet file: {type(e).__name__} - {str(e)}"}