# SkyRoute UK - C209/C208 Management System

Complete cargo documentation and tracking system for Emirates SkyRoute.

## Features

- ✅ RAMP INPUT - Create C209 entries
- ✅ LOGISTIC INPUT - Generate C208 numbers
- ✅ Auto-generate monthly prefixed numbers (e.g., DEC0001)
- ✅ NEW BUILD support
- ✅ RW flight handling
- ✅ 48-hour expiry tracking
- ✅ Auto-backup every 6 hours
- ✅ Export to CSV
- ✅ Search and filter logs
- ✅ Responsive UI with shadcn/ui

## Tech Stack

- React 18
- Vite
- React Router
- React Hook Form + Zod
- Tailwind CSS
- shadcn/ui components
- date-fns
- sonner (toast notifications)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

Automatically deployed to Vercel on push to main branch.

## System Overview

### Workflow

1. **RAMP INPUT**: Enter container code and pieces → System generates C209
2. **LOGISTIC INPUT**: Enter C209, flight, and signature → System generates C208
3. All entries are logged with full history in the LOG view

### Special Cases

- **NEW BUILD**: Enter "NEW BUILD" in LOGISTIC INPUT to create entry with C208 immediately
- **RW Flights**: Flights starting with "RW" automatically set C208 to "RW"
- **Expiry Tracking**: Unused C209 entries expire after 48 hours with warning

## Data Storage

All data is stored in browser localStorage. Automatic backups are created every 6 hours (maximum 10 backups retained).
