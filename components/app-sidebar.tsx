"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  LayoutGrid,
  Building2,
  ShieldCheck,
  NotebookTabs,
  UsersRound,
  BookOpen,
  Calendar,
  UserRoundCheck,
  FileText,
  CalendarDays,
  X,
  DoorOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SoftStatusBadge } from "@/components/dashboard-kit";
import { useAuth } from "@/components/providers/auth-provider";
import { canAccessRoute } from "@/lib/auth";

const navigation = [
  { name: "Departments", href: "/departments", icon: Building2 },
  { name: "Admins", href: "/admins", icon: ShieldCheck },
  { name: "Classes", href: "/classes", icon: NotebookTabs },
  { name: "Students", href: "/students", icon: UsersRound },
  { name: "Rooms", href: "/rooms", icon: DoorOpen },
  { name: "Modules", href: "/modules", icon: BookOpen },
  { name: "Sessions", href: "/sessions", icon: CalendarDays },
  { name: "Schedules", href: "/schedules", icon: Calendar },
  { name: "Attendance", href: "/attendance", icon: UserRoundCheck },
];

export function AppSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const visibleNavigation = navigation.filter((item) => canAccessRoute(user, item.href));
  const initials =
    user?.user?.name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "AU";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-[#140f21]/35 transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-[280px] bg-white transition-transform duration-200 md:w-[300px] lg:w-[320px] xl:w-[340px] 2xl:w-[360px] md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="relative flex min-h-[90px] items-start justify-between items-center px-7 pt-7 pb-4">
            <Link
              href="/"
              className="relative z-10 flex items-center"
              onClick={onClose}
            >
              <span className="font-['Iowan_Old_Style','Palatino_Linotype',Georgia,serif] text-[48px] font-semibold leading-none tracking-[-0.07em] text-[#21243c]">
                Attendo
              </span>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="relative z-10 mt-1 h-9 w-9 rounded-xl md:hidden"
              onClick={onClose}
            >
              <X className="h-9 w-9" />
            </Button>
          </div>

          <div className="relative flex-1 overflow-y-auto bg-[url('/images/sidebar-bg.png')] bg-cover bg-top-left bg-no-repeat">
            <div className="relative z-10 flex h-full flex-col px-5 pt-[60px] text-white">
              <nav className="flex-1">
                <ul className="space-y-[11px]">
                  {visibleNavigation.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                      <li key={item.name} className="w-[200px]">
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex h-[34px] items-center gap-4 rounded-full px-4 text-[14px] font-medium leading-none transition-colors",
                            isActive
                              ? "bg-white text-[#2e2a39] shadow-[0_10px_22px_rgba(0,0,0,0.12)]"
                              : "text-[#fbfaff] hover:bg-white/8",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-[18px] w-[18px] shrink-0",
                              isActive ? "text-[#565063]" : "text-white",
                            )}
                            strokeWidth={1.9}
                          />
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-6 mb-5  mr-4 flex items-center justify-between gap-3 border-t border-white/10 py-5 px-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-[62px] w-[62px] shrink-0 border-2 border-white/20 bg-[#bdc2ff]">
                    <AvatarFallback className="bg-[#bdc2ff] text-[16px] font-medium text-[#3b4264]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-[14px] font-semibold leading-5 text-white"
                      title={user?.user?.name}
                    >
                      {user?.user?.name ?? "User"}
                    </p>
                    <p
                      className="truncate text-[12px] leading-4 text-[#b0aac4]"
                      title={user?.user?.email}
                    >
                      {user?.user?.email ?? "Loading..."}
                    </p>
                    {user?.user?.role ? (
                      <div className="mt-1.5">
                        <SoftStatusBadge
                          tone={
                            user?.user.role === "MANAGER" ? "lavender" : "blue"
                          }
                          className="text-[10px]"
                        >
                          {user?.user.role}
                        </SoftStatusBadge>
                      </div>
                    ) : null}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-lg text-[#fbfaff] transition-all hover:bg-white/10 hover:text-white active:bg-white/15"
                  onClick={() => {
                    onClose();
                    logout();
                  }}
                  title="Sign out of your account"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
