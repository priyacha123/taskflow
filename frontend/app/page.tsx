import Link from 'next/link'
import { ArrowRight, Zap, Shield, Users, BarChart3, Check, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">

      {/* Nav */}
      <nav className="border-b border-[#30363d] px-6 py-4 sticky top-0 bg-[#0d1117]/95 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#e6edf3] text-lg tracking-tight">TaskFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Pricing', 'Docs'].map(item => (
              <Link key={item} href={`/${item.toLowerCase()}`}
                className="text-sm text-[#7d8590] hover:text-[#e6edf3] transition-colors">
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#7d8590] hover:text-[#e6edf3] transition-colors">
              Sign in
            </Link>
            <Link href="/register"
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#161b22] border border-[#30363d] text-[#7d8590] text-xs px-4 py-2 rounded-full mb-8 font-medium">
            <Star className="w-3.5 h-3.5 text-orange-500" />
            Built for developers, by developers
          </div>

          <h1 className="text-6xl font-black text-[#e6edf3] mb-6 leading-[1.05] tracking-tight">
            Ship faster.<br />
            <span className="text-orange-500">Stay organized.</span>
          </h1>

          <p className="text-xl text-[#7d8590] mb-10 leading-relaxed max-w-xl mx-auto">
            Project management that gets out of your way. Kanban boards, issue tracking, and team collaboration — all in one dark workspace.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-full transition-colors text-sm">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 border border-[#30363d] text-[#e6edf3] hover:bg-[#161b22] font-semibold px-8 py-3.5 rounded-full transition-colors text-sm">
              Sign in
            </Link>
          </div>

          <p className="text-xs text-[#7d8590] mt-4">No credit card required · Free forever on starter plan</p>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center text-[#e6edf3] mb-3 tracking-tight">
            Everything your team needs
          </h2>
          <p className="text-center text-[#7d8590] mb-12">Built for speed. Designed for focus.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Zap className="w-5 h-5 text-orange-500" />, title: 'Kanban boards', desc: 'Drag and drop issues across columns. Visual, fast, and intuitive.', color: 'border-orange-500/20 hover:border-orange-500/50' },
              { icon: <Users className="w-5 h-5 text-[#238636]" />, title: 'Team workspaces', desc: 'Multi-tenant with Owner, Admin, and Member roles per workspace.', color: 'border-[#238636]/20 hover:border-[#238636]/50' },
              { icon: <Shield className="w-5 h-5 text-blue-400" />, title: 'Role-based access', desc: 'Fine-grained permissions. Members only see what they should.', color: 'border-blue-400/20 hover:border-blue-400/50' },
              { icon: <BarChart3 className="w-5 h-5 text-purple-400" />, title: 'Issue tracking', desc: 'Priority, status, assignee, labels — track everything that matters.', color: 'border-purple-400/20 hover:border-purple-400/50' },
              { icon: <Zap className="w-5 h-5 text-yellow-400" />, title: 'List + board views', desc: 'Switch between kanban and list view with one click.', color: 'border-yellow-400/20 hover:border-yellow-400/50' },
              { icon: <Shield className="w-5 h-5 text-pink-400" />, title: 'Invite system', desc: 'Invite teammates via email with role-based access control.', color: 'border-pink-400/20 hover:border-pink-400/50' },
            ].map(f => (
              <div key={f.title} className={`bg-[#161b22] border rounded-2xl p-6 transition-all ${f.color}`}>
                <div className="w-10 h-10 bg-[#0d1117] rounded-xl flex items-center justify-center mb-4 border border-[#30363d]">
                  {f.icon}
                </div>
                <h3 className="font-bold text-[#e6edf3] mb-2">{f.title}</h3>
                <p className="text-sm text-[#7d8590] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-[#161b22]">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-black text-[#e6edf3] mb-3 tracking-tight">Simple pricing</h2>
          <p className="text-[#7d8590]">Start free. Upgrade when your team grows.</p>
        </div>

        <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              name: 'Starter', price: '$0', period: 'forever',
              features: ['1 workspace', '5 projects', '10 members', 'Kanban + list view', 'Issue tracking'],
              cta: 'Get started free', highlight: false
            },
            {
              name: 'Pro', price: '$12', period: 'per month',
              features: ['Unlimited workspaces', 'Unlimited projects', 'Unlimited members', 'Advanced analytics', 'Priority support'],
              cta: 'Start Pro', highlight: true
            }
          ].map(plan => (
            <div key={plan.name} className={`rounded-2xl p-7 border ${plan.highlight ? 'border-orange-500 bg-[#0d1117]' : 'border-[#30363d] bg-[#0d1117]'}`}>
              {plan.highlight && (
                <div className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                  Most popular
                </div>
              )}
              <p className="font-bold text-[#e6edf3] mb-1">{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-black text-[#e6edf3]">{plan.price}</span>
                <span className="text-[#7d8590] text-sm">/{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#7d8590]">
                    <Check className="w-4 h-4 text-[#238636] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className={`block text-center text-sm font-bold py-3 rounded-full transition-colors ${plan.highlight ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border border-[#30363d] text-[#e6edf3] hover:bg-[#161b22]'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-[#e6edf3] mb-4 tracking-tight">
            Ready to ship faster?
          </h2>
          <p className="text-[#7d8590] mb-8">Join teams who manage their work with TaskFlow.</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-full transition-colors">
            Get started for free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-[#e6edf3] text-sm">TaskFlow</span>
          </div>
          <p className="text-xs text-[#7d8590]">Built by Priya Kumari · © 2026 TaskFlow</p>
          <div className="flex gap-6">
            {['Sign in', 'Register'].map(item => (
              <Link key={item} href={`/${item.toLowerCase().replace(' ', '')}`}
                className="text-xs text-[#7d8590] hover:text-[#e6edf3] transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}