"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Shield,
  User,
} from "lucide-react";
import {
  AppearanceInlineSelector,
  AppearanceMenuItems,
} from "@/components/appearance-selector";
import { Logo } from "@/components/logo";
import { ActionListItem } from "@/components/action-list-item";
import { NotificationBell } from "@/components/notification-bell";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { useUser } from "@/hooks/use-users";
import { cn } from "@/lib/utils";

type MobileTab = {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onSelect?: () => void;
  testId: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  testId: string;
};

function getMobileTitle(pathname: string) {
  if (pathname.startsWith("/client/post")) return "Post Project";
  if (pathname.startsWith("/client/messages") || pathname.startsWith("/developer/messages")) return "Messages";
  if (pathname.startsWith("/client/projects") || pathname.startsWith("/developer/projects")) return "My Projects";
  if (pathname.startsWith("/developer/browse")) return "Browse Jobs";
  if (pathname.startsWith("/admin/audit-logs")) return "Audit Logs";
  if (pathname.startsWith("/admin/users")) return "Users";
  if (pathname.startsWith("/admin/projects")) return "Projects";
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/projects/")) return "Project Details";
  if (pathname.startsWith("/profile")) return "Profile";
  return "SkillPilot";
}

export function Navigation() {
  const { user, logout } = useAuth();
  const { data: userData } = useUser(user?.id ?? "");
  const { data: profile } = useProfile(user?.id ?? "");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isClient = profile?.role === "client";
  const isAdmin = profile?.role === "admin";
  const isDeveloper = profile?.role === "developer";

  useEffect(() => {
    document.body.classList.add("has-mobile-nav", "has-fixed-header");
    return () => {
      document.body.classList.remove("has-mobile-nav", "has-fixed-header");
    };
  }, []);

  if (!user) return null;

  const homeHref = isAdmin ? "/admin" : isClient ? "/client/projects" : isDeveloper ? "/developer/browse" : "/";
  const mobileTitle = getMobileTitle(pathname);
  const roleLabel = profile?.role ? `${profile.role} workspace` : "Account";

  const navLinkClass = (isActive: boolean) =>
    cn(
      "h-auto rounded-full border-transparent px-3.5 py-2 text-sm font-medium shadow-none transition-all duration-300",
      isActive
        ? "bg-primary/[0.08] text-foreground ring-1 ring-primary/10"
        : "text-muted-foreground hover:bg-secondary/55 hover:text-foreground"
    );

  const navItems: NavItem[] = isAdmin
    ? [
        {
          href: "/admin",
          label: "Dashboard",
          icon: Shield,
          active: pathname === "/admin" && !pathname.includes("/admin/"),
          testId: "nav-dashboard-link",
        },
        {
          href: "/admin/users",
          label: "Users",
          icon: User,
          active: pathname.startsWith("/admin/users"),
          testId: "nav-users-link",
        },
        {
          href: "/admin/projects",
          label: "Projects",
          icon: Briefcase,
          active: pathname.startsWith("/admin/projects"),
          testId: "nav-projects-link",
        },
        {
          href: "/admin/audit-logs",
          label: "Audit Logs",
          icon: Shield,
          active: pathname.startsWith("/admin/audit-logs"),
          testId: "nav-audit-logs-link",
        },
      ]
    : isClient
      ? [
          {
            href: "/client/projects",
            label: "My Projects",
            icon: Briefcase,
            active: pathname === "/client/projects" || pathname.startsWith("/projects/"),
            testId: "nav-projects-link",
          },
          {
            href: "/client/messages",
            label: "Messages",
            icon: MessageSquare,
            active: pathname === "/client/messages",
            testId: "nav-messages-link",
          },
        ]
      : isDeveloper
        ? [
            {
              href: "/developer/browse",
              label: "Browse Jobs",
              icon: Search,
              active: pathname === "/developer/browse",
              testId: "nav-browse-link",
            },
            {
              href: "/developer/projects",
              label: "My Projects",
              icon: Briefcase,
              active: pathname === "/developer/projects" || pathname.startsWith("/projects/"),
              testId: "nav-projects-link",
            },
            {
              href: "/developer/messages",
              label: "My Messages",
              icon: MessageSquare,
              active: pathname === "/developer/messages",
              testId: "nav-messages-link",
            },
          ]
        : [];

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Button
          key={item.href}
          asChild
          variant="ghost"
          size="sm"
          className={navLinkClass(item.active)}
          data-testid={item.testId}
        >
          <Link href={item.href} aria-label={item.label}>
            {item.label}
          </Link>
        </Button>
      ))}
    </>
  );

  const mobileTabs: MobileTab[] = isAdmin
    ? [
        {
          href: "/admin",
          label: "Dashboard",
          icon: Shield,
          active: pathname === "/admin",
          testId: "mobile-nav-dashboard",
        },
        {
          href: "/admin/users",
          label: "Users",
          icon: User,
          active: pathname.startsWith("/admin/users"),
          testId: "mobile-nav-users",
        },
        {
          href: "/admin/projects",
          label: "Projects",
          icon: Briefcase,
          active: pathname.startsWith("/admin/projects"),
          testId: "mobile-nav-projects",
        },
        {
          label: "More",
          icon: Menu,
          active: pathname.startsWith("/admin/audit-logs") || pathname.startsWith("/profile"),
          onSelect: () => setIsOpen(true),
          testId: "mobile-nav-more",
        },
      ]
    : isClient
      ? [
          {
            href: "/client/projects",
            label: "Projects",
            icon: Briefcase,
            active: pathname === "/client/projects" || pathname.startsWith("/projects/"),
            testId: "mobile-nav-projects",
          },
          {
            href: "/client/post",
            label: "Post",
            icon: Plus,
            active: pathname.startsWith("/client/post"),
            testId: "mobile-nav-post",
          },
          {
            href: "/client/messages",
            label: "Messages",
            icon: MessageSquare,
            active: pathname.startsWith("/client/messages"),
            testId: "mobile-nav-messages",
          },
          {
            href: "/profile",
            label: "Profile",
            icon: User,
            active: pathname.startsWith("/profile"),
            testId: "mobile-nav-profile",
          },
        ]
      : isDeveloper
        ? [
            {
              href: "/developer/browse",
              label: "Browse",
              icon: Search,
              active: pathname.startsWith("/developer/browse"),
              testId: "mobile-nav-browse",
            },
            {
              href: "/developer/projects",
              label: "Projects",
              icon: Briefcase,
              active: pathname.startsWith("/developer/projects") || pathname.startsWith("/projects/"),
              testId: "mobile-nav-projects",
            },
            {
              href: "/developer/messages",
              label: "Messages",
              icon: MessageSquare,
              active: pathname.startsWith("/developer/messages"),
              testId: "mobile-nav-messages",
            },
            {
              href: "/profile",
              label: "Profile",
              icon: User,
              active: pathname.startsWith("/profile"),
              testId: "mobile-nav-profile",
            },
          ]
        : [];

  const closeAndLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <header
          data-testid="navigation"
          className="fixed top-0 z-40 w-full border-b border-border/55 bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/78"
        >
          <div className="container mx-auto hidden h-20 items-center justify-between gap-4 px-4 md:flex">
            <div className="flex items-center gap-8">
              <Link href={homeHref} aria-label="Go to workspace home" className="flex items-center space-x-3" data-testid="nav-logo-link">
                <Logo iconSize="h-6 w-6" textSize="text-xl" />
                {profile?.role && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.22em] ml-2",
                      isAdmin 
                        ? "border-pastel-lavender/40 bg-pastel-lavender/10 text-pastel-lavender" 
                        : "border-border/60 bg-secondary/55 text-muted-foreground"
                    )}
                  >
                    {isAdmin && <Shield className="mr-0.5 inline h-3 w-3" />}
                    {profile.role}
                  </span>
                )}
              </Link>

              <nav className="flex items-center gap-2">
                <NavLinks />
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {isClient && (
                <Button
                  asChild
                  size="sm"
                  aria-label="Post project"
                  data-testid="nav-post-project-button"
                >
                  <Link href="/client/post" aria-label="Post a new project">
                    <Plus className="mr-2 h-4 w-4" />
                    Post Project
                  </Link>
                </Button>
              )}

              <NotificationBell userId={user.id} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    aria-label="User menu"
                    className="relative h-auto min-w-0 gap-2 rounded-full border border-border px-2.5 py-1.5"
                    data-testid="nav-user-menu-trigger"
                  >
                    <span
                      className="hidden max-w-[300px] truncate text-sm font-medium sm:inline"
                      title={`${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`.trim()}
                    >
                      {userData?.firstName} {userData?.lastName}
                    </span>
                    <ProfileAvatar
                      name={`${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`}
                      imageUrl={userData?.profileImageUrl}
                      size="md"
                      className="border border-border"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="truncate text-sm font-medium leading-none">{userData?.firstName} {userData?.lastName}</p>
                      <p className="truncate text-xs leading-none text-muted-foreground" title={user.email}>
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer" data-testid="nav-profile-link">
                    <Link href="/profile" aria-label="View profile" className="flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AppearanceMenuItems className="pb-1" />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} aria-label="Log out" className="cursor-pointer" data-testid="nav-logout-button">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="safe-top md:hidden">
            <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  href={homeHref}
                  aria-label="Go to workspace home"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
                >
                  <Briefcase className="h-6 w-6" />
                </Link>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{mobileTitle}</p>
                  <p className="truncate text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    {roleLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
              <NotificationBell userId={user.id} />
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open account menu"
                  className="shrink-0 border border-border"
                  data-testid="nav-mobile-account-trigger"
                >
                  <ProfileAvatar
                    name={`${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`}
                    imageUrl={userData?.profileImageUrl}
                    size="sm"
                  />
                </Button>
              </SheetTrigger>
              </div>
            </div>
          </div>
        </header>

        <SheetContent side="bottom" className="rounded-t-[1.9rem] border-border/70 px-5 pb-[calc(var(--safe-area-bottom)+1.1rem)] pt-8 md:hidden">
          <SheetTitle className="sr-only">Account menu</SheetTitle>
          <div className="mb-5 flex items-center gap-3">
            <ProfileAvatar
              name={`${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`}
              imageUrl={userData?.profileImageUrl}
              size="lg"
              className="border border-border"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{userData?.firstName} {userData?.lastName}</p>
              <p className="truncate text-sm text-muted-foreground" title={user.email}>{user.email}</p>
            </div>
          </div>

          <div className="mobile-stack">
            {isAdmin && (
              <>
                <ActionListItem
                  href="/admin/audit-logs"
                  ariaLabel="View audit logs"
                  onClick={() => setIsOpen(false)}
                  icon={Shield}
                  title="Audit Logs"
                  description="Review the latest administrative activity."
                  className="rounded-2xl"
                />
                <Separator />
              </>
            )}

            {!isAdmin && (
              <>
                <ActionListItem
                  href="/profile"
                  ariaLabel="View profile"
                  onClick={() => setIsOpen(false)}
                  icon={User}
                  title="Profile"
                  description="Manage your account, portfolio, and availability."
                  className="rounded-2xl"
                />
                <Separator />
              </>
            )}

            <div className="rounded-[1.4rem] border border-border/60 p-3">
              <div className="mb-3 px-1">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  Appearance
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose how SkillPilot looks on this device.
                </p>
              </div>
              <AppearanceInlineSelector />
            </div>

            <Button variant="ghost" aria-label="Log out" className="w-full justify-between text-destructive" onClick={closeAndLogout}>
              <span>Log out</span>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {mobileTabs.length > 0 && (
        <nav className="safe-x safe-bottom bottom-nav-blur fixed inset-x-0 bottom-0 z-50 border-t border-border/70 md:hidden" data-testid="mobile-bottom-nav">
          <div className="mx-auto flex max-w-xl items-center gap-1 px-3 pb-3 pt-2">
            {mobileTabs.map((tab) => {
              const content = (
                <>
                  <tab.icon className={cn("h-[1.15rem] w-[1.15rem]", tab.active ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("truncate text-[11px] font-medium", tab.active ? "text-foreground" : "text-muted-foreground")}>
                    {tab.label}
                  </span>
                </>
              );

              if (tab.href) {
                return (
                  <Button
                    key={tab.label}
                    asChild
                    variant="ghost"
                    className={cn(
                      "h-auto min-h-[3.6rem] flex-1 flex-col gap-1 rounded-[1.15rem] border-transparent px-2 text-center shadow-none",
                      tab.active ? "bg-primary/[0.08] ring-1 ring-primary/10" : "hover:bg-secondary/55"
                    )}
                    aria-label={tab.label}
                    data-testid={tab.testId}
                  >
                    <Link
                      href={tab.href}
                      aria-label={tab.label}
                    >
                      {content}
                    </Link>
                  </Button>
                );
              }

              return (
                <Button
                  key={tab.label}
                  type="button"
                  variant="ghost"
                  className={cn(
                    "h-auto min-h-[3.6rem] flex-1 flex-col gap-1 rounded-[1.15rem] border-transparent px-2 text-center shadow-none",
                    tab.active ? "bg-primary/[0.08] ring-1 ring-primary/10" : "hover:bg-secondary/55"
                  )}
                  aria-label={tab.label}
                  data-testid={tab.testId}
                  onClick={tab.onSelect}
                >
                  {content}
                </Button>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
