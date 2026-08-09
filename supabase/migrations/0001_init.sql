-- ============================================================
-- Personal Website — Schema Supabase
-- Berlaku untuk project Supabase yang dipakai situs dreverrse.my.id
-- ============================================================
-- Catatan: file ini hanya untuk setup/migrasi. Jangan jalankan otomatis
-- pada production tanpa review. Akses database dari app memakai
-- SUPABASE_SERVICE_ROLE_KEY (server-only), jadi RLS tidak wajib
-- untuk keamanan, tapi tetap disediakan sebagai defense-in-depth.
-- ============================================================

-- ---------- Tabel: admin_posts ----------
create table if not exists public.admin_posts (
  slug     text primary key,
  title    text not null,
  date     text not null,
  excerpt  text not null default '',
  tags     text[] not null default '{}',
  content  text not null,
  image    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Tabel: post_reactions ----------
-- Catatan: post_slug sengaja TANPA foreign key ke admin_posts karena
-- sebagian post disimpan sebagai file MDX lokal (content/blog/*.mdx)
-- dan tidak punya baris di tabel admin_posts.
create table if not exists public.post_reactions (
  id         uuid primary key default gen_random_uuid(),
  post_slug  text not null,
  reaction   text not null,
  user_id    text not null,
  created_at timestamptz not null default now(),
  -- mencegah duplikat reaksi dari user yang sama (race-condition proof)
  unique (post_slug, reaction, user_id)
);

create index if not exists post_reactions_post_slug_idx
  on public.post_reactions (post_slug, reaction);

-- ---------- Tabel: post_comments ----------
-- Catatan: post_slug sengaja TANPA foreign key ke admin_posts (lihat di atas).
create table if not exists public.post_comments (
  id         text primary key,
  post_slug  text not null,
  name       text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_slug_idx
  on public.post_comments (post_slug, created_at desc);

-- ---------- Tabel: translation_cache ----------
create table if not exists public.translation_cache (
  key        text primary key,
  value      jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ---------- RLS (defense-in-depth) ----------
alter table public.admin_posts         enable row level security;
alter table public.post_reactions      enable row level security;
alter table public.post_comments       enable row level security;
alter table public.translation_cache   enable row level security;

-- Semua akses app dilakukan via service role (bypass RLS).
-- Polisinya sengaja dibiarkan minimal; tambahkan policy hanya
-- jika kelak akses via anon key diperkenalkan.
