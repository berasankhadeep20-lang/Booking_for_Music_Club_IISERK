# 🎸 IISER Kolkata Music Club — Slot Booking System

A fair, automatic, real-time slot booking web app replacing the WhatsApp chaos.

**Live:** https://berasankhadeep20-lang.github.io/Booking_for_Music_Club_IISERK/

---

## Features

- Google OAuth — only `@iiserkol.ac.in` accounts accepted
- Campus WiFi check — only accessible from IISERK network (NKN IP range)
- Booking window opens exactly 1 hour before each slot
- 1 booking per student per day — enforced server-side
- Real-time updates via Firebase Realtime Database
- Instrument selection per booking
- Cancel up to 15 minutes before slot start
- Live countdown timer for upcoming slots

---

## Setup

### 1. Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication → Sign-in method → Google**
4. Enable **Realtime Database** (Asia region) — start in test mode
5. In Realtime Database rules, set:
```json
{
  "rules": {
    "bookings": {
      "$day": {
        "$slotId": {
          ".read": "auth != null",
          ".write": "auth != null && (!data.exists() || data.child('uid').val() === auth.uid)"
        }
      }
    }
  }
}
```
6. Add `berasankhadeep20-lang.github.io` to **Authentication → Settings → Authorized domains**

### 2. Local development

```bash
cp .env.example .env.local
# Fill in your Firebase values in .env.local
npm install
npm run dev
```

### 3. GitHub Actions deployment

Add these secrets to your repo (**Settings → Secrets → Actions**):

| Secret | Value |
|--------|-------|
| `VITE_FIREBASE_API_KEY` | From Firebase project settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_DATABASE_URL` | Realtime DB URL |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |

Then enable **GitHub Pages** → Source: **GitHub Actions**

Push to `main` → auto-deploys.

### 4. Campus WiFi IP

Connect to IISERK WiFi and visit `https://api.ipify.org` to check your public IP.
Update `IISERK_IP_PREFIXES` in `src/networkCheck.ts` if needed.

---

## Tech Stack

- React 18 + TypeScript + Vite
- Firebase Auth (Google OAuth) + Firebase Realtime Database
- GitHub Pages (hosting) + GitHub Actions (CI/CD)
- Syne + DM Mono (Google Fonts)

---

Built by Sankhadeep Bera (Ronnie) for the IISERK Music Club 🎵
