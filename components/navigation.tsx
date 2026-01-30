"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { useUser } from "@/hooks/use-users";
import {
  Briefcase,
  LogOut,
  Menu,
  Plus,
  User
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const { user, logout } = useAuth();
  const { data: userData } = useUser(user?.id ?? "");
  const { data: profile } = useProfile(user?.id ?? "");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isClient = profile?.role === "client";

  if (!user) return null;

  const NavLinks = () => (
    <>
      {isClient ? (
        <>
          <Link href="/client/projects" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/client/projects" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            My Projects
          </Link>
          <Link href="/client/messages" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/client/messages" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            Messages
          </Link>
        </>
      ) : (
        <>
          <Link href="/developer/browse" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/developer/browse" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            Browse Jobs
          </Link>
          <Link href="/developer/messages" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/developer/messages" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            My Messages
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-10">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight leading-tight">Market<span className="text-primary">Place</span></span>
              {profile?.role && (
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{profile.role}</span>
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
            <Link href="/client/post">
              <Button size="sm" className="hidden md:flex bg-gradient-to-r from-primary to-primary/80 hover:to-primary/70 shadow-md hover:shadow-lg transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Post Project
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/" onClick={() => setIsOpen(false)} className="text-lg font-medium">Home</Link>
                  <NavLinks />
                  {isClient && (
                    <>
                      <Separator />
                      <Link href="/client/post" onClick={() => setIsOpen(false)}>
                        <Button className="w-full justify-start">
                          <Plus className="mr-2 h-4 w-4" />
                          Post Project
                        </Button>
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-auto rounded-full px-2 py-1 gap-2">
                <span className="hidden sm:inline text-sm font-medium">{userData?.firstName} {userData?.lastName}</span>
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">{userData?.firstName?.[0]}{userData?.lastName?.[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userData?.firstName} {userData?.lastName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="hover:!bg-primary/10 hover:!text-primary cursor-pointer">
                <Link href="/profile" className="w-full flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout()} className="hover:!bg-primary/10 hover:!text-primary cursor-pointer">
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
