-- ============================================================
-- Realtime: publish kudos + kudo_reactions so the Live Board can subscribe to
-- changes. Subscriptions are used as a CHANGE SIGNAL only — the client re-fetches
-- the masked kudos_feed view (never renders raw row payloads), preserving the
-- anonymous-sender masking. RLS still applies to realtime for authenticated.
-- Guarded so a re-run / existing membership does not error.
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'kudos'
  ) then
    alter publication supabase_realtime add table public.kudos;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'kudo_reactions'
  ) then
    alter publication supabase_realtime add table public.kudo_reactions;
  end if;
end $$;
