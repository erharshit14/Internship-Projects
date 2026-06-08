// XSS escape helper
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// =====================
// DATA (fetched from API)
// =====================
async function loadSkills() {
  try {
    const res = await fetch('/api/skills');
    const data = await res.json();
    renderSkills(data);
  } catch {
    renderSkills(FALLBACK_SKILLS);
  }
}

async function loadProjects() {
  try {
    const res = await fetch('/api/projects');
    const data = await res.json();
    renderProjects(data);
  } catch {
    renderProjects(FALLBACK_PROJECTS);
  }
}

// =====================
// FALLBACK DATA
// =====================
const FALLBACK_SKILLS = [
  { category: "Frontend", items: ["React 18", "HTML5", "CSS3", "JavaScript", "TailwindCSS", "Vite"] },
  { category: "Backend", items: ["Node.js", "Express.js", "Flask", "FastAPI", "REST APIs"] },
  { category: "Database", items: ["PostgreSQL", "MongoDB", "MySQL", "Firebase"] },
  { category: "AI / ML", items: ["TensorFlow", "BERT", "scikit-learn", "OpenCV", "Python"] },
  { category: "DevOps & Tools", items: ["Git", "Docker", "Vercel", "Netlify", "Postman"] }
];

const FALLBACK_PROJECTS = [
  {
    icon: "🛡️",
    title: "AIShield Pro",
    description: "Multimodal AI-generated content detection platform. Detects AI-generated text (BERT), images (EfficientNet-B3), audio (AST), and video (3D-CNN + rPPG) with 90%+ accuracy.",
    stack: ["React 18", "FastAPI", "PyTorch", "Zustand", "Recharts"],
    github: "#",
    demo: "#"
  },
  {
    icon: "🌍",
    title: "ShieldHer",
    description: "AI-powered women's urban safety platform. Real-time risk scoring across 847+ micro-zones using Isolation Forest, with sub-0.3s threat detection and AES-256 encryption.",
    stack: ["React", "Flask", "Firebase", "Leaflet.js", "scikit-learn"],
    github: "#",
    demo: "#"
  },
  {
    icon: "🧠",
    title: "GoldenCare",
    description: "AI-powered cognitive & mental health monitoring platform for elderly users. Uses browser behavioral signals and Isolation Forest to detect anomalies early.",
    stack: ["React", "Flask", "Firebase", "Isolation Forest", "Chart.js"],
    github: "#",
    demo: "#"
  },
  {
    icon: "👻",
    title: "Ghost Hunter",
    description: "Fake job posting detector with a cyberpunk UI. NLP-powered classifier that flags fraudulent listings to protect job seekers from scams.",
    stack: ["Python", "scikit-learn", "Flask", "HTML/CSS/JS"],
    github: "#",
    demo: "#"
  },
  {
    icon: "🔒",
    title: "Smart Door Security",
    description: "IoT-based smart door system with real-time face recognition using OpenCV LBPH. Telegram Bot API for remote alerts and relay module control.",
    stack: ["Python", "OpenCV", "Raspberry Pi", "Telegram API", "IoT"],
    github: "#",
    demo: "#"
  },
  {
    icon: "🏫",
    title: "CampusSwap",
    description: "College-verified secondhand marketplace for students. Secure buy/sell platform with college email verification, chat, and category filters.",
    stack: ["React", "Node.js", "MongoDB", "Firebase Auth"],
    github: "#",
    demo: "#"
  }
];

// =====================
// RENDERERS
// =====================
function renderSkills(skills) {
  const grid = document.getElementById('skills-grid');
  grid.innerHTML = skills.map(cat => `
    <div class="skill-card">
      <div class="skill-category">${escHtml(cat.category)}</div>
      <div class="skill-list">
        ${cat.items.map(item => `<span class="skill-tag">${escHtml(item)}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = projects.map(p => `
    <div class="project-card">
      <div class="project-header">
        <span class="project-icon">${escHtml(p.icon)}</span>
        <div class="project-links">
          <a href="${escHtml(p.github)}" target="_blank" class="project-link">GitHub ↗</a>
          <a href="${escHtml(p.demo)}" target="_blank" class="project-link">Live ↗</a>
        </div>
      </div>
      <div class="project-title">${escHtml(p.title)}</div>
      <div class="project-desc">${escHtml(p.description)}</div>
      <div class="project-stack">
        ${p.stack.map(t => `<span class="stack-tag">${escHtml(t)}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// =====================
// CONTACT FORM
// =====================
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const status = document.getElementById('form-status');
  const body = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value
  };

  btn.textContent = 'Sending...';
  btn.disabled = true;
  status.textContent = '';
  status.className = 'form-status';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      status.textContent = '✓ Message sent! I\'ll reply within 24 hours.';
      status.className = 'form-status success';
      e.target.reset();
    } else {
      throw new Error(data.error || 'Failed to send');
    }
  } catch (err) {
    status.textContent = '✗ Something went wrong. Try emailing directly.';
    status.className = 'form-status error';
  }

  btn.textContent = 'Send Message →';
  btn.disabled = false;
});

// =====================
// HAMBURGER MENU
// =====================
document.getElementById('hamburger').addEventListener('click', () => {
  const links = document.querySelector('.nav-links');
  links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
  links.style.flexDirection = 'column';
  links.style.position = 'absolute';
  links.style.top = '70px';
  links.style.right = '1.5rem';
  links.style.background = '#111';
  links.style.padding = '1rem';
  links.style.borderRadius = '8px';
  links.style.border = '1px solid rgba(240,237,230,0.1)';
  links.style.gap = '1rem';
});

// =====================
// SCROLL ANIMATIONS
// =====================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.skill-card, .project-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// =====================
// INIT
// =====================
loadSkills();
loadProjects();
