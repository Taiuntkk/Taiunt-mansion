-- ============================================================================
-- TaiUnt Mansion Park (ไท้อันแมนชั่น ปาร์ค) — Database schema
-- Target: Supabase (PostgreSQL + Auth + Row Level Security)
--
-- How to use:
--   1. Create a free project at https://supabase.com
--   2. Open SQL Editor → New query → paste this whole file → Run
--   3. Go to Authentication → add your admin user(s) and tenant users
--      (or let tenants self-register via Sign up, then an admin approves them)
-- ============================================================================

-- Lookup-style enums (mirrors STATUS_META / INV_STATUS / RPR_STATUS / etc.
-- in the current mock data — UI labels stay in the frontend, only the
-- machine-readable key lives in the DB)
create type room_type      as enum ('monthly', 'daily');
create type room_status    as enum ('vacant', 'booked', 'occupied', 'notice', 'maintenance', 'cleaning');
create type invoice_status as enum ('paid', 'pending', 'overdue');
create type repair_status  as enum ('pending', 'in-progress', 'done');
create type repair_priority as enum ('low', 'medium', 'high');
create type wo_kind        as enum ('repair', 'maintenance', 'install');
create type wo_status      as enum ('draft', 'in-progress', 'done');
create type wo_location    as enum ('room', 'common');
create type promo_status   as enum ('live', 'scheduled', 'ended');
create type asset_kind     as enum ('tv', 'ac', 'fridge', 'mattress');
create type asset_condition as enum ('good', 'fair', 'repair');
create type opex_group     as enum ('utility', 'service', 'tax');
create type opex_freq      as enum ('monthly', 'yearly', 'biannual');
create type employee_paytype as enum ('monthly', 'daily');

-- ── Profiles (links Supabase Auth users → app role) ─────────────────────────
-- Supabase Auth already stores email/password in auth.users; this table adds
-- the app-specific role and (for tenants) a link to their room.
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('admin', 'tenant')),
  full_name   text not null,
  phone       text,
  room_id     text,                        -- null for admins; FK added below once rooms exists
  created_at  timestamptz not null default now()
);

-- ── Rooms ───────────────────────────────────────────────────────────────────
create table rooms (
  id          text primary key,            -- e.g. '203'
  floor       int not null,
  number      int not null,
  type        room_type not null,
  status      room_status not null default 'vacant',
  rent        numeric(10,2) not null,
  size        numeric(6,2),
  bed         text,
  created_at  timestamptz not null default now()
);

-- profiles.room_id references rooms, but rooms didn't exist yet when profiles
-- was declared — add the FK now that both tables exist.
alter table profiles
  add constraint profiles_room_fk foreign key (room_id) references rooms(id);

-- ── Tenants ─────────────────────────────────────────────────────────────────
create table tenants (
  id          text primary key,            -- e.g. 'T0001'
  profile_id  uuid references profiles(id),
  name        text not null,
  room_id     text not null references rooms(id),
  type        room_type not null,
  phone       text,
  id_card     text,
  check_in    date,
  check_out   date,
  deposit     numeric(10,2) not null default 0,
  status      room_status not null default 'occupied',
  created_at  timestamptz not null default now()
);

-- ── Invoices & line items ───────────────────────────────────────────────────
create table invoices (
  id              text primary key,        -- e.g. 'INV-2026-05-001'
  tenant_id       text not null references tenants(id),
  room_id         text not null references rooms(id),
  type            room_type not null,
  period          text not null,           -- e.g. 'พฤษภาคม 2569' or '4 คืน'
  issue_date      date not null,
  due_date        date not null,
  total           numeric(10,2) not null,
  status          invoice_status not null default 'pending',
  paid_at         date,
  payment_method  text,
  created_at      timestamptz not null default now()
);

create table invoice_items (
  id          bigint generated always as identity primary key,
  invoice_id  text not null references invoices(id) on delete cascade,
  label       text not null,
  qty         numeric(10,2) not null default 1,
  unit        text,
  price       numeric(10,2) not null,
  amount      numeric(10,2) not null
);

-- ── Repairs (tenant-reported issues) ────────────────────────────────────────
create table repairs (
  id            text primary key,          -- e.g. 'RPR-2026-038'
  room_id       text not null references rooms(id),
  tenant_id     text references tenants(id),
  type          room_type not null,
  category      text not null,             -- แอร์ / ไฟฟ้า / ประปา / อินเตอร์เน็ต / อื่นๆ
  issue         text not null,
  reported_at   timestamptz not null default now(),
  status        repair_status not null default 'pending',
  priority      repair_priority not null default 'medium',
  assignee      text,
  completed_at  timestamptz
);

-- ── Promotions & announcements ──────────────────────────────────────────────
create table promotions (
  id          text primary key,            -- e.g. 'PRM-01'
  title       text not null,
  body        text not null,
  cover       text,                        -- palette tone name used for the card art
  tag         text,
  published   date not null default current_date,
  channels    text[] not null default '{}',  -- e.g. {line, fb, web}
  status      promo_status not null default 'scheduled'
);

create table announcements (
  id          text primary key,            -- e.g. 'ANN-01'
  title       text not null,
  body        text not null,
  date        date not null default current_date
);

-- ── Room assets (TV / AC / fridge / mattress per room) ──────────────────────
create table asset_items (
  id          bigint generated always as identity primary key,
  room_id     text not null references rooms(id),
  kind        asset_kind not null,
  label       text not null,
  brand       text,
  detail      text,
  spec        text,
  year        int,
  condition   asset_condition not null default 'good'
);

-- ── Maintenance stock (parts used for repairs) ──────────────────────────────
create table stock_items (
  sku         text primary key,
  name        text not null,
  cat         text not null,               -- ประปา / ไฟฟ้า / แอร์ / อื่นๆ
  unit        text not null,
  qty         int not null default 0,
  reorder     int not null default 0,
  cost        numeric(10,2) not null default 0
);

create table stock_in (
  id          text primary key,            -- e.g. 'PO-2026-021'
  date        date not null default current_date,
  supplier    text
);

create table stock_in_items (
  id            bigint generated always as identity primary key,
  stock_in_id   text not null references stock_in(id) on delete cascade,
  sku           text not null references stock_items(sku),
  name          text not null,
  qty           int not null,
  cost          numeric(10,2) not null
);

create table stock_out (
  id          text primary key,            -- e.g. 'WD-2026-052'
  date        date not null default current_date,
  room_id     text references rooms(id),
  repair_id   text references repairs(id),
  by_employee text
);

create table stock_out_items (
  id            bigint generated always as identity primary key,
  stock_out_id  text not null references stock_out(id) on delete cascade,
  sku           text not null references stock_items(sku),
  name          text not null,
  qty           int not null,
  cost          numeric(10,2) not null
);

-- ── Work orders (จัดจ้างซ่อม / บำรุงรักษา / ติดตั้งใหม่) ─────────────────────
create table work_orders (
  id                text primary key,      -- e.g. 'WO-2026-031'
  kind              wo_kind not null,
  title             text not null,
  location          wo_location not null,
  room_id           text references rooms(id),   -- null when location = 'common'
  common_area       text,                  -- free-text label when location = 'common'
  asset_kind        text,
  asset_name        text,
  symptom           text,
  vendor            text,
  start_date        date,
  end_date          date,
  status            wo_status not null default 'draft',
  cost              numeric(10,2) not null default 0,
  paid              boolean not null default false,
  warranty_months   int not null default 0,
  warranty_until    date,
  repair_ref        text references repairs(id)
);

-- ── Payroll / employees ─────────────────────────────────────────────────────
create table employees (
  id          text primary key,            -- e.g. 'EMP-01'
  name        text not null,
  role        text not null,
  pay_type    employee_paytype not null,
  rate        numeric(10,2) not null,
  days        int,                         -- worked days this period (daily-rate staff)
  advance     numeric(10,2) not null default 0,
  note        text
);

-- ── Operating expenses (ค่าใช้จ่ายส่วนกลาง) ─────────────────────────────────
create table opex (
  id          text primary key,            -- e.g. 'OX-01'
  cat         text not null,
  opex_group  opex_group not null,
  amount      numeric(10,2) not null,
  freq        opex_freq not null,
  due         date,
  paid        boolean not null default false
);

-- ── Utility meter readings (per monthly room, per period) ───────────────────
create table meter_readings (
  id            bigint generated always as identity primary key,
  room_id       text not null references rooms(id),
  period        text not null,             -- e.g. 'พฤษภาคม 2569'
  water_prev    int,
  water_curr    int,
  electric_prev int,
  electric_curr int,
  recorded      boolean not null default false,
  read_date     date,
  unique (room_id, period)
);

create table utility_rates (
  id        int primary key default 1,
  water     numeric(6,2) not null default 25,
  electric  numeric(6,2) not null default 10,
  constraint single_row check (id = 1)
);
insert into utility_rates (id, water, electric) values (1, 25, 10);

-- ── Mini-mart / shop ─────────────────────────────────────────────────────────
create table shop_items (
  sku         text primary key,
  name        text not null,
  cat         text not null,
  unit        text not null,
  stock       int not null default 0,
  cost        numeric(10,2) not null default 0,
  price       numeric(10,2) not null default 0
);

create table shop_in (
  id          text primary key,            -- e.g. 'SI-2026-014'
  date        date not null default current_date,
  supplier    text
);

create table shop_in_items (
  id            bigint generated always as identity primary key,
  shop_in_id    text not null references shop_in(id) on delete cascade,
  sku           text not null references shop_items(sku),
  name          text not null,
  qty           int not null,
  cost          numeric(10,2) not null
);

create table shop_out (
  id          text primary key,            -- e.g. 'SO-2026-188'
  date        timestamptz not null default now(),
  room_id     text references rooms(id)    -- null = walk-in customer
);

create table shop_out_items (
  id            bigint generated always as identity primary key,
  shop_out_id   text not null references shop_out(id) on delete cascade,
  sku           text not null references shop_items(sku),
  name          text not null,
  qty           int not null,
  price         numeric(10,2) not null
);

-- ============================================================================
-- Row Level Security — admins see/manage everything, tenants see only
-- their own room/invoices/repairs and can create their own repair reports.
-- ============================================================================

create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

create or replace function my_tenant_id() returns text as $$
  select t.id from tenants t
  join profiles p on p.id = t.profile_id
  where p.id = auth.uid()
  limit 1;
$$ language sql security definer stable;

-- Enable RLS everywhere
alter table profiles        enable row level security;
alter table rooms           enable row level security;
alter table tenants         enable row level security;
alter table invoices        enable row level security;
alter table invoice_items   enable row level security;
alter table repairs         enable row level security;
alter table promotions      enable row level security;
alter table announcements   enable row level security;
alter table asset_items     enable row level security;
alter table stock_items     enable row level security;
alter table stock_in        enable row level security;
alter table stock_in_items  enable row level security;
alter table stock_out       enable row level security;
alter table stock_out_items enable row level security;
alter table work_orders     enable row level security;
alter table employees       enable row level security;
alter table opex            enable row level security;
alter table meter_readings  enable row level security;
alter table utility_rates   enable row level security;
alter table shop_items      enable row level security;
alter table shop_in         enable row level security;
alter table shop_in_items   enable row level security;
alter table shop_out        enable row level security;
alter table shop_out_items  enable row level security;

-- profiles: everyone can read their own row; admins can read/manage all
create policy "profiles_self_read" on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles_self_update" on profiles for update using (id = auth.uid() or is_admin());
create policy "profiles_admin_write" on profiles for insert with check (is_admin() or id = auth.uid());

-- rooms: admins manage; tenants can read all rooms (for the "rooms" overview)
create policy "rooms_read_all" on rooms for select using (true);
create policy "rooms_admin_write" on rooms for all using (is_admin()) with check (is_admin());

-- tenants: admins manage all; a tenant can read only their own record
create policy "tenants_self_or_admin_read" on tenants for select using (is_admin() or id = my_tenant_id());
create policy "tenants_admin_write" on tenants for all using (is_admin()) with check (is_admin());

-- invoices / items: admins manage all; tenant reads only their own invoices
create policy "invoices_self_or_admin_read" on invoices for select using (is_admin() or tenant_id = my_tenant_id());
create policy "invoices_admin_write" on invoices for all using (is_admin()) with check (is_admin());
create policy "invoice_items_self_or_admin_read" on invoice_items for select
  using (is_admin() or invoice_id in (select id from invoices where tenant_id = my_tenant_id()));
create policy "invoice_items_admin_write" on invoice_items for all using (is_admin()) with check (is_admin());

-- repairs: admins manage all; tenant can read + create their own room's reports
create policy "repairs_self_or_admin_read" on repairs for select using (is_admin() or tenant_id = my_tenant_id());
create policy "repairs_tenant_create" on repairs for insert with check (tenant_id = my_tenant_id() or is_admin());
create policy "repairs_admin_update" on repairs for update using (is_admin()) with check (is_admin());

-- promotions / announcements: published content readable by everyone signed in;
-- only admins write
create policy "promotions_read_all" on promotions for select using (auth.uid() is not null);
create policy "promotions_admin_write" on promotions for all using (is_admin()) with check (is_admin());
create policy "announcements_read_all" on announcements for select using (auth.uid() is not null);
create policy "announcements_admin_write" on announcements for all using (is_admin()) with check (is_admin());

-- asset_items: tenant can see their own room's assets; admin sees all
create policy "assets_self_or_admin_read" on asset_items for select
  using (is_admin() or room_id = (select room_id from tenants where id = my_tenant_id()));
create policy "assets_admin_write" on asset_items for all using (is_admin()) with check (is_admin());

-- everything else (stock, work orders, payroll, opex, meters, shop, rates) —
-- back-office only, admins only
create policy "stock_items_admin"      on stock_items      for all using (is_admin()) with check (is_admin());
create policy "stock_in_admin"         on stock_in         for all using (is_admin()) with check (is_admin());
create policy "stock_in_items_admin"   on stock_in_items   for all using (is_admin()) with check (is_admin());
create policy "stock_out_admin"        on stock_out        for all using (is_admin()) with check (is_admin());
create policy "stock_out_items_admin"  on stock_out_items  for all using (is_admin()) with check (is_admin());
create policy "work_orders_admin"      on work_orders      for all using (is_admin()) with check (is_admin());
create policy "employees_admin"        on employees        for all using (is_admin()) with check (is_admin());
create policy "opex_admin"             on opex             for all using (is_admin()) with check (is_admin());
create policy "meter_readings_admin"   on meter_readings   for all using (is_admin()) with check (is_admin());
create policy "utility_rates_read_all" on utility_rates    for select using (auth.uid() is not null);
create policy "utility_rates_admin_write" on utility_rates for all using (is_admin()) with check (is_admin());
create policy "shop_items_admin"       on shop_items       for all using (is_admin()) with check (is_admin());
create policy "shop_in_admin"          on shop_in          for all using (is_admin()) with check (is_admin());
create policy "shop_in_items_admin"    on shop_in_items    for all using (is_admin()) with check (is_admin());
create policy "shop_out_admin"         on shop_out         for all using (is_admin()) with check (is_admin());
create policy "shop_out_items_admin"   on shop_out_items   for all using (is_admin()) with check (is_admin());

-- ============================================================================
-- Helpful indexes
-- ============================================================================
create index idx_tenants_room        on tenants(room_id);
create index idx_invoices_tenant     on invoices(tenant_id);
create index idx_invoices_room       on invoices(room_id);
create index idx_repairs_room        on repairs(room_id);
create index idx_repairs_tenant      on repairs(tenant_id);
create index idx_work_orders_room    on work_orders(room_id);
create index idx_asset_items_room    on asset_items(room_id);
create index idx_meter_readings_room on meter_readings(room_id);
create index idx_shop_out_room       on shop_out(room_id);
