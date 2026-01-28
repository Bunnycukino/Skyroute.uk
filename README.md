# SkyRoute OK

Modern, clean rebuild of the SkyRoute C209/C208 management system with a production-ready full-stack architecture.

## Features

- **C209/C208 Management** - Complete cargo documentation and tracking system
- **Ramp Input** - Create C209 entries with container codes
- **Logistic Input** - Generate C208 numbers and track shipments
- **Flight Handling** - Support for RW flights and NEW BUILD entries
- **48-hour Expiry Tracking** - Automatic expiry warnings
- **Database-backed** - PostgreSQL/Neon with proper migrations
- **Modern UI** - Built with Radix UI and Tailwind CSS
- **Type-safe** - Full TypeScript with Zod validation

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: Radix UI, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon) with `postgres` driver
- **Forms**: React Hook Form + Zod validation
- **Date**: date-fns
- **Toast**: Sonner

## Project Structure

```
skyroute-ok/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Dashboard/Home
│   │   ├── api/                # API routes
│   │   │   ├── entries/        # CRUD for entries
│   │   │   └── debug/          # Debug endpoints
│   │   └── (routes)/           # Feature pages
│   │       ├── ramp/           # Ramp Input
│   │       ├── logistic/       # Logistic Input
│   │       └── log/            # View logs
│   ├── components/             # React components
│   │   ├── ui/                 # Radix UI components
│   │   └── forms/              # Form components
│   ├── lib/                    # Business logic
│   │   ├── db.ts               # Database connection
│   │   ├── entries-service.ts  # Entry CRUD logic
│   │   └── utils.ts            # Utility functions
│   └── types/                  # TypeScript types
│       └── entry.ts            # Entry types
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- Neon PostgreSQL database (or any PostgreSQL instance)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL="postgres://user:pass@host/db?sslmode=require"
```

For Neon, use the **pooled connection string**.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm run start
```

## Deployment

Deploys to Vercel automatically on push to `main`.

1. Connect repo to Vercel
2. Add `DATABASE_URL` environment variable in Vercel dashboard
3. Deploy

## Database Schema

The app expects a PostgreSQL database with the following table:

```sql
CREATE TABLE entries (
  id SERIAL PRIMARY KEY,
  c209 VARCHAR(50) UNIQUE NOT NULL,
  c208 VARCHAR(50),
  container_code VARCHAR(100),
  pieces INTEGER,
  flight VARCHAR(50),
  signature VARCHAR(100),
  entry_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

## API Endpoints

- `POST /api/entries/create` - Create new entry
- `GET /api/entries/list` - List all entries
- `PUT /api/entries/update` - Update entry
- `DELETE /api/entries/delete` - Delete entry
- `GET /api/debug` - Debug database connection

## License

Private

## Notes

This is a clean, production-ready redesign of `skyroute.uk` with:
- Proper separation of concerns
- Working backend (fixed Neon/Supabase issues)
- Type safety throughout
- Scalable architecture
