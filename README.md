# Chatman Inc Website

AI Business Architecture consulting website built with Next.js 16 and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for lead capture)

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `CHATMAN_SUPABASE_URL` | Your Supabase project URL |
| `CHATMAN_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `CHATMAN_SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |

> **Note:** These variables use a `CHATMAN_` prefix to distinguish them from other Chatman Inc subdomain projects (e.g., realestatedemo.chatmaninc.com) that share the same Supabase account.

You can find these in your Supabase project dashboard under **Settings > API**.

### Supabase Setup

Create the `chatman_leads` table in your Supabase database by running this SQL:

```sql
CREATE TABLE chatman_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp default now(),
  name text not null,
  email text not null,
  company text,
  industry text,
  goal text not null,
  source text default 'website_modal'
);

CREATE INDEX idx_chatman_leads_email ON chatman_leads(email);
```

> **Note:** This uses `chatman_leads` (not `leads`) to keep main website leads separate from subdomain demo leads.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Lead Capture

Leads are captured via a modal popup that triggers:
- On CTA button clicks (intent trigger)
- After scrolling 50% of the viewport (scroll trigger)
- After 30 seconds on the page (time trigger)

The modal only shows once per session (tracked via sessionStorage).

Submitted leads are stored in the Supabase `leads` table with the following fields:
- `name` - Contact name (required)
- `email` - Contact email (required)
- `company` - Company name (optional)
- `industry` - Industry selection (optional)
- `goal` - Description of their challenge (required)
- `source` - Always set to `website_modal`
- `created_at` - Timestamp of submission

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set Framework Preset to **Next.js**
4. Add environment variables in Vercel dashboard
5. Deploy

### Environment Variables in Vercel

Add the same environment variables from `.env.local` to your Vercel project settings under **Settings > Environment Variables**.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v3
- **Database**: Supabase (PostgreSQL)
- **Fonts**: Instrument Serif + DM Sans
- **Deployment**: Vercel
