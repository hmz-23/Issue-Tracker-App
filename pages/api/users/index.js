import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This is an example of a POST request handler in a Next.js API route
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      const newUser = await prisma.user.create({
        data: {
          email,
          password,
          role: 'USER' // or 'ADMIN'
        },
      });

      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create user.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}