alter table public.products add column if not exists item_id text;
alter table public.purchase_orders add column if not exists product_id uuid references public.products(id) on delete set null;
alter table public.purchase_orders add column if not exists item_id text;

create index if not exists products_shop_item_id_idx on public.products(shop_id, item_id);
