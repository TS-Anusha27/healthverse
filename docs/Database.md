# HealthVerse — Database Documentation

> **Status:** Scaffold — No database exists yet. Data is currently mocked in `frontend/services/data.js`.

## Planned Schema

### Users
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| phone | VARCHAR | Phone number |
| email | VARCHAR | Email address |
| name | VARCHAR | Full name |
| user_type | ENUM | 'patient', 'doctor', 'ambulance' |
| created_at | TIMESTAMP | Account creation date |

### Hospitals
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| name | VARCHAR | Hospital name |
| specialty | VARCHAR | Primary specialty |
| address | TEXT | Full address |
| lat | DECIMAL | Latitude |
| lng | DECIMAL | Longitude |
| emergency | BOOLEAN | Has emergency services |
| beds_total | INTEGER | Total bed count |
| beds_available | INTEGER | Available beds |

### Doctors
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| hospital_id | UUID | FK → Hospitals |
| name | VARCHAR | Doctor name |
| specialty | VARCHAR | Medical specialty |
| qualification | VARCHAR | Degrees & training |
| experience | INTEGER | Years of experience |
| fee | DECIMAL | Consultation fee |
| rating | DECIMAL | Average rating |

### Appointments
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| patient_id | UUID | FK → Users |
| doctor_id | UUID | FK → Doctors |
| date | DATE | Appointment date |
| time_slot | VARCHAR | Time slot |
| type | ENUM | 'in-person', 'telemedicine' |
| status | ENUM | 'confirmed', 'completed', 'cancelled' |
| token | VARCHAR | Queue token number |

### Health Records
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| patient_id | UUID | FK → Users |
| type | VARCHAR | Record type (blood report, ECG, etc.) |
| title | VARCHAR | Record title |
| date | DATE | Record date |
| hospital | VARCHAR | Hospital name |
| doctor | VARCHAR | Doctor name |
| file_url | TEXT | Uploaded file URL |

---

*See `database/schema/` for SQL definitions once implemented.*
