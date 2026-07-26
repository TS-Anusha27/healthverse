# HealthVerse — Backend

> **Status:** Scaffold — Backend is planned for future development.

## Planned Stack

- **Runtime:** Node.js
- **Framework:** Express.js or Fastify
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + OTP
- **Real-time:** Socket.io (for live queue, ambulance tracking)
- **AI/ML:** TensorFlow.js or external API

## Directory Structure

```
backend/
├── api/              # API route definitions
├── controllers/      # Request handlers
├── middleware/        # Auth, logging, rate-limiting
├── models/           # Database models
├── routes/           # Route files
├── services/         # Business logic
├── ai/               # AI/ML integrations
├── auth/             # Authentication
├── notifications/    # Push notifications
├── maps/             # Geolocation services
├── telemedicine/     # WebRTC signaling
├── appointments/     # Scheduling logic
├── ambulance/        # Dispatch & tracking
├── bloodDonation/    # Blood donation matching
├── organDonation/    # Organ donation registry
├── medicalRecords/   # EHR management
├── payment/          # Payment processing
├── utils/            # Utilities
├── config/           # Configuration
├── server.js         # Server entry point
└── package.json      # Dependencies
```

## Getting Started

*Backend implementation pending. Currently all data is mocked in `frontend/services/data.js`.*
