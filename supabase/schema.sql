-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PLAID ITEMS (one per institution connection)
-- ============================================================
create table plaid_items (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  access_token text not null,
  item_id text not null unique,
  institution_id text,
  institution_name text,
  last_synced_at timestamptz,
  cursor text
);
alter table plaid_items enable row level security;
create policy "Users can manage their own plaid items"
  on plaid_items for all using (auth.uid() = user_id);

-- ============================================================
-- ACCOUNTS
-- ============================================================
create table accounts (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plaid_account_id text unique,
  plaid_item_id uuid references plaid_items(id) on delete set null,
  name text not null,
  official_name text,
  type text not null,
  subtype text,
  is_manual boolean default false,
  current_balance numeric(15,2),
  available_balance numeric(15,2),
  currency text default 'USD',
  mask text,
  last_synced_at timestamptz
);
alter table accounts enable row level security;
create policy "Users can manage their own accounts"
  on accounts for all using (auth.uid() = user_id);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  top_level_type text not null check (top_level_type in ('expense', 'income', 'transfer')),
  sort_order integer default 0,
  color text,
  icon text
);
alter table categories enable row level security;
create policy "Users can manage their own categories"
  on categories for all using (auth.uid() = user_id);

-- ============================================================
-- SUBCATEGORIES
-- ============================================================
create table subcategories (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  name text not null,
  sort_order integer default 0
);
alter table subcategories enable row level security;
create policy "Users can manage their own subcategories"
  on subcategories for all using (auth.uid() = user_id);

-- ============================================================
-- RECURRING RULES
-- ============================================================
create table recurring_rules (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric(15,2) not null,
  frequency text not null check (frequency in ('weekly', 'monthly', 'yearly')),
  category_id uuid references categories(id) on delete set null,
  subcategory_id uuid references subcategories(id) on delete set null,
  is_active boolean default true
);
alter table recurring_rules enable row level security;
create policy "Users can manage their own recurring rules"
  on recurring_rules for all using (auth.uid() = user_id);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plaid_transaction_id text unique,
  date date not null,
  amount numeric(15,2) not null,
  description text not null,
  merchant_name text,
  account_id uuid references accounts(id) on delete cascade not null,
  top_level_type text not null check (top_level_type in ('expense', 'income', 'transfer')),
  category_id uuid references categories(id) on delete set null,
  subcategory_id uuid references subcategories(id) on delete set null,
  transfer_pair_id uuid references transactions(id) on delete set null,
  is_recurring boolean default false,
  recurring_group_id uuid references recurring_rules(id) on delete set null,
  is_manual boolean default false,
  notes text,
  pending boolean default false
);
alter table transactions enable row level security;
create policy "Users can manage their own transactions"
  on transactions for all using (auth.uid() = user_id);

create index transactions_date_idx on transactions(date desc);
create index transactions_account_id_idx on transactions(account_id);
create index transactions_category_id_idx on transactions(category_id);
create index transactions_user_id_idx on transactions(user_id);

-- ============================================================
-- BUDGETS
-- ============================================================
create table budgets (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade,
  subcategory_id uuid references subcategories(id) on delete cascade,
  frequency text not null check (frequency in ('monthly', 'yearly')),
  amount numeric(15,2) not null,
  month_overrides jsonb,
  unique(user_id, category_id, subcategory_id)
);
alter table budgets enable row level security;
create policy "Users can manage their own budgets"
  on budgets for all using (auth.uid() = user_id);

-- ============================================================
-- MERCHANT RULES
-- ============================================================
create table merchant_rules (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  merchant_name text not null,
  category_id uuid references categories(id) on delete cascade not null,
  subcategory_id uuid references subcategories(id) on delete set null,
  top_level_type text not null check (top_level_type in ('expense', 'income', 'transfer')),
  unique(user_id, merchant_name)
);
alter table merchant_rules enable row level security;
create policy "Users can manage their own merchant rules"
  on merchant_rules for all using (auth.uid() = user_id);

-- ============================================================
-- PORTFOLIO SNAPSHOTS (manual accounts: 401k x2, 529)
-- ============================================================
create table portfolio_snapshots (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references accounts(id) on delete cascade not null,
  date date not null,
  value numeric(15,2) not null,
  notes text,
  unique(account_id, date)
);
alter table portfolio_snapshots enable row level security;
create policy "Users can manage their own portfolio snapshots"
  on portfolio_snapshots for all using (auth.uid() = user_id);

-- ============================================================
-- SEED DEFAULT CATEGORIES
-- (run after user creation via a Supabase function or manually)
-- ============================================================
-- Example seed function (call with user_id after sign-up):
create or replace function seed_default_categories(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  cat_id uuid;
begin
  -- EXPENSE CATEGORIES
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Mortgage', 'expense', 1) returning id into cat_id;
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Food & Drink', 'expense', 2) returning id into cat_id;
  insert into subcategories (user_id, category_id, name, sort_order) values (p_user_id, cat_id, 'Groceries', 1), (p_user_id, cat_id, 'Dining Out', 2);
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Healthcare', 'expense', 3) returning id into cat_id;
  insert into subcategories (user_id, category_id, name, sort_order) values (p_user_id, cat_id, 'Doctor', 1), (p_user_id, cat_id, 'Dental', 2), (p_user_id, cat_id, 'Vision', 3), (p_user_id, cat_id, 'Pharmacy', 4), (p_user_id, cat_id, 'Insurance Co-pays', 5);
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Children', 'expense', 4);
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Household', 'expense', 5) returning id into cat_id;
  insert into subcategories (user_id, category_id, name, sort_order) values (p_user_id, cat_id, 'Home', 1), (p_user_id, cat_id, 'Utilities', 2);
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Cars & Commute', 'expense', 6) returning id into cat_id;
  insert into subcategories (user_id, category_id, name, sort_order) values (p_user_id, cat_id, 'Gas', 1), (p_user_id, cat_id, 'Car Service', 2), (p_user_id, cat_id, 'Commute', 3);
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Travel', 'expense', 7) returning id into cat_id;
  insert into subcategories (user_id, category_id, name, sort_order) values (p_user_id, cat_id, 'Tickets', 1), (p_user_id, cat_id, 'Hotel', 2), (p_user_id, cat_id, 'Parking', 3);
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Fees', 'expense', 8);
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Shopping', 'expense', 9) returning id into cat_id;
  insert into subcategories (user_id, category_id, name, sort_order) values (p_user_id, cat_id, 'Shops', 1), (p_user_id, cat_id, 'Gifts', 2), (p_user_id, cat_id, 'Clothing', 3);
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Pets', 'expense', 10) returning id into cat_id;
  insert into subcategories (user_id, category_id, name, sort_order) values (p_user_id, cat_id, 'Care', 1), (p_user_id, cat_id, 'Food', 2);
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Subscriptions', 'expense', 11);
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Tax', 'expense', 12);
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Insurance', 'expense', 13);
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Other', 'expense', 14);

  -- INCOME CATEGORIES
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Income', 'income', 1) returning id into cat_id;
  insert into subcategories (user_id, category_id, name, sort_order) values (p_user_id, cat_id, 'Salary', 1), (p_user_id, cat_id, 'Interest', 2), (p_user_id, cat_id, 'Investment Income', 3), (p_user_id, cat_id, 'Other Income', 4);

  -- TRANSFER CATEGORIES
  insert into categories (user_id, name, top_level_type, sort_order) values (p_user_id, 'Transfer', 'transfer', 1) returning id into cat_id;
  insert into subcategories (user_id, category_id, name, sort_order) values (p_user_id, cat_id, 'Account Transfer', 1), (p_user_id, cat_id, 'Credit Card Payment', 2), (p_user_id, cat_id, 'Other Transfer', 3);
end;
$$;
