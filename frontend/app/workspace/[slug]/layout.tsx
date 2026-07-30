"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import {
  Zap,
  FolderOpen,
  Users,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  Plus,
  Check,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import {
  getUser,
  logout,
  isAuthenticated,
  apiRequest,
  setCurrentWorkspace,
  setWorkspaces,
} from "@/lib/auth";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [user, setUser] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [workspaceList, setWorkspaceList] = useState<any[]>([]);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  const handleLogout = () => {
    logout()
    router.push('/login')
}

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    setUser(getUser());

    const fetch = async () => {
      try {
        const [wsRes, allRes, projRes] = await Promise.all([
          apiRequest(`/workspaces/${slug}`),
          apiRequest("/workspaces"),
          apiRequest(`/workspaces/${slug}/projects`),
        ]);

        if (wsRes.ok) {
          const d = await wsRes.json();
          setWorkspace(d);
          setCurrentWorkspace(d);
        } else {
          router.push("/dashboard");
          return;
        }
        if (allRes.ok) {
          const d = await allRes.json();
          setWorkspaceList(d);
          setWorkspaces(d);
        }
        if (projRes.ok) {
          const d = await projRes.json();
          setProjects(d);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug, router]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const isActive = (path: string) => pathname.includes(path);

  const navLinks = [
    {
      href: `/workspace/${slug}/projects`,
      label: "Projects",
      icon: <FolderOpen className="w-4 h-4" />,
    },
    {
      href: `/workspace/${slug}/members`,
      label: "Members",
      icon: <Users className="w-4 h-4" />,
    },
    {
      href: `/workspace/${slug}/settings`,
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      href: `/workspace/${slug}/billing`,
      label: "Billing",
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo + collapse */}
      <div
        className={`flex items-center px-4 py-4 border-b border-[#30363d] ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-[#e6edf3] text-sm tracking-tight">
              TaskFlow
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#7d8590] hover:text-[#e6edf3] transition-colors p-1 rounded-lg hover:bg-[#30363d]"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Workspace switcher */}
      <div className="px-3 py-3 border-b border-[#30363d]">
        <button
          onClick={() => setShowSwitcher(!showSwitcher)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#30363d]/50 transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-6 h-6 bg-orange-500/20 border border-orange-500/40 rounded-lg flex items-center justify-center text-orange-500 text-xs font-black shrink-0">
            {workspace?.name?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <>
              <span className="text-[#e6edf3] text-sm font-semibold truncate flex-1 text-left">
                {workspace?.name}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#7d8590] transition-transform shrink-0 ${showSwitcher ? "rotate-180" : ""}`}
              />
            </>
          )}
        </button>

        {showSwitcher && !collapsed && (
          <div className="mt-2 space-y-0.5">
            {workspaceList.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setCurrentWorkspace(ws);
                  setShowSwitcher(false);
                  router.push(`/workspace/${ws.slug}/projects`);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-[#30363d]/50 transition-colors"
              >
                <div className="w-5 h-5 bg-[#30363d] rounded flex items-center justify-center text-[#e6edf3] text-xs font-bold shrink-0">
                  {ws.name[0].toUpperCase()}
                </div>
                <span className="text-[#7d8590] text-xs truncate flex-1 text-left">
                  {ws.name}
                </span>
                {ws.slug === slug && (
                  <Check className="w-3 h-3 text-[#238636] shrink-0" />
                )}
              </button>
            ))}
            <button
              onClick={() => {
                setShowSwitcher(false);
                router.push("/new-workspace");
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-[#30363d]/50 transition-colors mt-1 pt-2 border-t border-[#30363d]"
            >
              <Plus className="w-4 h-4 text-[#7d8590]" />
              <span className="text-[#7d8590] text-xs">New workspace</span>
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors ${collapsed ? "justify-center" : ""} ${
              isActive(link.href.split("/").pop()!)
                ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                : "text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#30363d]/50"
            }`}
            title={collapsed ? link.label : undefined}
          >
            {link.icon}
            {!collapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Projects quick access */}
      {!collapsed && projects.length > 0 && (
        <div className="px-3 pt-2 pb-1">
          <p className="text-xs font-semibold text-[#7d8590] uppercase tracking-wide px-2.5 mb-1.5">
            Projects
          </p>
          <div className="space-y-0.5">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/workspace/${slug}/projects/${project.id}`}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                  pathname.includes(project.id)
                    ? "bg-orange-500/10 text-orange-500"
                    : "text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#30363d]/50"
                }`}
              >
                <span className="truncate font-medium">{project.name}</span>
                <span className="text-[#30363d] font-mono ml-2 shrink-0">
                  {project._count?.issues || 0}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* User */}
      <div className="px-3 py-3 border-t border-[#30363d]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
            <div className="w-7 h-7 bg-orange-500/20 border border-orange-500/40 rounded-full flex items-center justify-center text-orange-500 text-xs font-black shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#e6edf3] truncate">
                {user?.name}
              </p>
              <p className="text-xs text-[#7d8590] truncate">
                {workspace?.role}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-sm text-[#7d8590] hover:text-red-400 hover:bg-red-500/10 transition-colors ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] flex">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-black text-[#e6edf3] text-sm">
            {workspace?.name}
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[#7d8590] hover:text-[#e6edf3]"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-14 left-0 bottom-0 w-64 bg-[#161b22] border-r border-[#30363d] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 px-3 py-3 space-y-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.href.split("/").pop()!)
                      ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                      : "text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#30363d]/50"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
            <div className="px-3 py-3 border-t border-[#30363d]">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-sm text-[#7d8590] hover:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed h-full bg-[#161b22] border-r border-[#30363d] transition-all duration-200 z-10 ${collapsed ? "w-14" : "w-56"}`}
      >
        <SidebarContent />
      </aside>

      {/* Main */}
      <main
        className={`flex-1 transition-all duration-200 md:${collapsed ? "ml-14" : "ml-56"} pt-14 md:pt-0`}
      >
        {children}
      </main>
    </div>
  );
}
