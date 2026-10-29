-- ==========================================================
-- SCOLIA - SCHÉMA DE BASE DE DONNÉES SUPABASE (PostgreSQL)
-- Phase 2 : Authentification, écoles, rôles et séparation des données
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

-- Créer le profil, l'école, l'adhésion directeur et l'année scolaire
-- dans la même transaction que l'inscription Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    metadata JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    school_name TEXT := NULLIF(BTRIM(metadata ->> 'school_name'), '');
    director_name TEXT := NULLIF(BTRIM(metadata ->> 'full_name'), '');
    school_city TEXT := COALESCE(NULLIF(BTRIM(metadata ->> 'city'), ''), 'Kinshasa');
    school_currency TEXT := COALESCE(metadata ->> 'currency_default', 'USD');
    school_id UUID;
    school_slug TEXT;
    current_year INTEGER;
BEGIN
    IF school_name IS NULL OR director_name IS NULL THEN
        RAISE EXCEPTION 'Le nom du directeur et le nom de l’école sont obligatoires.';
    END IF;

    IF school_currency NOT IN ('USD', 'CDF') THEN
        RAISE EXCEPTION 'La devise doit être USD ou CDF.';
    END IF;

    INSERT INTO public.profiles (id, full_name, phone)
    VALUES (
        NEW.id,
        director_name,
        NULLIF(BTRIM(metadata ->> 'director_phone'), '')
    );

    school_slug := TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(school_name), '[^a-z0-9]+', '-', 'g'));
    IF school_slug = '' THEN
        school_slug := 'ecole';
    END IF;
    school_slug := school_slug || '-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8);

    INSERT INTO public.schools (name, slug, city, phone, currency_default)
    VALUES (
        school_name,
        school_slug,
        school_city,
        NULLIF(BTRIM(metadata ->> 'school_phone'), ''),
        school_currency
    )
    RETURNING id INTO school_id;

    INSERT INTO public.memberships (school_id, user_id, role)
    VALUES (school_id, NEW.id, 'director');

    current_year := EXTRACT(YEAR FROM (NOW() AT TIME ZONE 'Africa/Kinshasa'))::INTEGER;
    INSERT INTO public.academic_years (school_id, name, is_current)
    VALUES (school_id, current_year::TEXT || '-' || (current_year + 1)::TEXT, TRUE);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

-- Ces fonctions évitent la récursion des règles RLS sur memberships.
CREATE OR REPLACE FUNCTION public.user_has_access_to_school(target_school_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.memberships AS membership
        WHERE membership.school_id = target_school_id
          AND membership.user_id = (SELECT auth.uid())
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.user_is_director(target_school_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.memberships AS membership
        WHERE membership.school_id = target_school_id
          AND membership.user_id = (SELECT auth.uid())
          AND membership.role = 'director'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.user_has_access_to_school(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.user_is_director(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_has_access_to_school(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_is_director(UUID) TO authenticated;

-- Retirer les anciennes règles pour permettre de relancer ce fichier.
DROP POLICY IF EXISTS "Accès aux élèves par école" ON public.students;
DROP POLICY IF EXISTS "Accès aux paiements par école" ON public.payments;
DROP POLICY IF EXISTS "Accès journal audit directeur" ON public.audit_logs;
DROP POLICY IF EXISTS "Écoles visibles par leurs membres" ON public.schools;
DROP POLICY IF EXISTS "Écoles modifiables par les directeurs" ON public.schools;
DROP POLICY IF EXISTS "Profils visibles par leur titulaire ou leur école" ON public.profiles;
DROP POLICY IF EXISTS "Profils modifiables par leur titulaire" ON public.profiles;
DROP POLICY IF EXISTS "Adhésions visibles par école" ON public.memberships;
DROP POLICY IF EXISTS "Adhésions créées par un directeur" ON public.memberships;
DROP POLICY IF EXISTS "Adhésions modifiées par un directeur" ON public.memberships;
DROP POLICY IF EXISTS "Années scolaires visibles par école" ON public.academic_years;
DROP POLICY IF EXISTS "Années scolaires gérées par directeur" ON public.academic_years;
DROP POLICY IF EXISTS "Classes visibles par école" ON public.classes;
DROP POLICY IF EXISTS "Classes gérées par directeur" ON public.classes;
DROP POLICY IF EXISTS "Élèves visibles par école" ON public.students;
DROP POLICY IF EXISTS "Élèves gérés par directeur" ON public.students;
DROP POLICY IF EXISTS "Frais visibles par école" ON public.fee_items;
DROP POLICY IF EXISTS "Frais gérés par directeur" ON public.fee_items;
DROP POLICY IF EXISTS "Paiements visibles par école" ON public.payments;
DROP POLICY IF EXISTS "Paiements enregistrés par un membre" ON public.payments;
DROP POLICY IF EXISTS "Paiements annulés par un directeur" ON public.payments;
DROP POLICY IF EXISTS "Reçus visibles par école" ON public.receipts;
DROP POLICY IF EXISTS "Reçus créés par un membre" ON public.receipts;
DROP POLICY IF EXISTS "Journal visible par directeur" ON public.audit_logs;
DROP POLICY IF EXISTS "Journal ajouté par un membre" ON public.audit_logs;

CREATE POLICY "Écoles visibles par leurs membres"
ON public.schools FOR SELECT TO authenticated
USING (public.user_has_access_to_school(id));

CREATE POLICY "Écoles modifiables par les directeurs"
ON public.schools FOR UPDATE TO authenticated
USING (public.user_is_director(id))
WITH CHECK (public.user_is_director(id));

CREATE POLICY "Profils visibles par leur titulaire ou leur école"
ON public.profiles FOR SELECT TO authenticated
USING (
    id = (SELECT auth.uid())
    OR EXISTS (
        SELECT 1
        FROM public.memberships AS own_membership
        JOIN public.memberships AS shared_membership
          ON shared_membership.school_id = own_membership.school_id
        WHERE own_membership.user_id = (SELECT auth.uid())
          AND shared_membership.user_id = profiles.id
    )
);

CREATE POLICY "Profils modifiables par leur titulaire"
ON public.profiles FOR UPDATE TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Adhésions visibles par école"
ON public.memberships FOR SELECT TO authenticated
USING (public.user_has_access_to_school(school_id));

CREATE POLICY "Adhésions créées par un directeur"
ON public.memberships FOR INSERT TO authenticated
WITH CHECK (public.user_is_director(school_id));

CREATE POLICY "Adhésions modifiées par un directeur"
ON public.memberships FOR UPDATE TO authenticated
USING (public.user_is_director(school_id))
WITH CHECK (public.user_is_director(school_id));

CREATE POLICY "Années scolaires visibles par école"
ON public.academic_years FOR SELECT TO authenticated
USING (public.user_has_access_to_school(school_id));

CREATE POLICY "Années scolaires gérées par directeur"
ON public.academic_years FOR ALL TO authenticated
USING (public.user_is_director(school_id))
WITH CHECK (public.user_is_director(school_id));

CREATE POLICY "Classes visibles par école"
ON public.classes FOR SELECT TO authenticated
USING (public.user_has_access_to_school(school_id));

CREATE POLICY "Classes gérées par directeur"
ON public.classes FOR ALL TO authenticated
USING (public.user_is_director(school_id))
WITH CHECK (public.user_is_director(school_id));

CREATE POLICY "Élèves visibles par école"
ON public.students FOR SELECT TO authenticated
USING (public.user_has_access_to_school(school_id));

CREATE POLICY "Élèves gérés par directeur"
ON public.students FOR ALL TO authenticated
USING (public.user_is_director(school_id))
WITH CHECK (public.user_is_director(school_id));

CREATE POLICY "Frais visibles par école"
ON public.fee_items FOR SELECT TO authenticated
USING (public.user_has_access_to_school(school_id));

CREATE POLICY "Frais gérés par directeur"
ON public.fee_items FOR ALL TO authenticated
USING (public.user_is_director(school_id))
WITH CHECK (public.user_is_director(school_id));

CREATE POLICY "Paiements visibles par école"
ON public.payments FOR SELECT TO authenticated
USING (public.user_has_access_to_school(school_id));

CREATE POLICY "Paiements enregistrés par un membre"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (
    public.user_has_access_to_school(school_id)
    AND created_by = (SELECT auth.uid())
);

CREATE POLICY "Paiements annulés par un directeur"
ON public.payments FOR UPDATE TO authenticated
USING (public.user_is_director(school_id))
WITH CHECK (public.user_is_director(school_id));

CREATE POLICY "Reçus visibles par école"
ON public.receipts FOR SELECT TO authenticated
USING (public.user_has_access_to_school(school_id));

CREATE POLICY "Reçus créés par un membre"
ON public.receipts FOR INSERT TO authenticated
WITH CHECK (public.user_has_access_to_school(school_id));

CREATE POLICY "Journal visible par directeur"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.user_is_director(school_id));

CREATE POLICY "Journal ajouté par un membre"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (
    public.user_has_access_to_school(school_id)
    AND user_id = (SELECT auth.uid())
);

REVOKE ALL ON public.schools, public.profiles, public.memberships,
    public.academic_years, public.classes, public.students, public.fee_items,
    public.payments, public.receipts, public.audit_logs
FROM anon, authenticated;

GRANT SELECT, UPDATE ON public.schools TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_years TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT SELECT, INSERT ON public.receipts TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
