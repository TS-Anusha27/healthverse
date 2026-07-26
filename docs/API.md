# HealthVerse — API Documentation

> **Status:** Scaffold — No backend API exists yet.

## Planned API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/send-otp` | Send OTP to phone/email |
| POST | `/api/auth/verify-otp` | Verify OTP and issue token |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/me` | Get current user profile |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/appointments` | List user appointments |
| POST | `/api/appointments` | Book new appointment |
| PATCH | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Cancel appointment |

### Doctors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctors` | List/search doctors |
| GET | `/api/doctors/:id` | Get doctor details |
| GET | `/api/doctors/:id/slots` | Get available time slots |

### Hospitals
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/hospitals` | List nearby hospitals |
| GET | `/api/hospitals/:id` | Get hospital details |
| GET | `/api/hospitals/:id/queue` | Get live queue status |

### Emergency
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/emergency/sos` | Trigger SOS dispatch |
| POST | `/api/emergency/triage` | Submit triage assessment |
| GET | `/api/ambulance/nearby` | Find nearest ambulances |

### Health Records
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/records` | List health records |
| POST | `/api/records` | Upload new record |
| GET | `/api/records/:id` | Download record |

### Blood Donation
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/blood/banks` | List blood banks |
| GET | `/api/blood/donors` | Search eligible donors |
| POST | `/api/blood/request` | Request blood donation |

---

*Currently all data is served from `frontend/services/data.js` as mock data.*
