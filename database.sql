
-- Quick Mart Database
CREATE TABLE products(
 id uuid primary key default gen_random_uuid(),
 name text,
 price numeric
);
