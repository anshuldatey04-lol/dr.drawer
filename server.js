import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import session from 'express-session';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// --- DATABASE SETUP ---
const db = new Database(join(__dirname, 'database.sqlite'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    name TEXT,
    password TEXT,
    googleId TEXT
  );

  CREATE TABLE IF NOT EXISTS drawers (
    id TEXT PRIMARY KEY,
    userId INTEGER,
    name TEXT,
    emoji TEXT,
    gradientColors TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

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
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    action TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// --- ENVIRONMENT ---
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const FRONTEND_URL = IS_PRODUCTION ? 'https://dr-drawer.onrender.com' : 'http://localhost:5173';
const BACKEND_URL = IS_PRODUCTION ? 'https://dr-drawer.onrender.com' : 'http://localhost:3001';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// --- GOOGLE OAUTH ---
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${BACKEND_URL}/api/auth/google/callback`
  },
  function(accessToken, refreshToken, profile, done) {
    const email = profile.emails[0].value;
    const name = profile.displayName;
    const googleId = profile.id;

    try {
      let user = db.prepare('SELECT * FROM users WHERE googleId = ? OR email = ?').get(googleId, email);
      if (user) {
        if (!user.googleId) {
          db.prepare('UPDATE users SET googleId = ? WHERE id = ?').run(googleId, user.id);
        }
        return done(null, user);
      } else {
        const result = db.prepare('INSERT INTO users (email, name, googleId) VALUES (?, ?, ?)').run(email, name, googleId);
        const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        return done(null, newUser);
      }
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  try {
    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// --- SECURITY HEADERS ---
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

// --- CORS ---
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

// --- SESSION ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: IS_PRODUCTION,   // true on Render (HTTPS), false locally
    sameSite: IS_PRODUCTION ? 'none' : 'lax',  // 'none' required for cross-site on Render
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// --- RATE LIMITING ---
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

// --- HELPERS ---
const logEvent = (userId, action, details) => {
  try {
    db.prepare('INSERT INTO audit_logs (userId, action, details) VALUES (?, ?, ?)').run(
      userId, action, JSON.stringify(details)
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

// --- ZOD SCHEMAS ---
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

// --- AUTH MIDDLEWARE ---
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
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

    const existing = db.prepare('SELECT email FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (email, name, password) VALUES (?, ?, ?)').run(email, name, hash);

    req.session.userId = result.lastInsertRowid;
    logEvent(result.lastInsertRowid, 'SIGNUP_SUCCESS', { email });
    res.json({ message: 'User created', user: { id: result.lastInsertRowid, email, name } });
  } catch (err) {
    if (err.errors) return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
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
  try {
    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

// --- GOOGLE OAUTH ROUTES ---
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/?error=auth_failed` }),
  function(req, res) {
    req.session.userId = req.user.id;
    res.redirect(FRONTEND_URL);
  });

// --- DRAWER ENDPOINTS ---

app.get('/api/drawers', requireAuth, (req, res) => {
  try {
    const drawers = db.prepare('SELECT * FROM drawers WHERE userId = ?').all(req.session.userId);
    const drawersWithLinks = drawers.map(drawer => {
      const links = db.prepare('SELECT * FROM links WHERE drawerId = ? AND userId = ?').all(drawer.id, req.session.userId);
      return {
        ...drawer,
        gradientColors: JSON.parse(drawer.gradientColors),
        links: links || []
      };
    });
    res.json({ drawers: drawersWithLinks });
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/drawers', requireAuth, (req, res) => {
  try {
    const { id, name, emoji, gradientColors } = req.body;
    db.prepare('INSERT INTO drawers (id, userId, name, emoji, gradientColors) VALUES (?, ?, ?, ?, ?)').run(
      id, req.session.userId, name, emoji, JSON.stringify(gradientColors)
    );
    logEvent(req.session.userId, 'DRAWER_CREATED', { id });
    res.json({ message: 'Drawer saved' });
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/drawers/:id', requireAuth, (req, res) => {
  try {
    const drawerId = req.params.id;
    const row = db.prepare('SELECT userId FROM drawers WHERE id = ?').get(drawerId);
    if (!row || row.userId !== req.session.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    db.prepare('DELETE FROM drawers WHERE id = ?').run(drawerId);
    db.prepare('DELETE FROM links WHERE drawerId = ? AND userId = ?').run(drawerId, req.session.userId);
    logEvent(req.session.userId, 'DRAWER_DELETED', { id: drawerId });
    res.json({ message: 'Drawer deleted' });
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

// --- LINK ENDPOINTS ---

app.post('/api/links', requireAuth, (req, res) => {
  try {
    const { id, drawerId, name, url, emoji, category } = req.body;
    const row = db.prepare('SELECT userId FROM drawers WHERE id = ?').get(drawerId);
    if (!row || row.userId !== req.session.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    db.prepare('INSERT INTO links (id, drawerId, userId, name, url, emoji, category) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      id, drawerId, req.session.userId, name, url, emoji, category
    );
    logEvent(req.session.userId, 'LINK_CREATED', { id, drawerId });
    res.json({ message: 'Link added' });
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/links/:id', requireAuth, (req, res) => {
  try {
    const linkId = req.params.id;
    const row = db.prepare('SELECT userId FROM links WHERE id = ?').get(linkId);
    if (!row || row.userId !== req.session.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    db.prepare('DELETE FROM links WHERE id = ?').run(linkId);
    logEvent(req.session.userId, 'LINK_DELETED', { id: linkId });
    res.json({ message: 'Link deleted' });
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

// --- SERVE FRONTEND IN PRODUCTION ---
app.use(express.static(join(__dirname, 'dist')));
app.get('/{*path}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});