
// lib/auth.js
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import prisma from './prisma';

const SECRET = 'your-secret-key'; // In a real app, use an environment variable

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    SECRET,
    { expiresIn: '1h' }
  );
}

export function verifyToken(req) {
  const token = req.cookies.token;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}

export async function authMiddleware(handler) {
  return async (req, res) => {
    const user = verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    req.user = user;
    return handler(req, res);
  };
}

export async function adminAuthMiddleware(handler) {
  return async (req, res) => {
    const user = verifyToken(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user;
    return handler(req, res);
  };
}

export function setCookie(res, token) {
  const cookie = serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });
  res.setHeader('Set-Cookie', cookie);
}

export function clearCookie(res) {
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });
  res.setHeader('Set-Cookie', cookie);
}