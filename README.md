# SkyRoute.uk
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
skyroute.uk/
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── layout.tsx  # Root layout
│   │   ├── page.tsx    # Dashboard/Home
│   │   ├── api/        # API routes
│   │   │   ├── entries/ # CRUD for entries
│   │   │   └── debug/   # Debug endpoints
│   │   └── (routes)/   # Feature pages
│   │       ├── ramp/    # Ramp Input
│   │       ├── logistic/ # Logistic Input
│   │       └── log/      # View logs
│   ├── components/     # React components
│   │   ├── ui/         # Radix UI components
│   │   └── forms/      # Form components
│   ├── lib/            # Business logic
│   │   ├── db.ts       # Database connection
```
