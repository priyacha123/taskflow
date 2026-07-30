# TaskFlow — Multi-tenant Project Management SaaS

A full-stack multi-tenant SaaS project management tool with kanban boards, issue tracking, role-based access control, and Stripe billing.

**Live:** https://your-frontend.vercel.app
**API:** https://your-backend.railway.app
**Demo:** owner@demo.com / demo123456

---

## What is multi-tenancy?

One app, one database, multiple isolated teams (tenants). Every workspace is a tenant. Users in Workspace A can never see data from Workspace B — enforced at the query level via `workspaceId` on every tenant-scoped table.

```
User
  ↓ (WorkspaceMember with role)
Workspace ← tenant
  ↓
Project (workspaceId)
  ↓
Issue (workspaceId + projectId)
  ↓
Comment
```

---

## Architecture

```
Next.js Frontend (Vercel)
  ↓
Express Backend (Railway)
  ↓
PostgreSQL (Neon) + Stripe webhooks
```

---

## Role-based access (RBAC)

| Role | Permissions |
|---|---|
| OWNER | Full control — delete workspace, manage billing, change any role |
| ADMIN | Manage members and projects, cannot touch billing or delete workspace |
| MEMBER | Work on issues, view projects, cannot manage workspace |

Enforced via `workspaceMiddleware` (verifies membership) + `requireRole(...roles)` on sensitive routes.

---

## Kanban position algorithm

Issue ordering uses float positions with midpoint insertion (LexoRank pattern):

- Issue at position 1.0, next at 2.0
- Insert between them: `(1.0 + 2.0) / 2 = 1.5`
- No re-numbering needed on every drag

---

## Plan limits

| Feature | Free | Pro |
|---|---|---|
| Workspaces | 1 | Unlimited |
| Projects | 5 | Unlimited |
| Members | 10 | Unlimited |
| Price | $0 | $12/month |

---

## Tech stack

**Backend:** Node.js, Express, PostgreSQL, Prisma, JWT, bcrypt, Stripe, Resend
**Frontend:** Next.js, TypeScript, Tailwind CSS, @hello-pangea/dnd
**Infrastructure:** Railway, Vercel, Neon, Stripe

---

## Local setup

```bash
git clone https://github.com/priyacha123/taskflow-backend
cd taskflow-backend
npm install
cp .env.example .env
# fill in DATABASE_URL, JWT_SECRET, STRIPE keys, RESEND_API_KEY
npx prisma migrate dev
node scripts/seed.js
npm run dev
```

```bash
git clone https://github.com/priyacha123/taskflow-frontend
cd taskflow-frontend
npm install
# create .env.local with NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev
```

---

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWT tokens (7 day expiry) |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_ for dev) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID for Pro plan |
| `RESEND_API_KEY` | Resend API key for invitation emails |
| `FRONTEND_URL` | Frontend URL for CORS and redirect URLs |