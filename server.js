import express from 'express';
import session from 'express-session';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

// 7. Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https:", "data:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true,
  frameguard: { action: 'deny' },
}));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Adjust to your frontend URL
  credentials: true,
}));

app.use(express.json());

// 1. Session Management
app.use(session({
  secret: 'taskdrawer_super_secret_key_777', // In production, use env variable
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset cookie expiration on every response
  cookie: { 
    httpOnly: true, 
    secure: false, // Set to true if using HTTPS
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// 10. Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts, please try again later' }
});

app.use('/api/', generalLimiter);

// Database Setup
const db = new sqlite3.Database(join(__dirname, 'database.sqlite'));

db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      name TEXT,
      password TEXT
    )
  `);

  // Drawers table (2. User Scoping)
  db.run(`
    CREATE TABLE IF NOT EXISTS drawers (
      id TEXT PRIMARY KEY,
      userId INTEGER,
      name TEXT,
      emoji TEXT,
      gradientColors TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);

  // Links table (2. User Scoping)
  db.run(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      drawerId TEXT,
      userId INTEGER,
      name TEXT,
      url TEXT,
      emoji TEXT,
      category TEXT,
      FOREIGN KEY(drawerId) REFERENCES drawers(id),
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);

  // 11. Audit Logging table
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      action TEXT,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Helper for Audit Logging
const logEvent = (userId, action, details) => {
  db.run('INSERT INTO audit_logs (userId, action, details) VALUES (?, ?, ?)', 
    [userId, action, JSON.stringify(details)]);
};

// 3. Zod Schemas
const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[@#$%^&*!]/, 'Password must contain special character'),
  name: z.string().min(1).max(255),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Middleware to check auth and session timeout
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    // Session timeout logic (handled by rolling: true and maxAge in express-session)
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// --- AUTH ENDPOINTS ---

app.post('/api/signup', async (req, res) => {
  try {
    const validatedData = signUpSchema.parse(req.body);
    const { email, name, password } = validatedData;

    db.get('SELECT email FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (row) return res.status(400).json({ error: 'Email already exists' });

      try {
        const hash = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (email, name, password) VALUES (?, ?, ?)', [email, name, hash], function(err) {
          if (err) return res.status(500).json({ error: 'Failed to create user' });
          
          req.session.userId = this.lastID;
          logEvent(this.lastID, 'SIGNUP_SUCCESS', { email });
          res.json({ message: 'User created', user: { id: this.lastID, email, name } });
        });
      } catch (error) {
        res.status(500).json({ error: 'Server error' });
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.errors ? err.errors[0].message : 'Invalid data' });
  }
});

app.post('/api/login', loginLimiter, (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        logEvent(null, 'LOGIN_DB_ERROR', { email });
        return res.status(500).json({ error: 'An error occurred. Please try again.' });
      }
      
      // 1. Generic error message to prevent enumeration
      if (!user) {
        logEvent(null, 'LOGIN_FAILED_USER_NOT_FOUND', { email });
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        logEvent(user.id, 'LOGIN_FAILED_BAD_PASSWORD', { email });
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      req.session.userId = user.id;
      logEvent(user.id, 'LOGIN_SUCCESS', { email });
      res.json({ message: 'Logged in', user: { id: user.id, email: user.email, name: user.name } });
    });
  } catch (err) {
    res.status(400).json({ error: 'Invalid email or password' });
  }
});

app.post('/api/logout', (req, res) => {
  const userId = req.session.userId;
  req.session.destroy();
  logEvent(userId, 'LOGOUT', {});
  res.json({ message: 'Logged out' });
});

app.get('/api/me', requireAuth, (req, res) => {
  db.get('SELECT id, email, name FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  });
});

// --- DATA ENDPOINTS (with User Scoping & Authorization) ---

// 2. Get Drawers (User Scoped)
app.get('/api/drawers', requireAuth, (req, res) => {
  db.all('SELECT * FROM drawers WHERE userId = ?', [req.session.userId], (err, drawers) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    // For each drawer, fetch its links
    const drawersWithLinks = [];
    if (drawers.length === 0) return res.json({ drawers: [] });

    let completed = 0;
    drawers.forEach((drawer) => {
      db.all('SELECT * FROM links WHERE drawerId = ? AND userId = ?', [drawer.id, req.session.userId], (err, links) => {
        if (!err) {
          drawersWithLinks.push({
            ...drawer,
            gradientColors: JSON.parse(drawer.gradientColors),
            links: links.map(l => ({ ...l }))
          });
        }
        completed++;
        if (completed === drawers.length) {
          res.json({ drawers: drawersWithLinks });
        }
      });
    });
  });
});

// Save Drawer
app.post('/api/drawers', requireAuth, (req, res) => {
  const { id, name, emoji, gradientColors } = req.body;
  db.run('INSERT INTO drawers (id, userId, name, emoji, gradientColors) VALUES (?, ?, ?, ?, ?)',
    [id, req.session.userId, name, emoji, JSON.stringify(gradientColors)], (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      logEvent(req.session.userId, 'DRAWER_CREATED', { id });
      res.json({ message: 'Drawer saved' });
    });
});

// Delete Drawer (with Ownership Check)
app.delete('/api/drawers/:id', requireAuth, (req, res) => {
  const drawerId = req.params.id;
  
  // 2. Authorization Check
  db.get('SELECT userId FROM drawers WHERE id = ?', [drawerId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row || row.userId !== req.session.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run('DELETE FROM drawers WHERE id = ?', [drawerId], (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      db.run('DELETE FROM links WHERE drawerId = ?', [drawerId]);
      logEvent(req.session.userId, 'DRAWER_DELETED', { id: drawerId });
      res.json({ message: 'Drawer deleted' });
    });
  });
});

// Add Link
app.post('/api/links', requireAuth, (req, res) => {
  const { id, drawerId, name, url, emoji, category } = req.body;

  // Verify drawer ownership
  db.get('SELECT userId FROM drawers WHERE id = ?', [drawerId], (err, row) => {
    if (err || !row || row.userId !== req.session.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run('INSERT INTO links (id, drawerId, userId, name, url, emoji, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, drawerId, req.session.userId, name, url, emoji, category], (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        logEvent(req.session.userId, 'LINK_CREATED', { id, drawerId });
        res.json({ message: 'Link added' });
      });
  });
});

// Delete Link
app.delete('/api/links/:id', requireAuth, (req, res) => {
  const linkId = req.params.id;
  db.get('SELECT userId FROM links WHERE id = ?', [linkId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row || row.userId !== req.session.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run('DELETE FROM links WHERE id = ?', [linkId], (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      logEvent(req.session.userId, 'LINK_DELETED', { id: linkId });
      res.json({ message: 'Link deleted' });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
