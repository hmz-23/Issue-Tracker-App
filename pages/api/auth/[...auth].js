import bcrypt from 'bcryptjs';
import { generateToken, setCookie, clearCookie, verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { auth } = req.query;

  switch (auth[0]) {
    case 'signup':
      await handleSignup(req, res);
      break;
    case 'login':
      await handleLogin(req, res);
      break;
    case 'logout':
      await handleLogout(req, res);
      break;
    case 'me':
      await handleMe(req, res);
      break;
    default:
      res.status(404).json({ message: 'Endpoint not found' });
      break;
  }
}

async function handleSignup(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    const token = generateToken(user);
    setCookie(res, token);
    res.status(201).json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function handleLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    setCookie(res, token);
    res.status(200).json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function handleLogout(req, res) {
  clearCookie(res);
  res.status(200).json({ message: 'Logged out successfully' });
}

async function handleMe(req, res) {
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ user: null });
  }
  res.status(200).json({ user });
}