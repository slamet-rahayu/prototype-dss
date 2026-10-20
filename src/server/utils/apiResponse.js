import { NextResponse } from 'next/server';

/**
 * Generates a standardized successful API JSON response.
 * @param {*} data 
 * @param {string} message 
 * @param {number} statusCode 
 * @param {*|null} meta 
 */
export function successResponse(data = {}, message = 'Operasi berhasil diselesaikan', statusCode = 200, meta = null) {
  return NextResponse.json({
    success: true,
    statusCode,
    message,
    data,
    meta
  }, { status: statusCode });
}

/**
 * Generates a standardized error API JSON response.
 * @param {string} message 
 * @param {number} statusCode 
 * @param {Array<{field?: string, issue: string}>|null} errors 
 */
export function errorResponse(message = 'Terjadi kesalahan pada request', statusCode = 400, errors = null) {
  const body = {
    success: false,
    statusCode,
    message
  };

  if (errors) {
    body.errors = errors;
  }

  return NextResponse.json(body, { status: statusCode });
}
