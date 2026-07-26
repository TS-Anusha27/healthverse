-- ========================================================
-- HEALTHVERSE SUPABASE DATABASE SCHEMA & MIGRATION SCRIPT
-- Project Reference: aywozrmnjecwqlpzrjka
-- ========================================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------
-- 1. PROFILES TABLE (Linked to auth.users)
-- --------------------------------------------------------
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

-- RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger for Auto-Creating Profile on Auth Signup
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- --------------------------------------------------------
-- 2. HOSPITALS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospitals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    specialty TEXT,
    rating NUMERIC(3,2) DEFAULT 4.5,
    reviews INTEGER DEFAULT 0,
    distance TEXT,
    distance_val NUMERIC(5,2),
    address TEXT,
    phone TEXT,
    emergency BOOLEAN DEFAULT true,
    wait_time TEXT,
    queue INTEGER DEFAULT 0,
    lat NUMERIC(9,6),
    lng NUMERIC(9,6),
    specialties TEXT[],
    beds JSONB DEFAULT '{"total": 100, "available": 20}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hospitals are viewable by everyone" ON public.hospitals FOR SELECT USING (true);

-- --------------------------------------------------------
-- 3. DOCTORS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    hospital_id TEXT REFERENCES public.hospitals(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    qualification TEXT,
    hospital TEXT,
    experience INTEGER DEFAULT 5,
    rating NUMERIC(3,2) DEFAULT 4.8,
    reviews INTEGER DEFAULT 0,
    fee NUMERIC(8,2) DEFAULT 500,
    available BOOLEAN DEFAULT true,
    next_slot TEXT,
    languages TEXT[],
    about TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors are viewable by everyone" ON public.doctors FOR SELECT USING (true);

-- --------------------------------------------------------
-- 4. APPOINTMENTS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id TEXT,
    doctor_name TEXT,
    specialty TEXT,
    hospital TEXT,
    date TEXT,
    time TEXT,
    type TEXT DEFAULT 'In-Person',
    token TEXT,
    status TEXT DEFAULT 'confirmed',
    qr_code TEXT,
    room TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id OR true);
CREATE POLICY "Users can create appointments" ON public.appointments FOR INSERT WITH CHECK (true);

-- --------------------------------------------------------
-- 5. HEALTH RECORDS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.health_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    date TEXT,
    hospital TEXT,
    doctor TEXT,
    status TEXT DEFAULT 'normal',
    icon TEXT DEFAULT 'file-text',
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view health records" ON public.health_records FOR SELECT USING (true);
CREATE POLICY "Users can insert health records" ON public.health_records FOR INSERT WITH CHECK (true);

-- --------------------------------------------------------
-- 6. MEDICINES TABLE
-- --------------------------------------------------------
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

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Medicines are viewable by authenticated users" ON public.medicines FOR SELECT USING (true);

-- --------------------------------------------------------
-- 7. BLOOD BANKS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blood_banks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    distance TEXT,
    stock JSONB,
    open_24h BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blood banks are viewable by everyone" ON public.blood_banks FOR SELECT USING (true);

-- --------------------------------------------------------
-- 8. EMERGENCY REQUESTS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_name TEXT NOT NULL,
    condition TEXT,
    address TEXT,
    distance TEXT,
    eta TEXT,
    hospital TEXT,
    triage TEXT DEFAULT 'red',
    lat NUMERIC(9,6),
    lng NUMERIC(9,6),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Emergency requests viewable by everyone" ON public.emergency_requests FOR SELECT USING (true);
CREATE POLICY "Emergency requests insertable by everyone" ON public.emergency_requests FOR INSERT WITH CHECK (true);

-- --------------------------------------------------------
-- 9. SUPABASE STORAGE BUCKETS SETUP
-- --------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('health-records', 'health-records', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('prescriptions', 'prescriptions', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Read Access for health-records" 
ON storage.objects FOR SELECT USING (bucket_id = 'health-records');

CREATE POLICY "Public Upload Access for health-records" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'health-records');

CREATE POLICY "Public Read Access for prescriptions" 
ON storage.objects FOR SELECT USING (bucket_id = 'prescriptions');

CREATE POLICY "Public Upload Access for prescriptions" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'prescriptions');
