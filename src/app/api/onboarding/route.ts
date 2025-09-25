import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5005';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Parse form data since the frontend sends FormData with potential file upload
    const formData = await request.formData();
    const businessName = formData.get('businessName') as string;
    const businessDescription = formData.get('businessDescription') as string;
    const mainKeywords = formData.get('mainKeywords') as string;
    const businessId = formData.get('businessId') as string;
    const logo = formData.get('logo') as File | null;

    if (!businessName || !businessDescription || !mainKeywords || !businessId) {
      return NextResponse.json(
        { success: false, message: 'Business name, description, keywords, and business ID are required' },
        { status: 400 }
      );
    }

    // Create a new FormData to forward to backend
    const backendFormData = new FormData();
    backendFormData.append('businessName', businessName);
    backendFormData.append('businessDescription', businessDescription);
    backendFormData.append('mainKeywords', mainKeywords);
    backendFormData.append('businessId', businessId);

    if (logo && logo.size > 0) {
      backendFormData.append('logo', logo);
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/auth/onboarding`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        // Don't set Content-Type for FormData, let the browser set it with boundary
      },
      body: backendFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Onboarding failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
