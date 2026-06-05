import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  ChevronsLeft,
  Leaf,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile } from "@/lib/profile.functions";

const NAV: { to: string; label: string; icon: typeof CalendarDays; exact?: boolean }[] = [
  { to: "/admin", label: "Agenda", icon: CalendarDays, exact: true },
  { to: "/admin/pacientes", label: "Pacientes", icon: Users },
  { to: "/admin/modelos", label: "Modelos", icon: FileText },
  { to: "/admin/configuracoes", label: "Perfil", icon: Settings },
];

export function AdminShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { data } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(),
  });
  const profile = data?.profile;

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname === to || location.pathname.startsWith(to + "/");

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile topbar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b bg-background">
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2"><Menu className="h-5 w-5" /></button>
        <Brand />
        <div className="w-9" />
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "hidden lg:flex flex-col border-r bg-background sticky top-0 h-screen transition-[width] duration-200",
            collapsed ? "w-[72px]" : "w-64",
          )}
        >
          <SidebarBody
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
            isActive={isActive}
            onSignOut={signOut}
            profile={profile}
          />
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r flex flex-col">
              <SidebarBody
                collapsed={false}
                onToggle={() => setMobileOpen(false)}
                isActive={isActive}
                onSignOut={signOut}
                profile={profile}
                onNavigate={() => setMobileOpen(false)}
              />
            </aside>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Brand({ collapsed }: { collapsed?: boolean } = {}) {
  return (
    <Link to="/admin" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid place-items-center h-8 w-8 rounded-lg bg-foreground text-background shrink-0">
        <Leaf className="h-4 w-4" />
      </span>
      {!collapsed && <span>EasyHealth</span>}
    </Link>
  );
}

type Profile = { full_name?: string | null; logo_url?: string | null; crn?: string | null } | null | undefined;

function SidebarBody({
  collapsed,
  onToggle,
  isActive,
  onSignOut,
  profile,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  isActive: (to: string, exact?: boolean) => boolean;
  onSignOut: () => void;
  profile: Profile;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className={cn("flex items-center h-16 px-4 border-b", collapsed ? "justify-center" : "justify-between")}>
        <Brand collapsed={collapsed} />
        {!collapsed && (
          <button onClick={onToggle} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" aria-label="Recolher">
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>
      {collapsed && (
        <button onClick={onToggle} className="mx-auto my-2 p-1.5 rounded-md hover:bg-muted text-muted-foreground" aria-label="Expandir">
          <Menu className="h-4 w-4" />
        </button>
      )}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to as any}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 h-9 rounded-md text-sm transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className={cn("border-t p-3 flex items-center gap-3", collapsed && "justify-center")}>
        <div className="h-9 w-9 rounded-full bg-muted overflow-hidden grid place-items-center shrink-0">
          {profile?.logo_url ? (
            <img src={profile.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-medium">
              {(profile?.full_name ?? "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
            </span>
          )}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.full_name ?? "Profissional"}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.crn ? `CRN ${profile.crn}` : "Configure seu perfil"}</p>
          </div>
        )}
        {!collapsed && (
          <Button variant="ghost" size="icon" onClick={onSignOut} title="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 pb-6 border-b mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}