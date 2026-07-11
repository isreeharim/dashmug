# tabletap

Restaurant QR menu SaaS MVP built with Next.js 15, TypeScript, Tailwind, Clerk, Prisma, PostgreSQL, and Cloudinary-ready environment configuration.

## Local setup

1. Copy `.env.example` to `.env.local` and fill in the PostgreSQL and Clerk values.
2. Run `npm install`.
3. Generate and migrate the database: `npx prisma generate` then `npx prisma migrate dev`.
4. Start the application: `npm run dev`.

Use these local hosts to exercise the routing model:

- `http://localhost:3000` - marketing site
- `http://localhost:3000/cedar-salt` - restaurant profile
- `http://localhost:3000/menu/cedar-salt` - local public menu route
- `http://menu.localhost:3000/cedar-salt` - public menu subdomain route
- `http://dashboard.localhost:3000` - owner dashboard
- `http://admin.localhost:3000` - admin surface

## Architecture

- `prisma/schema.prisma` is tenant-oriented and contains restaurants, categories, items, dynamic QR records, and scan history.
- `src/middleware.ts` maps menu, dashboard, and admin hosts to app routes and applies Clerk protection to owner/admin/API routes.
- `src/app/api` contains validated restaurant creation, QR PNG/SVG rendering, and privacy-preserving scan tracking endpoints.
- QR images encode `menu.<domain>/<slug>?qr=<publicId>`, preserving the required menu URL while retaining a stable QR identifier for analytics and future table context.

## Deployment

Configure the root domain and `menu`, `dashboard`, and `admin` wildcard/subdomain records in Vercel. Set `NEXT_PUBLIC_MENU_URL` to the production menu origin. For multi-instance rate limiting, replace the included in-memory limiter with an external store such as Upstash Redis before running multiple server instances.
