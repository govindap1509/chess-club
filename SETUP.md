# Chess Club Management System — Setup Guide

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier is fine)
- A [Vercel](https://vercel.com) account for deployment

---

## 1. Clone & Install

```bash
git clone <your-repo-url>
cd chess-club
npm install
```

---

## 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Note your **Project URL** and **anon public key** from:
   `Project Settings → API`

---

## 3. Run the Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Open `supabase/schema.sql` from this repo
3. Paste the entire file contents and click **Run**

This creates:
- `profiles` — student info (name, class, rating, photo)
- `events` — club events
- `event_signups` — who joined which event
- `messages` — student → admin messaging
- `match_results` — game outcomes
- `profile-photos` storage bucket
- Row-Level Security policies for all tables

---

## 4. Configure Environment Variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Fill in your values:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public key |
| `NEXT_PUBLIC_ADMIN_EMAIL` | The email address you'll use as admin |

---

## 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 6. First Use

1. Go to `/login` and sign up with your **admin email** (the one set in `NEXT_PUBLIC_ADMIN_EMAIL`)
2. Fill in your profile at `/profile`
3. The Admin Panel is at `/admin` — only accessible to the admin email

---

## 7. Deploy to Vercel

```bash
npx vercel
```

Or connect your GitHub repo in the Vercel dashboard.

**Add all environment variables** from `.env.local` in:
Vercel → Project → Settings → Environment Variables

---

## Project Structure

```
chess-club/
├── app/
│   ├── page.tsx              # Homepage
│   ├── login/page.tsx        # Auth (sign in / sign up)
│   ├── dashboard/page.tsx    # Student dashboard
│   ├── profile/page.tsx      # Edit profile + upload photo
│   ├── events/page.tsx       # Browse & join events
│   ├── leaderboard/page.tsx  # Rating leaderboard
│   ├── messages/new/page.tsx # Send message to admin
│   └── admin/                # Admin panel (requires admin email)
│       ├── page.tsx          # Overview stats
│       ├── events/page.tsx   # Create / delete events
│       ├── students/page.tsx # View all students
│       ├── results/page.tsx  # Enter match results
│       └── messages/page.tsx # Reply to student messages
├── components/
│   ├── Navbar.tsx
│   ├── Avatar.tsx
│   └── BadgeChip.tsx
├── lib/
│   ├── badges.ts             # Badge logic (rating tiers)
│   └── supabase/
│       ├── client.ts         # Browser Supabase client
│       ├── server.ts         # Server Supabase client (SSR)
│       └── types.ts          # TypeScript DB types
├── middleware.ts             # Route protection
└── supabase/
    └── schema.sql            # Full DB schema + RLS
```

---

## Badge Tiers

| Badge | Rating Range |
|---|---|
| Beginner | < 900 |
| Rising Player | 900 – 999 |
| Club Player | 1000 – 1099 |
| Advanced | 1100 – 1199 |
| Master | 1200+ |

---

## Design System

The UI follows the **Danske × Google Design System**:

- Font: **DM Sans** (Google Fonts)
- Brand colour: `#1A73E8`
- Background: `#FFFFFF` / `#F8F9FA`
- Text: `#202124` / `#3C4043` / `#5F6368`
- Cards: white, 1px `#DADCE0` border, 12px radius
- No gradients, no coloured section backgrounds
