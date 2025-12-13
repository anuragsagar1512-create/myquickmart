
-- FULL ADMIN + ORDER SCHEMA

create extension if not exists "uuid-ossp";

create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text
);

create table products (
  id uuid default uuid_generate_v4() primary key,
  name text,
  price numeric,
  stock int,
  image_url text,
  category_id uuid references categories(id)
);

create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text,
  phone text,
  address text,
  payment_method text,
  total numeric,
  status text default 'Placed',
  created_at timestamp default now()
);

create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  qty int,
  price numeric
);
