-- =============================================
-- AI CV BUILDER — Supabase SQL Şeması
-- SQL Editor'a kopyalayıp "Run" butonuna bas
-- =============================================

-- =============================================
-- TABLO: users (Supabase Auth ile bağlantılı)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'inactive'
    CHECK (subscription_status IN (
      'active', 'trialing', 'canceled',
      'past_due', 'unpaid', 'inactive'
    )),
  trial_end_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  plan_type TEXT DEFAULT 'pro'
    CHECK (plan_type IN ('pro', 'lifetime', 'team')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLO: cv_data
-- =============================================
CREATE TABLE IF NOT EXISTS public.cv_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'CV',
  linkedin_url TEXT,
  job_url TEXT,
  base_linkedin_json JSONB,
  target_job_json JSONB,
  ai_tailored_cv_json JSONB,
  ats_score INTEGER,
  status TEXT DEFAULT 'pending'
    CHECK (status IN (
      'pending', 'scraping', 'generating', 'completed', 'error'
    )),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLO: shareable_links
-- =============================================
CREATE TABLE IF NOT EXISTS public.shareable_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cv_id UUID NOT NULL REFERENCES public.cv_data(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLO: link_analytics
-- =============================================
CREATE TABLE IF NOT EXISTS public.link_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES public.shareable_links(id) ON DELETE CASCADE,
  viewer_ip TEXT,
  viewer_country TEXT,
  viewer_device TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shareable_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_analytics ENABLE ROW LEVEL SECURITY;

-- Varsa eski policy'leri temizle (tekrar çalıştırmak için güvenli)
DROP POLICY IF EXISTS "users_own_data" ON public.users;
DROP POLICY IF EXISTS "cv_data_own" ON public.cv_data;
DROP POLICY IF EXISTS "shareable_links_own" ON public.shareable_links;
DROP POLICY IF EXISTS "shareable_links_public_read" ON public.shareable_links;
DROP POLICY IF EXISTS "link_analytics_insert" ON public.link_analytics;

-- Kullanıcı sadece kendi datasını görebilir
CREATE POLICY "users_own_data" ON public.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "cv_data_own" ON public.cv_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "shareable_links_own" ON public.shareable_links
  FOR ALL USING (auth.uid() = user_id);

-- Public CV linkleri herkese açık (recruiter'lar görebilsin)
CREATE POLICY "shareable_links_public_read" ON public.shareable_links
  FOR SELECT USING (is_active = TRUE);

-- Link analytics: service role yazabilir, herkes okuyabilir
CREATE POLICY "link_analytics_insert" ON public.link_analytics
  FOR INSERT WITH CHECK (true);

-- =============================================
-- FONKSİYONLAR & TETİKLEYİCİLER
-- =============================================

-- Yeni auth kullanıcısı → otomatik profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at otomatik güncelle
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER cv_data_updated_at BEFORE UPDATE ON public.cv_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
