# Sahel API

Node.js Express REST API for the Sahel shop management app, connected to Supabase with `@supabase/supabase-js`.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Update `.env` with your Supabase project URL and anon key.

## Environment

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=replace_with_a_long_random_secret
PORT=3000
```

## Routes

- `GET /api/health`
- `POST /auth/signup`
- `POST /auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /products`
- `GET /products/low-stock`
- `GET /api/products/:id`
- `POST /products`
- `POST /api/products`
- `PUT /products/:id`
- `PUT /api/products/:id`
- `DELETE /products/:id`
- `DELETE /api/products/:id`
- `POST /sales`
- `GET /sales?limit=20`
- `POST /api/sales`
- `GET /credits/summary`
- `GET /api/credits/summary`
- `GET /api/orders`
- `GET /orders`
- `GET /orders?status=pending`
- `POST /orders`
- `PUT /orders/:id/receive`
- `PUT /orders/:id/cancel`
- `GET /api/orders?status=pending`
- `POST /api/orders`
- `PUT /api/orders/:id/receive`
- `PUT /api/orders/:id/cancel`
- `GET /reports/sales?from=DATE&to=DATE`
- `GET /reports/top-products?from=DATE&to=DATE`
- `GET /reports/slow-moving`
- `GET /reports/expenses?month=YYYY-MM`
- `GET /reports/profit?month=YYYY-MM`
- `GET /reports/daily`

Run `database/multi-tenant-schema.sql` in Supabase before using auth.

After login, protected routes require:

```bash
Authorization: Bearer YOUR_TOKEN
```

The API expects `users`, `shops`, `products`, `sales`, `credits`, `expenses`, and `purchase_orders` tables in Supabase.
