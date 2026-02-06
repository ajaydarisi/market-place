"use client";

import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "@/hooks/use-admin";
import { Users, Briefcase, FolderOpen, CheckCircle, Shield, UserCog } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers, icon: Users, href: "/admin/users", color: "text-primary" },
    { title: "Developers", value: stats?.totalDevelopers, icon: UserCog, href: "/admin/users?role=developer", color: "text-accent-foreground" },
    { title: "Clients", value: stats?.totalClients, icon: Users, href: "/admin/users?role=client", color: "text-secondary-foreground" },
    { title: "Admins", value: stats?.totalAdmins, icon: Shield, href: "/admin/users?role=admin", color: "text-primary" },
    { title: "Total Projects", value: stats?.totalProjects, icon: Briefcase, href: "/admin/projects", color: "text-primary" },
    { title: "Open Projects", value: stats?.openProjects, icon: FolderOpen, href: "/admin/projects?status=open", color: "text-status-online" },
    { title: "Completed", value: stats?.completedProjects, icon: CheckCircle, href: "/admin/projects?status=completed", color: "text-status-online" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage users, projects, and platform settings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.href} aria-label={`View ${stat.title}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{stat.value?.toLocaleString() ?? 0}</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/admin/users"
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
                aria-label="Manage users"
              >
                <div className="font-medium">Manage Users</div>
                <div className="text-sm text-muted-foreground">View, edit, or delete user accounts</div>
              </Link>
              <Link
                href="/admin/projects"
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
                aria-label="Manage projects"
              >
                <div className="font-medium">Manage Projects</div>
                <div className="text-sm text-muted-foreground">Review and moderate project listings</div>
              </Link>
              <Link
                href="/admin/audit-logs"
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
                aria-label="View audit logs"
              >
                <div className="font-medium">Audit Logs</div>
                <div className="text-sm text-muted-foreground">View administrative action history</div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>Current platform statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="font-medium">{stats?.totalUsers ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Developer to Client Ratio</span>
                    <span className="font-medium">
                      {stats?.totalClients
                        ? (stats.totalDevelopers / stats.totalClients).toFixed(2)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Project Completion Rate</span>
                    <span className="font-medium">
                      {stats?.totalProjects
                        ? ((stats.completedProjects / stats.totalProjects) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
