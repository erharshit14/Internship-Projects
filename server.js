const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// MIDDLEWARE
// =====================
// CORS — only allow your own domain in production
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? [process.env.ALLOWED_ORIGIN]
  : ['http://localhost:3000'];
app.use(cors({ origin: allowedOrigins }));

// Limit request body size (prevent large payload attacks)
app.use(express.json({ limit: '10kb' }));

// Simple rate limiter for /api/contact (max 5 requests per IP per 10 min)
const contactRequests = new Map();
function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const max = 5;
  const entry = contactRequests.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    contactRequests.set(ip, { count: 1, start: now });
    return next();
  }
  if (entry.count >= max) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  entry.count++;
  contactRequests.set(ip, entry);
  next();
}
app.use(express.static(path.join(__dirname, 'public')));

// =====================
// DATABASE (PostgreSQL)
// =====================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/portfolio',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create tables on startup
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        icon VARCHAR(10),
        title VARCHAR(100) NOT NULL,
        description TEXT,
        stack TEXT[],
        github_url VARCHAR(300),
        demo_url VARCHAR(300),
        sort_order INT DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        category VARCHAR(80) NOT NULL,
        items TEXT[] NOT NULL,
        sort_order INT DEFAULT 0
      );
    `);
    console.log('✅ Database tables ready');
    await seedData();
  } catch (err) {
    console.warn('⚠️  DB not connected, running without database:', err.message);
  }
}

async function seedData() {
  const { rows } = await pool.query('SELECT COUNT(*) FROM projects');
  if (parseInt(rows[0].count) > 0) return;

  const skills = [
    { category: 'Frontend', items: ['React 18', 'HTML5', 'CSS3', 'JavaScript', 'TailwindCSS', 'Vite'], sort_order: 1 },
    { category: 'Backend',  items: ['Node.js', 'Express.js', 'Flask', 'FastAPI', 'REST APIs'],      sort_order: 2 },
    { category: 'Database', items: ['PostgreSQL', 'MongoDB', 'MySQL', 'Firebase'],                   sort_order: 3 },
    { category: 'AI / ML',  items: ['TensorFlow', 'BERT', 'scikit-learn', 'OpenCV', 'Python'],      sort_order: 4 },
    { category: 'DevOps',   items: ['Git', 'Docker', 'Vercel', 'Netlify', 'Postman'],               sort_order: 5 }
  ];

  const projects = [
    { icon: '🛡️', title: 'AIShield Pro',       description: 'Multimodal AI-generated content detection. Covers text (BERT), images (EfficientNet-B3), audio (AST), video (3D-CNN + rPPG).', stack: ['React 18', 'FastAPI', 'PyTorch', 'Zustand'], github_url: '#', demo_url: '#', sort_order: 1 },
    { icon: '🌍', title: 'ShieldHer',           description: 'AI-powered women safety platform. 847+ micro-zones, Isolation Forest risk scoring, AES-256 encryption, sub-0.3s detection.', stack: ['React', 'Flask', 'Firebase', 'Leaflet.js'], github_url: '#', demo_url: '#', sort_order: 2 },
    { icon: '🧠', title: 'GoldenCare',          description: 'Cognitive health monitoring for elderly users using browser behavioral signals and ML anomaly detection.', stack: ['React', 'Flask', 'Firebase', 'scikit-learn'], github_url: '#', demo_url: '#', sort_order: 3 },
    { icon: '👻', title: 'Ghost Hunter',        description: 'Fake job posting detector. NLP classifier to protect job seekers from fraudulent listings.', stack: ['Python', 'scikit-learn', 'Flask'], github_url: '#', demo_url: '#', sort_order: 4 },
    { icon: '🔒', title: 'Smart Door Security', description: 'IoT face recognition door system with OpenCV LBPH, Telegram Bot API alerts, relay module control.', stack: ['Python', 'OpenCV', 'Raspberry Pi'], github_url: '#', demo_url: '#', sort_order: 5 },
    { icon: '🏫', title: 'CampusSwap',          description: 'College-verified secondhand marketplace. Secure platform with email verification, chat, and category filters.', stack: ['React', 'Node.js', 'MongoDB', 'Firebase'], github_url: '#', demo_url: '#', sort_order: 6 }
  ];

  for (const s of skills) {
    await pool.query('INSERT INTO skills (category, items, sort_order) VALUES ($1, $2, $3)', [s.category, s.items, s.sort_order]);
  }
  for (const p of projects) {
    await pool.query(
      'INSERT INTO projects (icon, title, description, stack, github_url, demo_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [p.icon, p.title, p.description, p.stack, p.github_url, p.demo_url, p.sort_order]
    );
  }
  console.log('🌱 Seed data inserted');
}

// =====================
// API ROUTES
// =====================

// GET /api/projects
app.get('/api/projects', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM projects ORDER BY sort_order');
    const formatted = rows.map(r => ({
      icon: r.icon,
      title: r.title,
      description: r.description,
      stack: r.stack,
      github: r.github_url,
      demo: r.demo_url
    }));
    res.json(formatted);
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/skills
app.get('/api/skills', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT category, items FROM skills ORDER BY sort_order');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/contact
app.post('/api/contact', rateLimiter, async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields required' });
  }
  // Sanitize: strip HTML tags to prevent XSS stored in DB
  const clean = (str) => String(str).replace(/<[^>]*>/g, '').trim().slice(0, 1000);
  const safeName    = clean(name).slice(0, 100);
  const safeEmail   = clean(email).slice(0, 150);
  const safeMessage = clean(message);
  const emailRegex  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(safeEmail)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  try {
    await pool.query(
      'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)',
      [safeName, safeEmail, safeMessage]
    );
    console.log(`📩 New message from ${safeName} <${safeEmail}>`);
    res.json({ success: true, message: 'Message received!' });
  } catch (err) {
    console.error('Contact save error:', err.message);
    console.log(`📩 [NO-DB] Message from ${safeName} (${safeEmail}): ${safeMessage}`);
    res.json({ success: true, message: 'Message received!' });
  }
});

// GET /api/contacts (admin - protect in production!)
app.get('/api/contacts', async (req, res) => {
  const secret = req.query.key;
  if (secret !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
});

// Resume download
app.get('/resume', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'resume.pdf');
  res.download(filePath, 'Harshit_Resume.pdf', (err) => {
    if (err) res.status(404).json({ error: 'Resume not found. Upload resume.pdf to public/' });
  });
});

// Catch-all → serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =====================
// START
// =====================
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Portfolio running at http://localhost:${PORT}`);
  });
});
