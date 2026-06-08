# 🚀 Harshit's Portfolio — Full Stack

**Stack:** HTML/CSS/JS (Frontend) · Node.js + Express (Backend) · PostgreSQL (DB)

---

## 📁 Project Structure

```
portfolio/
├── public/
│   ├── index.html       ← Main HTML page
│   ├── style.css        ← All styles (dark theme)
│   ├── app.js           ← Frontend JS (API calls, form, animations)
│   └── resume.pdf       ← ⚠️ ADD YOUR RESUME HERE
├── server.js            ← Node.js + Express backend
├── package.json
├── .env                 ← ⚠️ CREATE THIS (see below)
└── README.md
```

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` file
```env
DATABASE_URL=postgresql://localhost:5432/portfolio
PORT=3000
ADMIN_KEY=your-secret-key-here
NODE_ENV=development
```

### 3. Set up PostgreSQL
```bash
# Create the database
createdb portfolio
```
> Tables auto-create on first run (contacts, projects, skills)

### 4. Add your resume
```bash
# Drop your resume PDF into:
public/resume.pdf
```

### 5. Run locally
```bash
npm run dev      # with nodemon (auto-restart)
# OR
npm start        # plain node
```

Open `http://localhost:3000` 🎉

---

## 🌐 Deployment

### Frontend + Backend → Render / Railway
1. Push code to GitHub
2. Connect repo to [Render](https://render.com) or [Railway](https://railway.app)
3. Set environment variables in dashboard
4. Add PostgreSQL add-on

### Frontend only → Vercel / Netlify
1. Separate the `public/` folder
2. Change API calls in `app.js` to your backend URL

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Fetch all projects |
| GET | `/api/skills` | Fetch all skill categories |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/contacts?key=ADMIN_KEY` | View all messages (admin) |
| GET | `/resume` | Download resume PDF |

### Contact POST body:
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "message": "Would love to collaborate!"
}
```

---

## 🎨 Customization

**Add your info in `public/index.html`:**
- Update hero text, name, and links

**Add projects in `server.js`:**
- Edit the `projects` array in `seedData()` function

**Update links:**
- GitHub, LinkedIn, email in `index.html`

---

## 📦 Tech Stack Details

- **Frontend:** Vanilla HTML/CSS/JS, Google Fonts (Syne + DM Sans)
- **Backend:** Node.js 18+, Express.js 4
- **Database:** PostgreSQL (via `pg` driver), auto-seeded
- **Deploy:** Render / Railway / Heroku (backend) + Vercel (frontend)
