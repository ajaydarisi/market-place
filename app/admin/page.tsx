"use client";

import { ActionListItem } from "@/components/action-list-item";
import { MetricCard } from "@/components/metric-card";
import { Navigation } from "@/components/navigation";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "@/hooks/use-admin";
import { Users, Briefcase, FolderOpen, CheckCircle, Shield, UserCog, MessageSquare, TimerReset, Star } from "lucide-react";

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
    { title: "With Proposals", value: stats?.projectsWithProposals, icon: MessageSquare, href: "/admin/projects", color: "text-primary" },
    { title: "Assigned", value: stats?.assignedProjects, icon: Briefcase, href: "/admin/projects?status=in_progress", color: "text-primary" },
    { title: "Avg Time to First Proposal", value: stats ? `${stats.avgTimeToFirstProposalHours}h` : undefined, icon: TimerReset, href: "/admin/projects", color: "text-accent-foreground" },
    { title: "Review Submission Rate", value: stats ? `${stats.reviewSubmissionRate}%` : undefined, icon: Star, href: "/admin/projects?status=completed", color: "text-accent-foreground" },
  ];

  return (
    <div className="page-shell min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto mobile-page">
        <PageHeader
          className="mb-6 md:mb-8"
          title="Admin Dashboard"
          description="Manage users, projects, and platform settings with one consistent control surface."
        />

        <div className="mb-6 grid grid-cols-1 gap-4 md:mb-8 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {statCards.map((stat) => (
            <MetricCard
              key={stat.title}
              href={stat.href}
              title={stat.title}
              value={typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value ?? 0}
              icon={stat.icon}
              iconClassName={stat.color}
              loading={isLoading}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <SectionCard
            title="Quick Actions"
            description="Common administrative tasks"
            contentClassName="space-y-2"
          >
            <ActionListItem
              href="/admin/users"
              ariaLabel="Manage users"
              icon={Users}
              title="Manage Users"
              description="View, edit, or delete user accounts."
            />
            <ActionListItem
              href="/admin/projects"
              ariaLabel="Manage projects"
              icon={Briefcase}
              title="Manage Projects"
              description="Review and moderate project listings."
            />
            <ActionListItem
              href="/admin/audit-logs"
              ariaLabel="View audit logs"
              icon={Shield}
              title="Audit Logs"
              description="Inspect administrative action history."
            />
          </SectionCard>

          <SectionCard title="Platform Overview" description="Current platform statistics">
            <div>
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
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Projects with proposals</span>
                    <span className="font-medium">{stats?.projectsWithProposals ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Assigned projects</span>
                    <span className="font-medium">{stats?.assignedProjects ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Avg time to first proposal</span>
                    <span className="font-medium">{stats?.avgTimeToFirstProposalHours ?? 0}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Review submission rate</span>
                    <span className="font-medium">{stats?.reviewSubmissionRate ?? 0}%</span>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
