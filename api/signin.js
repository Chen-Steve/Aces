const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Ensure method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse the JSON body
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Check if user exists and password is correct
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Email or password is incorrect' });
    }

    // Sign-in successful
    res.status(200).json({ message: "Successfully signed in!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};