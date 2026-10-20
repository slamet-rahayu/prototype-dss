import { successResponse } from '@/server/utils/apiResponse.js';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = successResponse(null, 'Logout berhasil');

  // Clear HTTP cookies
  response.cookies.set({
    name: 'careerpath-token',
    value: '',
    path: '/',
    maxAge: 0
  });
  response.cookies.set({
    name: 'careerpath-role',
    value: '',
    path: '/',
    maxAge: 0
  });

  return response;
}

export async function GET() {
  return POST();
}
