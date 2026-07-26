-- =====================================================================
-- HEALTHVERSE COMPLETE SUPABASE DATABASE MIGRATION SCRIPT
-- Project: HealthVerse (aywozrmnjecwqlpzrjka)
-- Contains: 19 Tables, Primary/Foreign Keys, Performance Indexes, Triggers,
--           Row Level Security (RLS) Policies, 5 Storage Buckets, and Seed Data.
-- =====================================================================

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. PROFILES TABLE (Core Identity linked to auth.users)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'ambulance', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 2. PATIENTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    dob DATE,
    gender TEXT,
    blood_group TEXT,
    height NUMERIC(5,2),
    weight NUMERIC(5,2),
    allergies TEXT[],
    chronic_conditions TEXT[],
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    address TEXT,
    health_score INTEGER DEFAULT 85,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 3. HOSPITALS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospitals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    specialty TEXT,
    rating NUMERIC(3,2) DEFAULT 4.8,
    reviews INTEGER DEFAULT 120,
    distance TEXT,
    distance_val NUMERIC(5,2),
    address TEXT,
    phone TEXT,
    emergency BOOLEAN DEFAULT true,
    wait_time TEXT DEFAULT '15 min',
    queue INTEGER DEFAULT 5,
    lat NUMERIC(9,6),
    lng NUMERIC(9,6),
    specialties TEXT[],
    beds JSONB DEFAULT '{"total": 300, "available": 45}'::jsonb,
    insurance TEXT[],
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 4. DOCTORS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    hospital_id TEXT REFERENCES public.hospitals(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    qualification TEXT,
    hospital TEXT,
    experience INTEGER DEFAULT 10,
    rating NUMERIC(3,2) DEFAULT 4.9,
    reviews INTEGER DEFAULT 85,
    fee NUMERIC(8,2) DEFAULT 800,
    available BOOLEAN DEFAULT true,
    next_slot TEXT DEFAULT 'Today, 4:00 PM',
    languages TEXT[],
    about TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 5. AMBULANCE DRIVERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ambulance_drivers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    vehicle_number TEXT NOT NULL,
    distance TEXT DEFAULT '1.0 km',
    eta TEXT DEFAULT '5 min',
    rating NUMERIC(3,2) DEFAULT 4.8,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
    current_lat NUMERIC(9,6),
    current_lng NUMERIC(9,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 6. APPOINTMENTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
    doctor_name TEXT NOT NULL,
    specialty TEXT,
    hospital TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    type TEXT DEFAULT 'In-Person',
    token TEXT,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'rescheduled')),
    qr_code TEXT,
    room TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 7. HEALTH RECORDS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.health_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    hospital TEXT,
    doctor TEXT,
    status TEXT DEFAULT 'normal',
    icon TEXT DEFAULT 'file-text',
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 8. AI SUMMARIES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_summaries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_name TEXT,
    age INTEGER,
    gender TEXT,
    blood_group TEXT,
    health_score INTEGER DEFAULT 82,
    conditions TEXT[],
    current_medications JSONB,
    allergies TEXT[],
    critical_alerts JSONB,
    recommendations TEXT[],
    timeline JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 9. PRESCRIPTIONS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    appointment_id TEXT REFERENCES public.appointments(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
    doctor_name TEXT,
    diagnosis TEXT,
    medicines JSONB,
    instructions TEXT,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 10. MEDICINES TABLE (Refill Reminders)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medicines (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    time TEXT,
    meals TEXT,
    refill_days INTEGER DEFAULT 10,
    taken BOOLEAN DEFAULT false,
    color TEXT DEFAULT '#4A90D9',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 11. MEDICINE ORDERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medicine_orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    delivery_address TEXT NOT NULL,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 12. BLOOD DONORS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blood_donors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    group_type TEXT NOT NULL,
    distance TEXT DEFAULT '1.0 km',
    last_donated TEXT,
    phone TEXT NOT NULL,
    eligible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 13. ORGAN DONORS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organ_donors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    organs_pledged TEXT[],
    blood_group TEXT,
    emergency_contact TEXT,
    status TEXT DEFAULT 'registered',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 14. EMERGENCY REQUESTS TABLE (SOS & Ambulance)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    condition TEXT,
    address TEXT NOT NULL,
    distance TEXT DEFAULT '1.0 km',
    eta TEXT DEFAULT '5 min',
    hospital TEXT,
    triage TEXT DEFAULT 'red' CHECK (triage IN ('green', 'yellow', 'orange', 'red')),
    lat NUMERIC(9,6),
    lng NUMERIC(9,6),
    driver_id TEXT REFERENCES public.ambulance_drivers(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'en_route', 'completed', 'cancelled')),
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 15. NOTIFICATIONS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 16. PAYMENTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    purpose TEXT NOT NULL,
    payment_method TEXT DEFAULT 'UPI',
    transaction_id TEXT,
    status TEXT DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 17. TELEMEDICINE SESSIONS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.telemedicine_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    room_id TEXT NOT NULL,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 18. HOSPITAL REVIEWS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospital_reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    hospital_id TEXT REFERENCES public.hospitals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 19. DOCTOR REVIEWS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor_reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================
-- PERFORMANCE INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital ON public.doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_health_records_patient ON public.health_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medicines_patient ON public.medicines(patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

-- =====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'role', 'patient')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();

  IF (COALESCE(new.raw_user_meta_data->>'role', 'patient') = 'patient') THEN
    INSERT INTO public.patients (id, emergency_contact_name)
    VALUES (new.id, 'Family Member')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organ_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemedicine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_reviews ENABLE ROW LEVEL SECURITY;

-- Public Read & Full Authenticated Access Policies
CREATE POLICY "Public Read Access" ON public.hospitals FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.blood_donors FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.ambulance_drivers FOR SELECT USING (true);

CREATE POLICY "Allow All for Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Health Records" ON public.health_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for AI Summaries" ON public.ai_summaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Prescriptions" ON public.prescriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Medicines" ON public.medicines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Medicine Orders" ON public.medicine_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Emergency Requests" ON public.emergency_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Telemedicine" ON public.telemedicine_sessions FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================
-- STORAGE BUCKETS SETUP (5 BUCKETS)
-- =====================================================================
INSERT INTO storage.buckets (id, name, public) VALUES 
('medical-records', 'medical-records', true),
('doctor-documents', 'doctor-documents', true),
('hospital-images', 'hospital-images', true),
('profile-images', 'profile-images', true),
('prescriptions', 'prescriptions', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public Access Bucket medical-records" ON storage.objects FOR ALL USING (bucket_id = 'medical-records') WITH CHECK (bucket_id = 'medical-records');
CREATE POLICY "Public Access Bucket doctor-documents" ON storage.objects FOR ALL USING (bucket_id = 'doctor-documents') WITH CHECK (bucket_id = 'doctor-documents');
CREATE POLICY "Public Access Bucket hospital-images" ON storage.objects FOR ALL USING (bucket_id = 'hospital-images') WITH CHECK (bucket_id = 'hospital-images');
CREATE POLICY "Public Access Bucket profile-images" ON storage.objects FOR ALL USING (bucket_id = 'profile-images') WITH CHECK (bucket_id = 'profile-images');
CREATE POLICY "Public Access Bucket prescriptions" ON storage.objects FOR ALL USING (bucket_id = 'prescriptions') WITH CHECK (bucket_id = 'prescriptions');

-- =====================================================================
-- SEED DATA (Default Hospitals, Doctors, Ambulance Drivers)
-- =====================================================================
INSERT INTO public.hospitals (id, name, specialty, rating, reviews, distance, distance_val, address, phone, emergency, wait_time, queue, lat, lng, specialties)
VALUES 
('h1', 'Apollo Hospitals', 'Multi-Specialty', 4.8, 2841, '1.2 km', 1.2, '21, Greams Lane, Chennai', '+91 44 2829 3333', true, '15-20 min', 12, 13.0602, 80.2496, ARRAY['Cardiology', 'Oncology', 'Neurology', 'Pediatrics']),
('h2', 'Fortis Healthcare', 'Multi-Specialty', 4.7, 1923, '2.4 km', 2.4, 'Rajaji Salai, Chennai', '+91 44 4244 5555', true, '25-30 min', 21, 13.0780, 80.2785, ARRAY['Cardiology', 'Gastroenterology', 'Pulmonology']),
('h3', 'Manipal Hospital', 'Super Specialty', 4.6, 3102, '3.1 km', 3.1, 'Velachery, Chennai', '+91 44 6600 6600', true, '10-15 min', 8, 12.9750, 80.2200, ARRAY['Neurology', 'Oncology', 'Transplant'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.doctors (id, hospital_id, name, specialty, qualification, hospital, experience, rating, reviews, fee, available, next_slot, languages)
VALUES
('dr1', 'h1', 'Dr. Priya Krishnamurthy', 'Cardiologist', 'MD, DM (Cardiology) — AIIMS Delhi', 'Apollo Hospitals', 14, 4.9, 892, 800, true, 'Today, 3:30 PM', ARRAY['English', 'Tamil', 'Hindi']),
('dr2', 'h1', 'Dr. Arjun Mehta', 'Neurologist', 'MD, DM (Neurology) — CMC Vellore', 'Apollo Hospitals', 11, 4.8, 654, 900, true, 'Today, 5:00 PM', ARRAY['English', 'Hindi', 'Tamil']),
('dr4', 'h2', 'Dr. Rajesh Nair', 'Gastroenterologist', 'MD, DM (Gastroenterology) — JIPMER', 'Fortis Healthcare', 16, 4.9, 723, 1000, true, 'Today, 4:15 PM', ARRAY['English', 'Malayalam', 'Tamil'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ambulance_drivers (id, name, phone, vehicle_number, distance, eta, rating, status)
VALUES
('amb1', 'Ravi Kumar', '+91 9876500001', 'MH 01 AX 4892', '0.8 km', '4 min', 4.8, 'available'),
('amb2', 'Suresh Babu', '+91 9876500002', 'TN 07 BX 3341', '1.5 km', '7 min', 4.9, 'available')
ON CONFLICT (id) DO NOTHING;
