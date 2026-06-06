
-- shared trigger fn
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- PATIENTS
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INT,
  sex TEXT CHECK (sex IN ('F','M','O')),
  goal TEXT,
  email TEXT,
  phone TEXT,
  last_visit DATE,
  tag TEXT,
  alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own patients" ON public.patients FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX patients_user_id_idx ON public.patients(user_id);

-- APPOINTMENTS
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL DEFAULT 'Consulta',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'agendada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own appointments" ON public.appointments FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX appointments_user_scheduled_idx ON public.appointments(user_id, scheduled_at);
CREATE INDEX appointments_patient_idx ON public.appointments(patient_id);

-- PATIENT RECORDS
CREATE TABLE public.patient_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('anamnese','avaliacao','gasto','recordatorio','plano','prescricao')),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (patient_id, kind)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_records TO authenticated;
GRANT ALL ON public.patient_records TO service_role;
ALTER TABLE public.patient_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own records" ON public.patient_records FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_patient_records_updated_at BEFORE UPDATE ON public.patient_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX patient_records_patient_idx ON public.patient_records(patient_id);
