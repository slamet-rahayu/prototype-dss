import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'sangat_rahasia_dan_panjang_kunci_jwt_signature_key_2026_dss_ta';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Hash plain password using bcrypt.
 * @param {string} password 
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Compare plain password with bcrypt hash.
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT token for user authentication.
 * @param {Object} payload 
 * @returns {string}
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token and return decoded payload.
 * @param {string} token 
 * @returns {Object|null}
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Extract bearer token from Request Authorization header.
 * @param {Request} request 
 * @returns {string|null}
 */
export function extractBearerToken(request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return null;
}
