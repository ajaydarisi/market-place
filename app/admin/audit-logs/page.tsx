"use client";

import { Navigation } from "@/components/navigation";
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
        <Link
          href="/admin"
          aria-label="Back to admin dashboard"
          className="surface-glass mb-4 inline-flex items-center rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="surface-glass mobile-panel mb-6 border-primary/10 md:mb-8">
          <h1 className="mobile-section-title">Audit Logs</h1>
          <p className="mobile-copy mt-2">
            Track all administrative actions. Total: {data?.total || 0} entries.
          </p>
        </div>

        <Card className="mb-4 p-4 md:mb-6">
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
        </Card>

        <Card>
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
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
                {data?.items.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No audit logs found</p>
                      <p className="text-sm text-muted-foreground">
                        Admin actions will appear here once performed.
                      </p>
                    </div>
                  </div>
                )}
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
                    {data?.items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No audit logs found</p>
                            <p className="text-sm text-muted-foreground">
                              Admin actions will appear here once performed.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </Card>

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
