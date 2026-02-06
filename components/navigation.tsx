"use client";

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
import {
  Briefcase,
  LogOut,
  Menu,
  Moon,
  Plus,
  Shield,
  Sun,
  User
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const { user, logout } = useAuth();
  const { data: userData } = useUser(user?.id ?? "");
  const { data: profile } = useProfile(user?.id ?? "");
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const isClient = profile?.role === "client";
  const isAdmin = profile?.role === "admin";
  const isDeveloper = profile?.role === "developer";

  if (!user) return null;

  const NavLinks = () => (
    <>
      {isAdmin ? (
        <>
          <Link href="/admin" aria-label="Admin dashboard" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/admin" && !pathname.includes("/admin/") ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            Dashboard
          </Link>
          <Link href="/admin/users" aria-label="Manage users" className={`text-sm font-medium transition-colors hover:text-primary ${pathname.startsWith("/admin/users") ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            Users
          </Link>
          <Link href="/admin/projects" aria-label="Manage projects" className={`text-sm font-medium transition-colors hover:text-primary ${pathname.startsWith("/admin/projects") ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            Projects
          </Link>
          <Link href="/admin/audit-logs" aria-label="Audit logs" className={`text-sm font-medium transition-colors hover:text-primary ${pathname.startsWith("/admin/audit-logs") ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            Audit Logs
          </Link>
        </>
      ) : isClient ? (
        <>
          <Link href="/client/projects" aria-label="My projects" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/client/projects" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            My Projects
          </Link>
          <Link href="/client/messages" aria-label="Messages" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/client/messages" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            Messages
          </Link>
        </>
      ) : isDeveloper ? (
        <>
          <Link href="/developer/browse" aria-label="Browse jobs" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/developer/browse" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            Browse Jobs
          </Link>
          <Link href="/developer/projects" aria-label="My projects" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/developer/projects" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            My Projects
          </Link>
          <Link href="/developer/messages" aria-label="My messages" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/developer/messages" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            My Messages
          </Link>
        </>
      ) : null}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-10">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Go to homepage" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight leading-tight">Market<span className="text-primary">Place</span></span>
              {profile?.role && (
                <span className={`text-[10px] uppercase tracking-widest font-medium ${isAdmin ? "text-primary" : "text-muted-foreground"}`}>
                  {isAdmin && <Shield className="inline h-3 w-3 mr-0.5" />}
                  {profile.role}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isClient && (
            <Link href="/client/post" aria-label="Post a new project">
              <Button size="sm" aria-label="Post project" className="hidden md:flex bg-gradient-to-r from-primary to-primary/80 hover:to-primary/70 shadow-md hover:shadow-lg transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Post Project
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/" aria-label="Home" onClick={() => setIsOpen(false)} className="text-lg font-medium">Home</Link>
                  <NavLinks />
                  {isClient && (
                    <>
                      <Separator />
                      <Link href="/client/post" aria-label="Post a new project" onClick={() => setIsOpen(false)}>
                        <Button aria-label="Post project" className="w-full justify-start">
                          <Plus className="mr-2 h-4 w-4" />
                          Post Project
                        </Button>
                      </Link>
                    </>
                  )}
                  <Separator />
                  <Button variant="ghost" aria-label="Toggle theme" className="justify-start" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" aria-label="User menu" className="relative h-auto rounded-full px-2 py-1 gap-2 min-w-0">
                <span className="hidden sm:inline text-sm font-medium truncate max-w-[300px]" title={`${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`.trim()}>{userData?.firstName} {userData?.lastName}</span>
                <ProfileAvatar
                  name={`${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`}
                  imageUrl={userData?.profileImageUrl}
                  size="md"
                  className="border border-border"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">{userData?.firstName} {userData?.lastName}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate" title={user.email}>
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile" aria-label="View profile" className="w-full flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme" className="cursor-pointer">
                {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} aria-label="Log out" className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
