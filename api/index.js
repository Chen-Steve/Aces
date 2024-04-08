import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { uniqueNamesGenerator, adjectives, colors, animals, names, starWars } from 'unique-names-generator';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret'; // Fallback secret for development

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.status(200).json({ token, message: 'Successfully signed in!' });
    } else {
      res.status(401).json({ error: 'Email or password is incorrect' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An internal error occurred' });
  }
});

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  // Ensure both email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const username = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals, names, starWars],
      style: 'capital',
      separator: ' ',
      length: 2,
    });

    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, username },
    });

    const token = jwt.sign(
      { email: newUser.email, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
};

app.get('/api/user', verifyToken, async (req, res) => {
  const { email } = req.user;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true, username: true, wins: true, losses: true, draws: true, funds: true }
    });
    user ? res.json(user) : res.status(404).json({ error: 'User not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

app.post('/api/updateStats', verifyToken, async (req, res) => {
  const { email } = req.user;
  const { wins, losses, draws, funds } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { wins, losses, draws, funds },
    });
    res.json({ message: 'Stats updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

app.get('/api/index', (req, res) => {
  res.json({ message: "Welcome to the API" });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;