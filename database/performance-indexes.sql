create index if not exists sales_shop_id_sale_date_idx
on public.sales(shop_id, sale_date);

create index if not exists products_shop_id_idx
on public.products(shop_id);

create index if not exists credits_shop_id_status_idx
on public.credits(shop_id, status);
