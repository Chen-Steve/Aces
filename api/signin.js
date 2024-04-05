import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({ message: 'Successfully signed in!' });
    } else {
      res.status(401).json({ error: 'Email or password is incorrect' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}