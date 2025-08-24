// --- File 1: server.js ---
// This is the backend server code, now with full registration and login functionality.
//
// To run this file, you need to have Node.js installed.
// 1. Create a new folder for your project.
// 2. Open a terminal in that folder and run 'npm init -y' to create a package.json file.
// 3. Install the necessary packages: 'npm install express ws jsonwebtoken bcrypt'.
// 4. Create a file named 'server.js' and copy this code into it.
// 5. Create a file named 'index.html' and copy the code from File 2 below into it.
// 6. Run the server from your terminal with 'node server.js'.

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Set up middleware to parse JSON requests
app.use(express.json());

// Serve the static HTML file
app.use(express.static(path.join(__dirname, './')));

// A Set to hold all connected WebSocket clients for easy broadcasting
const clients = new Set();

// A simple in-memory store for issues and comments
const issues = {
    '123': [
        { id: Date.now(), text: 'This is the first comment.', author: 'User A' }
    ]
};

// --- In-memory "database" from your provided code ---
const users = [];
const SECRET_KEY = 'your_super_secret_jwt_key'; // Use an environment variable in production!

// --- Middleware to verify JWT from your provided code ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token missing' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// --- API Endpoints ---

// POST /api/auth/register - Registers a new user with a hashed password.
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { username, password: hashedPassword };
        users.push(newUser);

        console.log(`Registered new user: ${username}`);
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Registration failed:', error);
        res.status(500).json({ message: 'Internal server error during registration' });
    }
});

// POST /api/auth/login - Authenticates a user and issues a JWT.
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    try {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const payload = { username: user.username };
            const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

            console.log(`User logged in: ${username}`);
            return res.status(200).json({ message: 'Login successful!', token });
        } else {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ message: 'Internal server error during login' });
    }
});

// Simple /health endpoint to check server status
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Endpoint to add a new comment to an issue, now with authentication
app.post('/comment', authenticateToken, (req, res) => {
    const { issueId, text } = req.body;
    const author = req.user.username; // Get the username from the authenticated token

    if (!issueId || !text || !author) {
        return res.status(400).json({ error: 'Missing issueId, text, or author' });
    }

    if (!issues[issueId]) {
        return res.status(404).json({ error: 'Issue not found' });
    }

    const newComment = {
        id: Date.now(),
        text,
        author
    };

    issues[issueId].push(newComment);

    // Broadcast the new comment to all connected clients
    const message = JSON.stringify({ type: 'newComment', payload: newComment });
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });

    res.status(201).json(newComment);
});

// --- WebSocket Logic ---

wss.on('connection', (ws, req) => {
    clients.add(ws);
    console.log('New client connected.');

    ws.send(JSON.stringify({ type: 'initialComments', payload: issues['123'] }));

    ws.on('message', (message) => {
        console.log('Received message from client:', message);
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected.');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in multiple browser tabs to see real-time updates.`);
});