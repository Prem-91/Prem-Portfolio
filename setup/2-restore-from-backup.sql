-- Run AFTER 1-setup.sql. Restores content from the newest row of portfolio_backups.
DO $$
DECLARE p jsonb;
BEGIN
  SELECT to_jsonb(b)->'payload' INTO p
  FROM public.portfolio_backups b
  ORDER BY to_jsonb(b)->>'created_at' DESC NULLS LAST
  LIMIT 1;

  IF p IS NULL THEN
    RAISE EXCEPTION 'No backup row found in portfolio_backups';
  END IF;

  TRUNCATE public.about_profile, public.projects, public.experiences,
           public.skills_groups, public.achievements, public.moments,
           public.contact_messages;

  INSERT INTO public.about_profile   SELECT * FROM jsonb_populate_recordset(null::public.about_profile,   COALESCE(p->'about_profile','[]'));
  INSERT INTO public.projects        SELECT * FROM jsonb_populate_recordset(null::public.projects,        COALESCE(p->'projects','[]'));
  INSERT INTO public.experiences     SELECT * FROM jsonb_populate_recordset(null::public.experiences,     COALESCE(p->'experiences','[]'));
  INSERT INTO public.skills_groups   SELECT * FROM jsonb_populate_recordset(null::public.skills_groups,   COALESCE(p->'skills_groups','[]'));
  INSERT INTO public.achievements    SELECT * FROM jsonb_populate_recordset(null::public.achievements,    COALESCE(p->'achievements','[]'));
  INSERT INTO public.moments         SELECT * FROM jsonb_populate_recordset(null::public.moments,         COALESCE(p->'moments','[]'));
  INSERT INTO public.contact_messages SELECT * FROM jsonb_populate_recordset(null::public.contact_messages, COALESCE(p->'contact_messages','[]'));
END $$;
