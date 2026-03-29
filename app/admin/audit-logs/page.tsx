"use client";

import { BackLinkButton } from "@/components/back-link-button";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { Navigation } from "@/components/navigation";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuditLogs } from "@/hooks/use-admin";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function AdminAuditLogs() {
  const [action, setAction] = useState("all");
  const [page, setPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [action]);

  const { data, isLoading } = useAdminAuditLogs({
    action: action !== "all" ? action : undefined,
    page,
    pageSize: 50,
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("delete")) return "destructive";
    if (action.includes("update")) return "secondary";
    if (action.includes("create")) return "default";
    return "outline";
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDetails = (details: any) => {
    if (!details) return "-";
    try {
      return JSON.stringify(details, null, 2).slice(0, 100) + (JSON.stringify(details).length > 100 ? "..." : "");
    } catch {
      return "-";
    }
  };

  return (
    <div className="page-shell min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto mobile-page">
        <BackLinkButton href="/admin" aria-label="Back to admin dashboard" className="mb-4">
          Back to Dashboard
        </BackLinkButton>

        <PageHeader
          className="mb-6 md:mb-8"
          title="Audit Logs"
          description={`Track all administrative actions. Total: ${data?.total || 0} entries.`}
        />

        <FilterBar className="mb-4 md:mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger aria-label="Filter by action" className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="user_update">User Update</SelectItem>
                <SelectItem value="user_delete">User Delete</SelectItem>
                <SelectItem value="profile_update">Profile Update</SelectItem>
                <SelectItem value="project_update">Project Update</SelectItem>
                <SelectItem value="project_delete">Project Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterBar>

        {isLoading ? (
          <Card>
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </Card>
        ) : data?.items.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No audit logs found"
            description="Administrative activity will appear here once actions are performed."
          />
        ) : (
          <Card>
            <>
              <div className="divide-y divide-border/50 md:hidden">
                {data?.items.map((log) => (
                  <div key={log.id} className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {formatAction(log.action)}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">{log.targetType}</span>
                    </div>
                    <code className="inline-flex rounded bg-muted px-2 py-1 text-xs">
                      {log.targetId.slice(0, 8)}...
                    </code>
                    <p className="text-sm text-muted-foreground">
                      {formatDetails(log.details)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Target Type</TableHead>
                      <TableHead>Target ID</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.items.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {formatAction(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{log.targetType}</span>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                            {log.targetId.slice(0, 8)}...
                          </code>
                        </TableCell>
                        <TableCell>
                          <span
                            className="block max-w-[200px] truncate text-xs text-muted-foreground"
                            title={formatDetails(log.details)}
                          >
                            {formatDetails(log.details)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          </Card>
        )}

        {/* Pagination */}
        {data && data.total > 50 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {page} of {Math.ceil(data.total / 50)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(data.total / 50)}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
