import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && bcrypt.compareSync(password, user.password)) {
      // Generate a JWT token
      const token = jwt.sign(
        { email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Send the token to the client
      res.status(200).json({ token, message: 'Successfully signed in!' });
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
  
  const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401); // No token found
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403); // Token is not valid
      req.user = decoded; // Add the decoded user to the request object
      next(); // Proceed to the next middleware or route handler
    });
  };

  app.get('/api/user', verifyToken, (req, res) => {
    // Since the verifyToken middleware adds the decoded token to req.user, 
    // you can use that information here.
    const { email, username } = req.user;
    res.json({ email, username });
  });
  
  app.get('/api/index', (req, res) => {
    res.json({ message: "Welcome to the API" });
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  export default app;