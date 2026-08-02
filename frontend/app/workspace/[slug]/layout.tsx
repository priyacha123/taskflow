"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import {
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
  ChevronsLeft,
} from "lucide-react";
import {
  getUser,
  logout,
  isAuthenticated,
  apiRequest,
  setCurrentWorkspace,
  setWorkspaces,
} from "@/lib/auth";
import Logo from "@/components/Logo";
import Spinner from "@/components/Spinner";

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
    logout();
    router.push("/login");
  };

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
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Spinner />
      </div>
    );

  const isActive = (path: string) => pathname.includes(path);

  const navLinks = [
    {
      href: `/workspace/${slug}/projects`,
      label: "Projects",
      icon: <FolderOpen className="h-4 w-4" />,
    },
    {
      href: `/workspace/${slug}/members`,
      label: "Members",
      icon: <Users className="h-4 w-4" />,
    },
    {
      href: `/workspace/${slug}/settings`,
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      href: `/workspace/${slug}/billing`,
      label: "Billing",
      icon: <CreditCard className="h-4 w-4" />,
    },
  ];

  const navItemClass = (active: boolean, collapsed: boolean) =>
    `flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
      collapsed ? "justify-center" : ""
    } ${
      active
        ? "bg-accent-tint text-accent"
        : "text-muted hover:bg-sand hover:text-ink"
    }`;

  const SidebarContent = () => (
    <>
      {/* Logo + collapse */}
      <div
        className={`flex items-center border-b border-line px-4 py-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <Link href="/" aria-label="TaskFlow home">
            <Logo size={24} />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 text-faint transition-colors hover:bg-sand hover:text-ink"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeft
            className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Workspace switcher */}
      <div className="border-b border-line px-3 py-3">
        <button
          onClick={() => setShowSwitcher(!showSwitcher)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-sand ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? workspace?.name : undefined}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent-tint text-xs font-bold text-accent">
            {workspace?.name?.[0]?.toUpperCase()}
          </span>
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-left text-sm font-semibold text-ink">
                {workspace?.name}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-faint transition-transform ${
                  showSwitcher ? "rotate-180" : ""
                }`}
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
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-sand"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-sand text-xs font-bold text-muted">
                  {ws.name[0].toUpperCase()}
                </span>
                <span className="flex-1 truncate text-left text-xs text-muted">
                  {ws.name}
                </span>
                {ws.slug === slug && <Check className="h-3 w-3 shrink-0 text-accent" />}
              </button>
            ))}
            <button
              onClick={() => {
                setShowSwitcher(false);
                router.push("/new-workspace");
              }}
              className="mt-1 flex w-full items-center gap-2.5 rounded-lg border-t border-line px-2.5 py-1.5 pt-2 transition-colors hover:bg-sand"
            >
              <Plus className="h-4 w-4 text-faint" />
              <span className="text-xs text-muted">New workspace</span>
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={navItemClass(isActive(link.href.split("/").pop()!), collapsed)}
            title={collapsed ? link.label : undefined}
          >
            {link.icon}
            {!collapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Projects quick access */}
      {!collapsed && projects.length > 0 && (
        <div className="px-3 pb-2 pt-1">
          <p className="mb-1.5 px-2.5 text-xs font-semibold uppercase tracking-wide text-faint">
            Projects
          </p>
          <div className="space-y-0.5">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/workspace/${slug}/projects/${project.id}`}
                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                  pathname.includes(project.id)
                    ? "bg-accent-tint text-accent"
                    : "text-muted hover:bg-sand hover:text-ink"
                }`}
              >
                <span className="truncate font-medium">{project.name}</span>
                <span className="ml-2 shrink-0 font-mono text-faint">
                  {project._count?.issues || 0}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* User */}
      <div className="border-t border-line px-3 py-3">
        {!collapsed && (
          <div className="mb-1 flex items-center gap-2.5 px-2.5 py-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-tint text-xs font-bold text-accent">
              {user?.name?.[0]?.toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-ink">{user?.name}</p>
              <p className="truncate text-xs capitalize text-faint">{workspace?.role?.toLowerCase()}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:bg-danger-tint hover:text-danger ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Logo size={22} />
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-1 text-muted hover:bg-sand hover:text-ink"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 top-14 flex w-64 flex-col border-r border-line bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 space-y-0.5 px-3 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={navItemClass(isActive(link.href.split("/").pop()!), false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
            <div className="border-t border-line px-3 py-3">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted hover:bg-danger-tint hover:text-danger"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`fixed z-10 hidden h-full flex-col border-r border-line bg-surface transition-all duration-200 md:flex ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main */}
      <main
        className={`flex-1 pt-14 transition-all duration-200 md:pt-0 ${
          collapsed ? "md:ml-14" : "md:ml-56"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
