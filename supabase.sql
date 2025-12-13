
create table if not exists products(
 id uuid default gen_random_uuid() primary key,
 name text,
 price int,
 image text,
 stock int
);

create table if not exists orders(
 id uuid default gen_random_uuid() primary key,
 name text,
 mobile text,
 address text,
 total int,
 status text default 'Pending',
 created_at timestamp default now()
);

create table if not exists order_items(
 id uuid default gen_random_uuid() primary key,
 order_id uuid,
 product_id uuid,
 qty int,
 price int
);
