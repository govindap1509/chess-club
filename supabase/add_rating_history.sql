-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS public.rating_history (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      integer NOT NULL,
  note        text,
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.rating_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own history; dashboard graph uses this
CREATE POLICY "Users read own rating history"
  ON public.rating_history FOR SELECT
  USING (auth.uid() = user_id);

-- Any authenticated user can insert (admin page does this on match save)
CREATE POLICY "Authenticated users can insert rating history"
  ON public.rating_history FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
