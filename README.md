# 🧭 Raahi — Travel Together. Trust First.

Raahi is a **student-exclusive travel companion platform** that connects verified college students who share the same destination, budget, and travel style. Built with pure HTML, CSS, and JavaScript, powered by Supabase for authentication and real-time features.

## 🌐 Live Demo

> Deployed at: **[https://raahi.vercel.app](https://raahi.vercel.app)**

---

## ✨ Features

- 🛡️ **College Email Verification** — Only `@aitr.ac.in` and `@acropolis.in` emails allowed
- 🤝 **Smart Matching** — Algorithm-based travel partner matching
- 📊 **Trust Scores** — Community-driven reputation system
- 💬 **Real-time Chat** — Supabase-powered live messaging
- 🗺️ **Trip Planning** — Create, browse, and join trips
- ⭐ **Reviews & Ratings** — Post-trip feedback system
- 🆘 **Emergency SOS** — One-tap safety feature

---

## 🗂️ Project Structure

```
Raahi/
├── index.html              # Landing page
├── login.html              # Login
├── register.html           # Registration
├── verify-email.html       # Email verification
├── onboarding.html         # New user onboarding
├── dashboard.html          # User dashboard
├── discover.html           # Discover trips
├── trips.html              # My trips
├── trip-detail.html        # Trip detail view
├── matches.html            # Travel matches
├── chat.html               # Real-time messaging
├── profile.html            # User profile
├── reviews.html            # Reviews
├── settings.html           # Settings
├── forgot-password.html    # Password reset
├── auth-callback.html      # Supabase auth redirect handler
├── css/                    # Stylesheets
│   ├── variables.css       # Design tokens / CSS variables
│   ├── reset.css           # CSS reset
│   ├── typography.css      # Font styles
│   ├── components.css      # Reusable UI components
│   ├── layout.css          # Page layouts
│   ├── animations.css      # Motion & transitions
│   ├── utilities.css       # Utility classes
│   ├── landing.css         # Landing page styles
│   ├── auth.css            # Auth page styles
│   ├── dashboard.css       # Dashboard styles
│   ├── chat.css            # Chat styles
│   └── onboarding.css      # Onboarding styles
├── js/
│   ├── supabase-client.js  # Supabase client + all API wrappers
│   ├── app.js              # Global utilities (toasts, navbar, etc.)
│   ├── auth.js             # Authentication handlers
│   ├── dashboard.js        # Dashboard logic
│   ├── discover.js         # Trip discovery
│   ├── trips.js            # Trip management
│   ├── chat.js             # Real-time chat
│   ├── matches.js          # Matching logic
│   ├── profile.js          # Profile management
│   ├── onboarding.js       # Onboarding flow
│   └── landing.js          # Landing page animations
├── vercel.json             # Vercel deployment configuration
└── .gitignore
```

---

## 🚀 Deploying to Vercel

This is a **pure static site** — no build step required.

### Step 1 — Push to GitHub
```bash
git add .
git commit -m "deploy: ready for Vercel"
git push origin main
```

### Step 2 — Import into Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the `Raahi` GitHub repository
3. **Framework Preset**: Leave as `Other` (no framework)
4. **Build Command**: *(leave empty)*
5. **Output Directory**: *(leave empty / `.`)*

### Step 3 — Add Environment Variables
In Vercel Project Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| *(none needed — credentials are hardcoded in `js/supabase-client.js`)* | |

> **Note:** The Supabase anon key is a public key and safe to expose in client-side JS.

### Step 4 — Deploy
Click **Deploy**. Vercel will detect the static site and serve it instantly.

---

## 🔧 Supabase Setup

After deployment, update these in your **Supabase Dashboard** (Authentication → URL Configuration):

- **Site URL**: `https://your-project.vercel.app`
- **Redirect URLs**: `https://your-project.vercel.app/auth-callback`

---

## 🛠️ Local Development

No build tools needed. Simply open `index.html` in your browser, or use a local server:

```bash
# Using Python
python -m http.server 3000

# Using VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

---

## 📄 License

MIT © 2026 Raahi. Made with ❤️ for students.
