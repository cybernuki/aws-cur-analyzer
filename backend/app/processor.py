import pandas as pd
import io

def process_parquet_file(file_contents: bytes):
    """
    Reads a Parquet file from bytes, processes consumption data and returns a summary.
    """
    try:
        # Read the Parquet file from memory content
        parquet_file = io.BytesIO(file_contents)
        df = pd.read_parquet(parquet_file)

        # Filter only by 'Usage' type items or relevant for consumption
        # Adjust these according to the line types you consider "usage"
        relevant_line_item_types = ['Usage', 'SavingsPlanCoveredUsage', 'DiscountedUsage']
        df_usage = df[df['line_item_line_item_type'].isin(relevant_line_item_types)].copy()

        if df_usage.empty:
            # Consider whether to return an error or empty list if there's no usage data.
            # For consistency, an empty list might be better if the file is valid but has no 'Usage'.
            # return {"message": "No 'Usage' line items found matching the criteria."}
            return [] # Return empty list if there are no relevant usage items

        # Ensure line_item_usage_amount is numeric
        df_usage['line_item_usage_amount'] = pd.to_numeric(df_usage['line_item_usage_amount'], errors='coerce')
        df_usage.dropna(subset=['line_item_usage_amount'], inplace=True)

        # --- MODIFICATION TO GET THE SERVICE NAME CORRECTLY ---
        # The human-readable service name is usually in 'product.product_name'.
        # 'line_item_product_code' is the service code (e.g.: AmazonEC2) and is a good fallback.

        # Create an 'EffectiveServiceName' column to use in groupby.
        # Prioritize 'product.product_name' if it exists.
        if 'product.product_name' in df_usage.columns:
            df_usage['EffectiveServiceName'] = df_usage['product.product_name']
        # If not, try with 'product_name' (less common for nested CUR, but just in case)
        elif 'product_name' in df_usage.columns:
            df_usage['EffectiveServiceName'] = df_usage['product_name']
        # If none of the above exist, the 'EffectiveServiceName' column is not created here explicitly,
        # but the subsequent fillna with 'line_item_product_code' will handle it.
        # To be more explicit, we could initialize it with NAs:
        else:
            df_usage['EffectiveServiceName'] = pd.NA

        # Use 'line_item_product_code' as fallback if 'EffectiveServiceName' is NaN
        # (this covers cases where the 'product.product_name' column exists but has null values,
        # or if the 'product.product_name' and 'product_name' columns didn't exist).
        df_usage['EffectiveServiceName'] = df_usage['EffectiveServiceName'].fillna(df_usage['line_item_product_code'])

        # If 'EffectiveServiceName' could still be NaN (if 'line_item_product_code' was also null, very rare)
        # we could add a final fallback:
        df_usage['EffectiveServiceName'] = df_usage['EffectiveServiceName'].fillna('UnknownService')
        # --- END OF MODIFICATION ---

        # Group and sum
        # Use the new 'EffectiveServiceName' column for grouping.
        consumption_report = df_usage.groupby([
            'EffectiveServiceName',
            'line_item_product_code',
            'line_item_usage_type',
            'pricing_unit' # Key for your estimation!
        ])['line_item_usage_amount'].sum().reset_index()

        consumption_report.rename(columns={
            'EffectiveServiceName': 'Servicio', # Rename the derived column
            'line_item_product_code': 'CodigoServicio',
            'line_item_usage_type': 'TipoDeUso',
            'pricing_unit': 'Unidad',
            'line_item_usage_amount': 'CantidadConsumida'
        }, inplace=True)

        # Clean service names - remove "Amazon" from the beginning
        def clean_service_name(service_name):
            if isinstance(service_name, str):
                # Remove "Amazon " from the beginning (with space)
                if service_name.startswith('Amazon '):
                    return service_name[7:]  # Remove the first 7 characters "Amazon "
                # Remove "Amazon" from the beginning (without space)
                elif service_name.startswith('Amazon'):
                    return service_name[6:]  # Remove the first 6 characters "Amazon"
            return service_name

        consumption_report['Servicio'] = consumption_report['Servicio'].apply(clean_service_name)

        # Convert to list of dictionaries for JSON response
        return consumption_report.to_dict(orient='records')

    except Exception as e:
        # Log the error if you have a logging system
        print(f"Error processing Parquet file: {e}")
        # It's good practice to include the exception type to facilitate debugging
        return {"error": f"Failed to process Parquet file: {type(e).__name__} - {str(e)}"}