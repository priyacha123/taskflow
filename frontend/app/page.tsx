import Link from 'next/link'
import { ArrowRight, Check, Users, Kanban, BarChart3, Lock } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
              <Kanban className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-gray-900">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
            <Link href="/register" className="text-sm bg-gray-900 text-white px-3.5 py-1.5 rounded-md hover:bg-gray-700 font-medium">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full mb-6 font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Free to start — no credit card required
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-5 leading-tight tracking-tight">
            Project management<br />
            <span className="text-gray-400">for focused teams.</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">
            Kanban boards, issue tracking, team collaboration, and role-based access — in one clean workspace.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/register" className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-md hover:bg-gray-700 font-medium text-sm">
              Start for free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/login" className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-md hover:bg-gray-50 font-medium text-sm">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Kanban className="w-5 h-5" />, title: 'Kanban boards', desc: 'Drag and drop issues across status columns' },
              { icon: <Users className="w-5 h-5" />, title: 'Team workspaces', desc: 'Invite members with Owner, Admin, or Member roles' },
              { icon: <BarChart3 className="w-5 h-5" />, title: 'Issue tracking', desc: 'Track priority, status, assignee and labels' },
              { icon: <Lock className="w-5 h-5" />, title: 'Role-based access', desc: 'Fine-grained permissions per workspace member' }
            ].map(f => (
              <div key={f.title} className="bg-white p-5 rounded-xl border border-gray-100">
                <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-600 mb-3">
                  {f.icon}
                </div>
                <p className="font-medium text-gray-900 text-sm mb-1">{f.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Simple pricing</h2>
          <p className="text-gray-500">Start free. Upgrade when your team grows.</p>
        </div>
        <div className="max-w-2xl mx-auto grid grid-cols-2 gap-5">
          {[
            {
              name: 'Free', price: '$0', period: 'forever',
              features: ['1 workspace', '5 projects', '10 members', 'Kanban + list view', 'Basic analytics'],
              cta: 'Get started free', highlighted: false
            },
            {
              name: 'Pro', price: '$12', period: 'per month',
              features: ['Unlimited workspaces', 'Unlimited projects', 'Unlimited members', 'Advanced analytics', 'Priority support'],
              cta: 'Start Pro', highlighted: true
            }
          ].map(plan => (
            <div key={plan.name} className={`p-6 rounded-2xl ${plan.highlighted ? 'border-2 border-gray-900' : 'border border-gray-200'}`}>
              <p className="font-semibold text-gray-900 mb-1">{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500 text-sm">/{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`block text-center text-sm font-medium py-2.5 rounded-lg transition-colors ${plan.highlighted ? 'bg-gray-900 text-white hover:bg-gray-700' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-900 rounded flex items-center justify-center">
              <Kanban className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">TaskFlow</span>
          </div>
          <p className="text-xs text-gray-400">Built by Priya Kumari</p>
          <div className="flex gap-4">
            <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600">Sign in</Link>
            <Link href="/register" className="text-xs text-gray-400 hover:text-gray-600">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}