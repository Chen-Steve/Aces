import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.post('/api/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: 'Successfully signed in!' });
      } else {
        res.status(401).json({ error: 'Email or password is incorrect' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
  
    // Generate a random username
    const username = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      style: 'capital', 
      separator: '',
      length: 1, 
    });
  
    try {
      // Include the username in the data to be saved
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, username },
      });
      res.status(201).json({ user });
    } catch (error) { 
      res.status(400).json({ error: error.message });
    }
  });
  
  
  app.get('/api/index', (req, res) => {
    res.json({ message: "Welcome to the API" });
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  export default app;