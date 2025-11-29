// JWT Token Utilities
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'niconve-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d'; // Token berlaku 7 hari

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function generateSessionToken() {
  return jwt.sign(
    { type: 'session', random: Math.random() },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}
