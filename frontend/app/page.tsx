import Link from "next/link";
import {
  ArrowRight,
  Columns3,
  Flag,
  Users,
  ShieldCheck,
  List,
  MailPlus,
  Check,
} from "lucide-react";
import Logo from "@/components/Logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* ── Nav ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label="TaskFlow home">
            <Logo />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {[
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="btn btn-ghost hidden sm:inline-flex"
            >
              Sign in
            </Link>
            <Link href="/register" className="btn btn-primary">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="px-6 pb-24 pt-20 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Project management
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            A quieter way
            <br />
            <em className="font-medium text-accent">to ship work.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Kanban boards, issue tracking, and team collaboration — designed to
            get out of your way, not add to it.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn btn-primary btn-lg">
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#features" className="btn btn-secondary btn-lg">
              See features
            </Link>
          </div>
          <p className="mt-4 text-xs text-faint">
            Free forever · no credit card required
          </p>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="mt-3 text-muted">
              Focused tooling for teams that want to move.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Columns3,
                title: "Kanban boards",
                desc: "Drag issues across columns. Visual, fast, and instantly satisfying.",
              },
              {
                icon: Flag,
                title: "Issue tracking",
                desc: "Priority, status, assignee, and labels on every card.",
              },
              {
                icon: Users,
                title: "Team workspaces",
                desc: "Multi-tenant workspaces with Owner, Admin, and Member roles.",
              },
              {
                icon: ShieldCheck,
                title: "Role-based access",
                desc: "Fine-grained permissions. Members only see what they should.",
              },
              {
                icon: List,
                title: "List view",
                desc: "Switch between kanban and a dense list with one click.",
              },
              {
                icon: MailPlus,
                title: "Email invites",
                desc: "Invite teammates by email with role-based access control.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="card group p-6 transition-all hover:border-faint hover:shadow-sm"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-sand text-ink transition-colors group-hover:bg-accent-tint group-hover:text-accent">
                  <f.icon className="h-[18px] w-[18px]" />
                </div>
                <h3 className="mb-1.5 text-[15px] font-semibold text-ink">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────── */}
      <section id="pricing" className="border-y border-line bg-surface px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
              Simple, honest pricing.
            </h2>
            <p className="mt-3 text-muted">Start free. Upgrade when your team grows.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              {
                name: "Starter",
                price: "$0",
                period: "forever",
                features: [
                  "1 workspace",
                  "5 projects",
                  "10 members",
                  "Kanban + list view",
                  "Issue tracking",
                ],
                cta: "Get started free",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$12",
                period: "per month",
                features: [
                  "Unlimited workspaces",
                  "Unlimited projects",
                  "Unlimited members",
                  "Advanced analytics",
                  "Priority support",
                ],
                cta: "Start Pro",
                highlight: true,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`card relative p-7 ${
                  plan.highlight ? "border-accent shadow-sm" : ""
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-7 rounded-md bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                    Popular
                  </span>
                )}
                <p className="text-sm font-semibold text-ink">{plan.name}</p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-semibold tracking-tight text-ink">
                    {plan.price}
                  </span>
                  <span className="text-sm text-faint">/{plan.period}</span>
                </div>
                <ul className="mt-6 mb-8 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-muted">
                      <Check className="h-4 w-4 shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`btn w-full ${plan.highlight ? "btn-primary" : "btn-secondary"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-ink">
            Ready to ship faster?
          </h2>
          <p className="mt-4 mb-8 text-muted">
            Join teams who manage their work with TaskFlow.
          </p>
          <Link href="/register" className="btn btn-primary btn-lg">
            Get started for free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-line px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Logo size={22} />
          <p className="text-xs text-faint">
            Built by Priya Kumari · © 2026 TaskFlow
          </p>
          <div className="flex gap-6">
            {[
              { label: "Sign in", href: "/login" },
              { label: "Register", href: "/register" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs text-faint transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
