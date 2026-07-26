# HealthVerse — Database

> **Status:** Scaffold — Database is planned for future development.

## Planned Setup

- **Engine:** PostgreSQL 15+
- **ORM:** Prisma
- **Migrations:** Prisma Migrate

## Directory Structure

```
database/
├── schema/       # SQL schema definitions or Prisma schema
├── migrations/   # Database migration files
├── seed/         # Seed data for development/testing
├── backups/      # Backup scripts and schedules
└── README.md     # This file
```

## Current State

All application data is currently mocked in `frontend/services/data.js` including:
- Hospitals, Doctors, Blood Banks
- Appointments, Health Records, Medicines
- Patient vitals and health scores
- Ambulance drivers and emergency requests
- AI triage engine and patient summaries
