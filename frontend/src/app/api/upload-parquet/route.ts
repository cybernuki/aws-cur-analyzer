import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verificar que tenemos la API key configurada
    const apiKey = process.env.AWS_LAMBDA_API_KEY;
    const lambdaUrl = process.env.AWS_LAMBDA_URL;
    
    if (!apiKey) {
      console.error('AWS_LAMBDA_API_KEY not configured');
      return NextResponse.json(
        { detail: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (!lambdaUrl) {
      console.error('AWS_LAMBDA_URL not configured');
      return NextResponse.json(
        { detail: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Obtener el FormData del request
    const formData = await request.formData();
    
    // Verificar que hay un archivo
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json(
        { detail: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`Proxying file upload: ${file.name} (${file.size} bytes)`);

    // Hacer proxy a la Lambda con la API key
    const response = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        // No agregamos Content-Type, fetch lo maneja automáticamente para FormData
      },
      body: formData,
    });

    // Obtener la respuesta de la Lambda
    const responseData = await response.text();
    
    // Log para debugging
    console.log(`Lambda response status: ${response.status}`);
    console.log(`Lambda response headers:`, Object.fromEntries(response.headers.entries()));

    // Si la respuesta no es OK, devolver el error
    if (!response.ok) {
      console.error(`Lambda error: ${responseData}`);
      try {
        const errorJson = JSON.parse(responseData);
        return NextResponse.json(errorJson, { status: response.status });
      } catch {
        return NextResponse.json(
          { detail: responseData || 'Lambda function error' },
          { status: response.status }
        );
      }
    }

    // Parsear y devolver la respuesta exitosa
    try {
      const jsonData = JSON.parse(responseData);
      return NextResponse.json(jsonData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (parseError) {
      console.error('Failed to parse Lambda response as JSON:', parseError);
      console.error('Raw response:', responseData);
      return NextResponse.json(
        { detail: 'Invalid response from Lambda function' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Manejar OPTIONS para CORS (aunque Vercel lo maneja automáticamente)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
