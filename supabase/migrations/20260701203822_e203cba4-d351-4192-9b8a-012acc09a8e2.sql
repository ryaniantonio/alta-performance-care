CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('professional','patient')),
  full_name TEXT,
  crn TEXT,
  clinic_name TEXT,
  clinic_address TEXT,
  clinic_phone TEXT,
  clinic_email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile" ON public.profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX profiles_role_idx ON public.profiles(role);

CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND current_user = 'authenticated' THEN
    RAISE EXCEPTION 'Alteracao de papel nao permitida';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER profiles_prevent_role_change BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, role, full_name)
SELECT id, 'professional', raw_user_meta_data ->> 'full_name'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.patients
  ADD COLUMN auth_user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX patients_auth_user_id_key
  ON public.patients(auth_user_id) WHERE auth_user_id IS NOT NULL;

CREATE POLICY "Patient reads own patient row" ON public.patients FOR SELECT
  USING (auth.uid() = auth_user_id);
CREATE POLICY "Patient reads own appointments" ON public.appointments FOR SELECT
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE auth_user_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.link_patient_account()
RETURNS boolean AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
  v_verified boolean;
  v_match_count int;
  v_patient_id uuid;
BEGIN
  IF v_uid IS NULL THEN RETURN false; END IF;

  SELECT lower(trim(u.email)), (u.email_confirmed_at IS NOT NULL)
    INTO v_email, v_verified
  FROM auth.users u WHERE u.id = v_uid;

  IF v_email IS NULL OR v_verified IS NOT TRUE THEN RETURN false; END IF;

  IF EXISTS (SELECT 1 FROM public.patients WHERE auth_user_id = v_uid) THEN
    RETURN true;
  END IF;

  SELECT count(*) INTO v_match_count
  FROM public.patients
  WHERE lower(trim(email)) = v_email AND auth_user_id IS NULL;

  IF v_match_count <> 1 THEN RETURN false; END IF;

  SELECT id INTO v_patient_id
  FROM public.patients
  WHERE lower(trim(email)) = v_email AND auth_user_id IS NULL
  LIMIT 1;

  UPDATE public.patients SET auth_user_id = v_uid WHERE id = v_patient_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.link_patient_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_patient_account() TO authenticated;