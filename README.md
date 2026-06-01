# ⚽ LaLiga Portal — Complete Setup Guide

A full-featured La Liga fan website with real-time scores, standings, history, live match streaming, and user management.

---

## 🗂️ File Structure

```
laliga-website/
├── index.html              ← Homepage
├── 404.html                ← Not found page
├── css/
│   └── style.css           ← All styles
├── js/
│   ├── firebase-config.js  ← Firebase setup (YOU MUST EDIT THIS)
│   ├── auth.js             ← Auth & user management
│   └── api.js              ← Football data API (YOU MUST EDIT THIS)
├── pages/
│   ├── scores.html         ← Live & past scores
│   ├── standings.html      ← League table
│   ├── clubs.html          ← All 20 clubs
│   ├── stats.html          ← Top scorers & assists
│   ├── history.html        ← Season-by-season history
│   ├── login.html          ← Sign in
│   ├── signup.html         ← Create account
│   ├── profile.html        ← User profile & password change
│   └── admin.html          ← Admin/Moderator panel
└── assets/
    └── logos/
        ├── laliga-icon.svg ← Favicon
        └── default.svg     ← Fallback club badge
```

---

## 🔑 STEP 1 — Get a Free Football Data API Key

1. Go to **https://www.football-data.org/**
2. Click **"Get Free API Key"** → Register with your email
3. Check your email and copy your API key
4. Open `js/api.js` and replace:
   ```js
   const API_KEY = "YOUR_FOOTBALL_DATA_API_KEY";
   ```
   With your actual key, e.g.:
   ```js
   const API_KEY = "abc123def456abc123";
   ```

> **Free tier includes:** La Liga, Premier League, Champions League & more. 10 calls/minute limit (the site caches responses to stay within limit).

---

## 🔥 STEP 2 — Create a Firebase Project

Firebase is the backend (authentication + database). It's **free**.

### 2a. Create project
1. Go to **https://console.firebase.google.com/**
2. Click **"Add project"**
3. Name it `laliga-portal` (or anything)
4. Disable Google Analytics (optional) → **Create project**

### 2b. Enable Authentication
1. In left sidebar → **Build → Authentication**
2. Click **"Get started"**
3. Click **"Email/Password"** → Enable toggle → **Save**

### 2c. Create Firestore Database
1. In left sidebar → **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** → **Next**
4. Choose a location (e.g. `europe-west`) → **Enable**

### 2d. Get your config keys
1. Click the **⚙️ gear icon** → **Project settings**
2. Scroll down to **"Your apps"** → Click **"</> Web"**
3. Register app name: `laliga-portal` → **Register app**
4. Copy the `firebaseConfig` object shown

### 2e. Paste config into `js/firebase-config.js`
Replace the placeholder values:
```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "laliga-portal.firebaseapp.com",
  databaseURL: "https://laliga-portal-default-rtdb.firebaseio.com",
  projectId: "laliga-portal",
  storageBucket: "laliga-portal.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 2f. Set Firestore Security Rules
1. In Firestore → **Rules** tab → Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read their own doc; admins/mods can read all
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && (
        request.auth.uid == userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator']
      );
    }

    // Settings readable by all logged-in users, writable by admin/mod
    match /settings/{doc} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator'];
    }
  }
}
```
2. Click **Publish**

---

## 👑 STEP 3 — Create Admin Account

The admin account is created **automatically** when you first open the login page.

- **Email:** `sakibhasn85@gmail.com`
- **Password:** `Sakib1998!`
- **Phone:** `01706363514`

Just visit `pages/login.html` once in your browser — the system will auto-create the admin account silently.

---

## 🚀 STEP 4 — Upload to GitHub & Go Live

### 4a. Create GitHub account
If you don't have one: **https://github.com/signup**

### 4b. Create a new repository
1. Go to **https://github.com/new**
2. Repository name: `laliga-portal` (or any name)
3. Set to **Public**
4. Do NOT initialize with README (we'll upload our own files)
5. Click **"Create repository"**

### 4c. Upload all files
**Option A — Upload via GitHub website (easiest):**
1. On your new repo page, click **"uploading an existing file"**
2. Drag and drop your entire `laliga-website` folder contents
3. ⚠️ Upload **all files and folders** maintaining the same folder structure
4. Scroll down → Click **"Commit changes"**

**Option B — Using Git (if you have Git installed):**
```bash
cd laliga-website
git init
git add .
git commit -m "Initial commit - LaLiga Portal"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/laliga-portal.git
git push -u origin main
```

### 4d. Enable GitHub Pages
1. In your repo → Click **Settings** tab
2. Scroll down to **"Pages"** in the left sidebar
3. Under **"Source"** → Select **"Deploy from a branch"**
4. Branch: **main** | Folder: **/ (root)**
5. Click **Save**
6. Wait 2–3 minutes → Your site will be live at:
   `https://YOUR_USERNAME.github.io/laliga-portal/`

---

## ✅ Features Summary

| Feature | Details |
|---|---|
| Live Scores | Auto-refreshes every 60 seconds |
| Standings | Full table with form, GD, zones |
| Stats | Top 10 scorers + Top 10 assists |
| Clubs | All 20 clubs with squad info |
| History | Season-by-season match results from 2015 |
| Guest View | Can see scores only |
| User Account | Email + phone + name + country required |
| Approval System | Admin/mod must approve new signups |
| Live Watch | Admin sets stream link; users see watch button |
| Guest Watch | Redirected to login if they click Watch Live |
| Admin Panel | Approve, ban, promote, demote users |
| Password Change | Works for all roles (admin, mod, user) |
| Auto Admin | `sakibhasn85@gmail.com` / `Sakib1998!` |

---

## 🛠️ Admin Panel Guide

Visit `pages/admin.html` after logging in as admin/moderator.

- **Users tab** → See all users, filter by status/role
  - ✅ Approve pending signups
  - 🚫 Ban/unban users
  - ⬆️ Promote user → moderator (admin only)
  - ⬇️ Demote moderator → user (admin only)
- **Live Match tab** → Paste any stream URL + match title
  - The "Watch Live" button + banner appear on homepage
  - Guest users clicking Watch Live → redirected to login
  - Logged-in users → stream opens in new tab
- **Change Password tab** → Update your own password

---

## ❓ Troubleshooting

**Scores not loading?**
→ Check your football-data.org API key in `js/api.js`
→ Free tier has rate limits — wait a minute and refresh

**Login not working?**
→ Confirm your Firebase config in `js/firebase-config.js`
→ Make sure Email/Password auth is enabled in Firebase console

**"Permission denied" errors?**
→ Check your Firestore security rules (Step 2f above)

**Site shows but no styles?**
→ Make sure you uploaded the `css/` folder with `style.css` inside

**GitHub Pages 404?**
→ Make sure `index.html` is in the root of your repo (not inside a subfolder)
→ Wait 5 minutes for GitHub Pages to deploy

---

## 📞 Support

Admin contact: sakibhasn85@gmail.com
