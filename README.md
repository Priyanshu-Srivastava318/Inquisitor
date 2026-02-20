# 🔒 INQUISITOR - AI-Powered SIEM Assistant

> Talk to your SIEM in plain English. No KQL. No DSL. Just natural language.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas (free tier works perfectly)
- **Auth**: JWT tokens

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Get MongoDB Atlas (Free)
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free account → Create a free cluster (M0)
3. Create a database user (username + password)
4. Whitelist your IP (or use `0.0.0.0/0` for development)
5. Click "Connect" → "Connect your application" → Copy the connection string

### Step 2: Setup Backend
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/inquisitor?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here_make_it_long
FRONTEND_URL=http://localhost:5173
```

Seed database with realistic data:
```bash
node seed.js
```

Start backend:
```bash
npm run dev
```

### Step 3: Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### Step 4: Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## 🔑 Default Login Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@inquisitor.io | admin123 |
| Analyst | analyst@inquisitor.io | analyst123 |

---

## 📁 Project Structure

```
inquisitor/
├── backend/
│   ├── models/          # MongoDB schemas
│   │   ├── User.js
│   │   ├── Threat.js
│   │   ├── Incident.js
│   │   └── ChatLog.js
│   ├── routes/          # API endpoints
│   │   ├── auth.js      # Login/Register
│   │   ├── threats.js   # Threat CRUD
│   │   ├── incidents.js # Incident management
│   │   └── chat.js      # NLP chat assistant
│   ├── middleware/
│   │   └── auth.js      # JWT middleware
│   ├── server.js        # Express app
│   ├── seed.js          # Database seeder
│   └── .env.example     # Environment template
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── LandingPage.jsx    # Homepage
        │   ├── LoginPage.jsx      # Login
        │   ├── SignupPage.jsx     # Register
        │   ├── Dashboard.jsx      # Main dashboard
        │   ├── ChatPage.jsx       # AI chat assistant
        │   ├── ThreatMonitor.jsx  # Real-time threats
        │   ├── IncidentsPage.jsx  # Incident management
        │   ├── RiskAssessment.jsx # Predictive analytics
        │   └── SettingsPage.jsx   # User settings
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── DashboardLayout.jsx
        │   └── ProtectedRoute.jsx
        ├── context/
        │   └── AuthContext.jsx    # Auth state
        └── utils/
            └── api.js             # Axios instance
```

---

## 🤖 Chat Assistant Queries
Try asking:
- "Show me failed login attempts"
- "Active threats right now"
- "Suspicious IPs today"
- "Weekly threat trends"
- "Critical threats"
- "Open incidents"
- "SQL injection attempts"
- "DDoS attacks"

---

## 🚀 Production Deployment

### Backend (Railway/Render/Fly.io):
1. Push to GitHub
2. Connect to Railway.app (free tier available)
3. Add environment variables in Railway dashboard
4. Deploy!

### Frontend (Vercel):
1. Push frontend to GitHub
2. Import project in Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy!

---

## 🔐 Role Permissions
- **Admin**: Full access, create/delete incidents, manage users
- **Analyst**: View + create incidents, update threat status
- **Viewer**: Read-only access to all dashboards

---

Built with ❤️ — INQUISITOR 2026
