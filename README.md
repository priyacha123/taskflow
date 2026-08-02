# TaskFlow

A multi-tenant project management SaaS with kanban boards, issue tracking, role-based access control, and Stripe billing.

**Live:** https://your-frontend.vercel.app  
**API:** https://your-backend.railway.app  
**Demo login:** owner@demo.com / demo123456

---

## What's in this repo

```
taskflow/
├── backend/     Express API — auth, workspaces, projects, issues, billing
└── frontend/    Next.js app — kanban, issue tracking, workspace management
```

---

## The multi-tenancy model

Every workspace is an isolated tenant. Users in Workspace A never see data from Workspace B — enforced at the query level via `workspaceId` on every tenant-scoped table. This is row-level isolation — one database, many tenants.

```
User
  ↓ WorkspaceMember (role: OWNER / ADMIN / MEMBER)
Workspace
  ↓
Project   (workspaceId)
  ↓
Issue     (workspaceId + projectId)
  ↓
Comment
```

---

## Role-based access

| Role | What they can do |
|---|---|
| OWNER | Everything — billing, delete workspace, change any role |
| ADMIN | Manage members and projects, cannot touch billing |
| MEMBER | Work on issues, cannot manage workspace settings |

Enforced via two middlewares chained on every workspace route: `workspaceMiddleware` (verifies membership + attaches `req.workspace`) → `requireRole(...roles)` (checks role before sensitive operations).

---

## Kanban position algorithm

Issue ordering uses float positions. When you drag an issue between two others:

```
Before: [1.0]  [2.0]
Insert between: (1.0 + 2.0) / 2 = 1.5
After:  [1.0]  [1.5]  [2.0]
```

No re-numbering needed on every move. Progressively subdivides indefinitely. This is the LexoRank pattern used by Linear, Jira, and Trello.

---

## Plan limits

| | Free | Pro |
|---|---|---|
| Workspaces | 1 | Unlimited |
| Projects | 5 | Unlimited |
| Members | 10 | Unlimited |
| Price | $0 | $12/month |

Limits enforced at the API layer — not just the frontend. Hitting a limit returns `403` with an upgrade message regardless of how the request is made.

---

## Tech stack

**Backend** — Node.js, Express, PostgreSQL, Prisma 5, JWT, bcrypt, Stripe, Resend  
**Frontend** — Next.js 15, TypeScript, Tailwind CSS, @hello-pangea/dnd  
**Infrastructure** — Railway (API), Vercel (frontend), Neon (PostgreSQL)

---

## Local setup

**Prerequisites:** Node.js v18+, Neon account, Stripe test account, Resend account

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# fill in all values — see Environment variables below
npx prisma migrate dev
node scripts/seed.js    # optional demo data
npm run dev             # runs on port 4000
```

**Frontend:**
```bash
cd frontend
npm install
# create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
npm run dev             # runs on port 3000
```

---

## Environment variables

**backend/.env**

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Any long random string — signs 7-day JWTs |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_` for dev) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_`) |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID for Pro plan (`price_`) |
| `RESEND_API_KEY` | Resend API key for invitation emails |
| `FRONTEND_URL` | Frontend URL for CORS and Stripe redirect URLs |
| `PORT` | Server port (default 4000) |

**frontend/.env.local**

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL |

---

## Deployment

**Backend → Railway**
- Connect GitHub repo → set Root Directory to `backend`
- Add all environment variables from the table above
- Railway auto-deploys on every push to main

**Frontend → Vercel**
- Connect GitHub repo → set Root Directory to `frontend`
- Add `NEXT_PUBLIC_API_URL` pointing to Railway URL
- Vercel auto-deploys on every push to main

**Stripe webhooks (production)**
- Stripe dashboard → Developers → Webhooks → Add endpoint
- URL: `https://your-railway-url.up.railway.app/webhook/stripe`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## Demo accounts

| Email | Password | Role |
|---|---|---|
| owner@demo.com | demo123456 | OWNER |
| member@demo.com | demo123456 | MEMBER |

Both accounts belong to `demo-workspace` with 10 seeded issues across all statuses.

---
