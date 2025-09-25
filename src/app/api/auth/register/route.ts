import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5005';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email, role } = body;

    if (!username || !password || !email) {
      return NextResponse.json(
        { success: false, message: 'Username, password, and email are required' },
        { status: 400 }
      );
    }

    // Get authorization header from request
    const authHeader = request.headers.get('authorization');

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(authHeader && { 'Authorization': authHeader })
      },
      body: JSON.stringify({ username, password, email, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Registration failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
