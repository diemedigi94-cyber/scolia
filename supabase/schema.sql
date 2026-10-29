-- ==========================================================
-- SCOLIA - SCHÉMA DE BASE DE DONNÉES SUPABASE (PostgreSQL)
-- Phase 1 : Multi-tenant, RLS, Sécurité et Traçabilité
-- Fuseau horaire de référence : Africa/Kinshasa
-- ==========================================================

-- Activer l'extension pgcrypto pour les UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Table des Écoles (Schools)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL DEFAULT 'Kinshasa',
    phone TEXT,
    currency_default TEXT NOT NULL DEFAULT 'USD' CHECK (currency_default IN ('USD', 'CDF')),
    allow_multi_currency BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Africa/Kinshasa'::text, now()) NOT NULL
);

-- 2. Table des Profils Utilisateurs (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Africa/Kinshasa'::text, now()) NOT NULL
);

-- 3. Table des Rôles & Adhésions (Memberships)
-- Lie un utilisateur à une école avec un rôle précis (director ou cashier)
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('director', 'cashier')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Africa/Kinshasa'::text, now()) NOT NULL,
    UNIQUE (school_id, user_id)
);

-- 4. Années Scolaires
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- ex: '2026-2027'
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Africa/Kinshasa'::text, now()) NOT NULL
);

-- 5. Classes
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- ex: '1ère Maternelle', '7ème EB', '4ème Scientifique'
    section TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Africa/Kinshasa'::text, now()) NOT NULL
);

-- 6. Élèves (Students)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('M', 'F')),
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL, -- Format WhatsApp +243...
    matricule TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Africa/Kinshasa'::text, now()) NOT NULL
);

-- 7. Types de Frais (Fee Items)
-- Stockés en entiers : cents pour USD (ex: 5000 = 50.00$) ou unités entières pour CDF (ex: 125000)
CREATE TABLE IF NOT EXISTS public.fee_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- ex: 'Frais d''inscription', '1ère tranche scolarité'
    amount BIGINT NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL CHECK (currency IN ('USD', 'CDF')),
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Africa/Kinshasa'::text, now()) NOT NULL
);

-- 8. Paiements (Payments)
-- Règle d'or : JAMAIS de suppression physique. Annulation avec motif.
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    fee_item_id UUID REFERENCES public.fee_items(id) ON DELETE SET NULL,
    amount BIGINT NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL CHECK (currency IN ('USD', 'CDF')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER')),
    reference TEXT, -- Numéro transaction M-Pesa, bordereau bancaire, etc.
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    receipt_number TEXT NOT NULL,
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES public.profiles(id),
    cancel_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Africa/Kinshasa'::text, now()) NOT NULL
);

-- 9. Reçus (Receipts)
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
    receipt_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Africa/Kinshasa'::text, now()) NOT NULL,
    UNIQUE (school_id, receipt_number)
);

-- 10. Journal d'Audit (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL, -- 'PAYMENT_CREATED', 'PAYMENT_CANCELLED', 'STUDENT_IMPORTED', etc.
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Africa/Kinshasa'::text, now()) NOT NULL
);

-- ==========================================================
-- SÉCURITÉ : RÈGLES RLS (Row Level Security)
-- ==========================================================
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Fonction helper pour vérifier l'appartenance d'un utilisateur à une école
CREATE OR REPLACE FUNCTION public.user_has_access_to_school(target_school_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.memberships
        WHERE school_id = target_school_id
          AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction helper pour vérifier le rôle directeur
CREATE OR REPLACE FUNCTION public.user_is_director(target_school_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.memberships
        WHERE school_id = target_school_id
          AND user_id = auth.uid()
          AND role = 'director'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exemples de politiques RLS :
-- L'utilisateur ne voit que les élèves de son école
CREATE POLICY "Accès aux élèves par école"
ON public.students FOR ALL
USING (public.user_has_access_to_school(school_id));

-- L'utilisateur ne voit que les paiements de son école
CREATE POLICY "Accès aux paiements par école"
ON public.payments FOR ALL
USING (public.user_has_access_to_school(school_id));

-- Seul le directeur peut voir les logs d'audit
CREATE POLICY "Accès journal audit directeur"
ON public.audit_logs FOR SELECT
USING (public.user_is_director(school_id));
